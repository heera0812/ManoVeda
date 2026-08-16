"""
Wellness Check-in Chatbot — Backend
------------------------------------
Flask server that:
  1. Starts a check-in session and returns Aria's opening question.
  2. Accepts a voice recording, transcribes it with Groq's free Whisper API,
     sends the growing conversation to Google's free Gemini API, and
     returns either the next question or the final structured assessment.

Run:  python app.py   (see README / setup instructions for full steps)
"""

import os
import random
import uuid
import traceback
from datetime import datetime, timezone

import requests
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv

from groq import Groq
from google import genai
from google.genai import types
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

try:
    from supabase import create_client
except ImportError:  # pragma: no cover - optional dependency
    create_client = None

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

load_dotenv()  # reads GROQ_API_KEY and GEMINI_API_KEY from a local .env file

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
SUPABASE_TABLE = os.environ.get("SUPABASE_TABLE", "chat_logs")

if not GROQ_API_KEY or not GEMINI_API_KEY:
    raise RuntimeError(
        "Missing API keys. Create a .env file with "
        "GROQ_API_KEY and GEMINI_API_KEY set."
    )

groq_client = Groq(api_key=GROQ_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

sentiment_analyzer = SentimentIntensityAnalyzer()
supabase_client = None

if SUPABASE_URL and SUPABASE_KEY and create_client:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Use the model name you want to target. If it becomes unavailable,
# the fallback list is still kept as a safety net.
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
GEMINI_FALLBACK_MODELS = [
    "gemini-3.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

# Free-tier friendly, fast Whisper model on Groq. Check
# https://console.groq.com/docs/models if this is ever deprecated.
GROQ_WHISPER_MODEL = "whisper-large-v3-turbo"

app = Flask(__name__)
CORS(app)  # allow the static frontend (served from a different port/origin) to call this API

# ---------------------------------------------------------------------------
# In-memory conversation state
# ---------------------------------------------------------------------------
# NOTE: This is a simple dict living in server RAM, keyed by a random
# session_id the frontend keeps and sends back on every request. It's
# perfect for a local student project / demo. It is NOT persistent
# (resets on server restart) and won't work across multiple server
# processes/workers. For production, replace this with Redis or a
# database table keyed by session_id.
SESSIONS = {}
TOTAL_QUESTIONS = 5
CHAT_QUESTIONS = [
    "Tell me what has been on your mind lately.",
    "What has been feeling heavy or comforting in your day so far?",
    "What kind of support would feel most helpful right now?",
    "How are you taking care of yourself lately?",
    "What would make today feel a little lighter for you?",
]
CHAT_FOLLOWUP_QUESTIONS = [
    "What feels like the biggest weight on you right now?",
    "What is one small thing that would make this moment feel a bit easier?",
    "How have you been coping with everything lately?",
    "What part of your day feels most draining at the moment?",
    "What is something that has felt reassuring or grounding recently?",
    "What would you like more of right now, comfort, clarity, or support?",
    "What is one thing you wish other people understood about how you are feeling?",
    "What has been helping you feel a little more like yourself lately?",
]
GREETING_TEXT = "It is so wonderful to meet you."
ASSESSMENT_BANK = {
    "mood": [
        "How has your mood been feeling lately?",
        "What is your mood like most of the time recently?",
        "Have you felt more low, flat, or overwhelmed than usual?",
        "How would you describe your emotional energy lately?",
        "When you think about your mood, what stands out most?",
    ],
    "stress": [
        "What has been causing you the most stress recently?",
        "How overwhelmed do you usually feel by responsibilities or demands?",
        "What part of your life feels most tense right now?",
        "How often do you feel like you cannot catch a break?",
        "What situations tend to make your stress feel strongest?",
    ],
    "anxiety": [
        "How anxious or tense have you been feeling lately?",
        "Do you notice racing thoughts, worry, or nervousness during the day?",
        "When anxiety shows up, what tends to trigger it?",
        "How hard is it to relax when you are feeling anxious?",
        "What does anxiety feel like in your body right now?",
    ],
    "depression": [
        "How have you been feeling emotionally lately, including sadness or low mood?",
        "Have you been feeling more hopeless, withdrawn, or disconnected than usual?",
        "What has your mood been like when you wake up in the morning?",
        "How often do you feel down or emotionally drained lately?",
        "What changes in your energy or interest have stood out recently?",
    ],
    "loneliness": [
        "How connected or alone have you been feeling lately?",
        "Do you feel emotionally supported by the people around you?",
        "When you feel lonely, what usually happens inside you?",
        "How often do you feel unseen or disconnected from others?",
        "What do you wish you had more of in your relationships right now?",
    ],
    "wellness": [
        "Overall, how have you been feeling day to day — good, fair, or bad?",
        "What does a healthy day look like for you right now?",
        "How well do you feel you are managing your daily wellbeing?",
        "What has been helping you feel a little more grounded lately?",
        "How does your body usually feel when you are doing well or struggling?",
    ],
}

ASSESSMENT_BANK_FLAT = [q for group in ASSESSMENT_BANK.values() for q in group]


def build_assessment_questions(count: int = 5):
    """Pick a unique subset of questions from the 30-question assessment bank."""
    selected = random.sample(ASSESSMENT_BANK_FLAT, k=min(count, len(ASSESSMENT_BANK_FLAT)))
    return selected


def get_chat_question(answered_count: int) -> str:
    """Return a chat prompt for the current turn; chat mode stays open-ended."""
    if answered_count < len(CHAT_QUESTIONS):
        return CHAT_QUESTIONS[answered_count]

    cycle = CHAT_FOLLOWUP_QUESTIONS or CHAT_QUESTIONS
    return cycle[answered_count % len(cycle)]

# ---------------------------------------------------------------------------
# Prompt engineering — this is what keeps Gemini "on rails"
# ---------------------------------------------------------------------------

BASE_PERSONA = """You are "Aria," a warm, calm, empathetic wellness check-in \
companion inside a student mental health support website. You are having a \
short spoken conversation with a student.

Strict rules you must always follow:
- Speak like a caring, emotionally intelligent friend — never clinical, \
robotic, or formal.
- Keep every reply to at most 2 short sentences.
- Never use lists, numbers, bullet points, or markdown formatting in your \
questions.
- Never repeat a question you have already asked in this conversation.
- You are NOT a therapist or doctor. Never diagnose, never give medical \
advice, never claim to be a licensed professional.
- Only do exactly what the "INSTRUCTION FOR THIS TURN" below tells you to \
do. Do not add anything beyond it."""


def build_turn_instruction(answered_count: int) -> str:
    """
    answered_count = how many of the user's answers we already have.
    0 -> generate the opening greeting + question 1
    1-4 -> generate the next assessment question
    5 -> generate the FINAL structured assessment (no more questions)
    """
    if answered_count == 0:
        return (
            "INSTRUCTION FOR THIS TURN: This is your first message and there "
            "is no prior conversation. In one short sentence, warmly welcome "
            "the user to their private wellness check-in. Then, in a "
            "separate short sentence, ask exactly one open, gentle question "
            "about their overall mood and how they have been feeling lately. "
            "Output only your message text — no labels, no extra commentary."
        )

    if answered_count in (1, 2, 3, 4):
        return (
            "INSTRUCTION FOR THIS TURN: Read the conversation above. The "
            "user just answered your previous question. In one short warm "
            "sentence, gently acknowledge what they shared, without judging "
            "or diagnosing. Then, in a separate short sentence, ask exactly "
            "one open question about the next mental health assessment topic. "
            "Output only your message text — no labels, no extra commentary."
        )

    # answered_count == 5 -> final assessment turn
    return (
        "INSTRUCTION FOR THIS TURN: The user has now answered all 5 "
        "check-in questions above. Do not ask any more questions and do "
        "not write any acknowledgement, sympathy, or closing remarks. "
        "Based on everything the user has shared in this conversation, "
        "silently assess their check-in and respond with ONLY the exact "
        "block below, filled in accurately, and absolutely nothing else — "
        "no preamble, no explanation, no markdown code fences:\n"
        "[ASSESSMENT_START]\n"
        "Mood: <Stable or Unstable>\n"
        "Stress: <Low, Moderate, or High>\n"
        "Depression: <Low, Moderate, or High>\n"
        "Anxiety: <Low, Moderate, or High>\n"
        "Overall Wellness: <Good, Fair, or Poor>\n"
        "Counseling Needed: <Yes or No>\n"
        "[ASSESSMENT_END]"
    )


def call_gemini(history: list, answered_count: int) -> str:
    """Calls Gemini with the running conversation + a turn-specific directive."""
    instruction = build_turn_instruction(answered_count)
    system_instruction = f"{BASE_PERSONA}\n\n{instruction}"

    last_error = None
    for model_name in dict.fromkeys([GEMINI_MODEL, *GEMINI_FALLBACK_MODELS]):
        try:
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=history if history else "The conversation is just beginning.",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                    max_output_tokens=200,
                ),
            )
            return (response.text or "").strip()
        except Exception as exc:
            last_error = exc
            message = str(exc).lower()
            if "404" not in message and "not_found" not in message and "not available" not in message:
                raise

    if last_error is not None:
        raise last_error

    raise RuntimeError("All Gemini model attempts failed.")


def save_chat_event(
    session_id: str,
    mode: str,
    user_text: str | None = None,
    ai_text: str | None = None,
    question_number: int | None = None,
    total_questions: int | None = None,
    assessment_text: str | None = None,
) -> bool:
    """Store chat and assessment events in Supabase when configured."""
    if not session_id or not supabase_client:
        return False

    payload = {
        "session_id": session_id,
        "mode": mode,
        "user_text": user_text,
        "ai_text": ai_text,
        "question_number": question_number,
        "total_questions": total_questions,
        "assessment_text": assessment_text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        supabase_client.table(SUPABASE_TABLE).insert(payload).execute()
        return True
    except Exception:
        traceback.print_exc()
        return False


def build_local_assessment_from_history(history: list) -> str:
    """Fallback assessment generator that does not depend on Gemini quota."""
    joined_text = []
    for content in history:
        for part in getattr(content, "parts", []):
            text = getattr(part, "text", None)
            if text:
                joined_text.append(str(text).strip())

    transcript = " ".join(t for t in joined_text if t)
    text_lower = transcript.lower()

    score = sentiment_analyzer.polarity_scores(transcript)
    compound = score["compound"]
    negative = score["neg"]

    mood = "Stable" if compound >= -0.15 else "Unstable"
    stress = "High" if negative >= 0.3 or any(word in text_lower for word in ["stress", "overwhelmed", "pressure", "burnout"]) else "Moderate" if negative >= 0.15 or any(word in text_lower for word in ["tense", "busy", "anxious"]) else "Low"
    depression = "High" if any(word in text_lower for word in ["sad", "hopeless", "low mood", "empty", "disconnected"]) or compound <= -0.6 else "Moderate" if any(word in text_lower for word in ["down", "tired", "unmotivated"]) or compound <= -0.3 else "Low"
    anxiety = "High" if any(word in text_lower for word in ["anxious", "panic", "restless", "racing thoughts", "worried"]) or negative >= 0.35 else "Moderate" if any(word in text_lower for word in ["nervous", "tense", "worried"]) or negative >= 0.2 else "Low"
    wellness = "Poor" if compound <= -0.45 or stress == "High" or anxiety == "High" or depression == "High" else "Fair" if compound < 0.1 or stress == "Moderate" or anxiety == "Moderate" else "Good"
    counseling = "Yes" if any(flag in ["High", "Moderate"] for flag in [stress, depression, anxiety]) else "No"

    return (
        "[ASSESSMENT_START]\n"
        f"Mood: {mood}\n"
        f"Stress: {stress}\n"
        f"Depression: {depression}\n"
        f"Anxiety: {anxiety}\n"
        f"Overall Wellness: {wellness}\n"
        f"Counseling Needed: {counseling}\n"
        "[ASSESSMENT_END]"
    )


def call_gemini_final_with_retry(history: list) -> str:
    """
    Prefer Gemini when it is available. If free-tier limits or model quota issues
    block the request, fall back to a local sentiment-based assessment.
    """
    try:
        text = call_gemini(history, answered_count=TOTAL_QUESTIONS)
        if "[ASSESSMENT_START]" in text and "[ASSESSMENT_END]" in text:
            return text
    except Exception as exc:
        message = str(exc).lower()
        if "resource_exhausted" not in message and "quota" not in message and "429" not in message:
            raise

    strict_history = history + [
        types.Content(
            role="user",
            parts=[types.Part(text="(system reminder: reply with ONLY the assessment block, nothing else)")],
        )
    ]

    try:
        text_retry = call_gemini(strict_history, answered_count=TOTAL_QUESTIONS)
        if "[ASSESSMENT_START]" in text_retry and "[ASSESSMENT_END]" in text_retry:
            return text_retry
    except Exception as exc:
        message = str(exc).lower()
        if "resource_exhausted" not in message and "quota" not in message and "429" not in message:
            raise

    return build_local_assessment_from_history(history)


def transcribe_audio(file_storage) -> str:
    """Transcribe audio with Groq's Whisper API."""
    audio_bytes = file_storage.read()
    filename = file_storage.filename or "audio.webm"

    try:
        transcript = groq_client.audio.transcriptions.create(
            file=(filename, audio_bytes),
            model=GROQ_WHISPER_MODEL,
            language="en",
        )
        text = transcript.text.strip() if transcript.text else ""
        if not text:
            raise ValueError("Groq Whisper returned no transcript.")
        return text
    except Exception:
        traceback.print_exc()
        raise


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/api/start", methods=["POST"])
def start_session():
    """Starts the greeting and offers the user a choice between casual chat and assessment."""
    try:
        session_id = str(uuid.uuid4())
        history = []
        choice_text = (
            f"{GREETING_TEXT} Would you like to continue talking or take an assessment?"
        )
        history.append(types.Content(role="model", parts=[types.Part(text=choice_text)]))

        SESSIONS[session_id] = {"history": history, "answered_count": 0, "mode": "choice"}
        save_chat_event(session_id, "choice", ai_text=choice_text)

        return jsonify(
            {
                "session_id": session_id,
                "type": "choice",
                "text": choice_text,
                "options": ["Continue talking", "Take assessment"],
            }
        )
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "I hit a temporary issue. Please try again."}), 500


@app.route("/api/start-chat", methods=["POST"])
def start_chat():
    """Starts the casual conversation path."""
    try:
        session_id = request.form.get("session_id")
        if not session_id or session_id not in SESSIONS:
            return jsonify({"error": "Invalid or expired session_id."}), 400

        session = SESSIONS[session_id]
        session["mode"] = "chat"
        session["history"] = []
        session["answered_count"] = 0
        session["chat_questions"] = CHAT_QUESTIONS[:]

        first_question = get_chat_question(0)
        session["history"].append(types.Content(role="model", parts=[types.Part(text=first_question)]))
        save_chat_event(session_id, "chat", ai_text=first_question, question_number=1, total_questions=None)

        return jsonify(
            {
                "session_id": session_id,
                "type": "question",
                "text": first_question,
                "question_number": 1,
                "total_questions": None,
            }
        )
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "I hit a temporary issue. Please try again."}), 500


@app.route("/api/start-assessment", methods=["POST"])
def start_assessment():
    """Starts the mental health assessment path with a random 5-question set."""
    try:
        session_id = request.form.get("session_id")
        if not session_id or session_id not in SESSIONS:
            return jsonify({"error": "Invalid or expired session_id."}), 400

        session = SESSIONS[session_id]
        session["mode"] = "assessment"
        session["history"] = []
        session["answered_count"] = 0
        session["assessment_questions"] = build_assessment_questions(TOTAL_QUESTIONS)

        first_question = session["assessment_questions"][0]
        session["history"].append(types.Content(role="model", parts=[types.Part(text=first_question)]))
        save_chat_event(session_id, "assessment", ai_text=first_question, question_number=1, total_questions=TOTAL_QUESTIONS)

        return jsonify(
            {
                "session_id": session_id,
                "type": "question",
                "text": first_question,
                "question_number": 1,
                "total_questions": TOTAL_QUESTIONS,
            }
        )
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "I hit a temporary issue. Please try again."}), 500


@app.route("/api/converse", methods=["POST"])
def converse():
    """
    Accepts: multipart/form-data with fields:
       - session_id : string
       - audio      : optional recorded audio file (webm/ogg/wav/etc.)
       - text       : optional typed message
    Returns: the next question, OR the final raw assessment block.
    """
    try:
        session_id = request.form.get("session_id")
        audio_file = request.files.get("audio")
        typed_text = (request.form.get("text") or "").strip()

        if not session_id or session_id not in SESSIONS:
            return jsonify({"error": "Invalid or expired session_id. Call /api/start first."}), 400

        if not audio_file and not typed_text:
            return jsonify({"error": "No audio file or text message was provided."}), 400

        session = SESSIONS[session_id]
        history = session["history"]

        if typed_text:
            user_text = typed_text
        else:
            # Step 1: Speech-to-text via Groq Whisper (free tier)
            user_text = transcribe_audio(audio_file)
            if not user_text:
                return jsonify({"error": "Could not hear anything in that recording. Please try again."}), 422

        history.append(types.Content(role="user", parts=[types.Part(text=user_text)]))
        session["answered_count"] += 1
        answered_count = session["answered_count"]

        if session.get("mode") == "chat":
            ai_text = get_chat_question(answered_count)
            history.append(types.Content(role="model", parts=[types.Part(text=ai_text)]))
            total_questions = None if answered_count >= len(CHAT_QUESTIONS) else len(CHAT_QUESTIONS)
            save_chat_event(
                session_id,
                "chat",
                user_text=user_text,
                ai_text=ai_text,
                question_number=answered_count + 1,
                total_questions=total_questions,
            )
            return jsonify(
                {
                    "type": "question",
                    "transcript": user_text,
                    "text": ai_text,
                    "question_number": answered_count + 1,
                    "total_questions": total_questions,
                }
            )

        assessment_questions = session.get("assessment_questions", build_assessment_questions(TOTAL_QUESTIONS))
        if answered_count < TOTAL_QUESTIONS:
            ai_text = assessment_questions[answered_count]
            history.append(types.Content(role="model", parts=[types.Part(text=ai_text)]))
            save_chat_event(
                session_id,
                "assessment",
                user_text=user_text,
                ai_text=ai_text,
                question_number=answered_count + 1,
                total_questions=TOTAL_QUESTIONS,
            )
            return jsonify(
                {
                    "type": "question",
                    "transcript": user_text,
                    "text": ai_text,
                    "question_number": answered_count + 1,
                    "total_questions": TOTAL_QUESTIONS,
                }
            )

        assessment_text = call_gemini_final_with_retry(history)
        history.append(types.Content(role="model", parts=[types.Part(text=assessment_text)]))
        save_chat_event(
            session_id,
            "assessment",
            user_text=user_text,
            assessment_text=assessment_text,
            question_number=TOTAL_QUESTIONS,
            total_questions=TOTAL_QUESTIONS,
        )
        SESSIONS.pop(session_id, None)

        return jsonify(
            {
                "type": "assessment",
                "transcript": user_text,
                "text": assessment_text,
            }
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "I hit a temporary issue. Please try again."}), 500


@app.route("/api/tts", methods=["POST"])
def text_to_speech():
    """Text-to-speech using browser Web Speech API.
    Backend signals that frontend should use the browser's built-in TTS.
    """
    try:
        payload = request.get_json(silent=True) or {}
        text = str(payload.get("text") or "").strip()
        if not text:
            return jsonify({"error": "No text provided for speech synthesis."}), 400
        
        # Return 204 No Content with a flag to indicate browser TTS should be used
        return jsonify({"use_browser_tts": True, "text": text}), 200
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Text-to-speech request failed."}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    # use_reloader=False avoids the debug reloader spinning up two processes
    # (which would otherwise split your in-memory SESSIONS dict in two)
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)

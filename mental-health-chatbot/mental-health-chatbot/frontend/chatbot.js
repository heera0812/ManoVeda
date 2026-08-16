/**
 * Wellness Check-in Chatbot — Frontend Logic
 * --------------------------------------------
 * Handles:
 *  - Kicking off the session and playing Aria's questions aloud (Web Speech API TTS)
 *  - Recording the user's mic answer (MediaRecorder)
 *  - Sending audio to the backend and rendering the reply
 *  - Watching for the [ASSESSMENT_START]...[ASSESSMENT_END] block and
 *    switching the UI over to the results view when it appears
 */

(function () {
  // ---- CONFIG ---------------------------------------------------------
  const BACKEND_URL = "http://localhost:5000"; // change this when you deploy your backend
  const BOOKING_URL = "#booking"; // change this to your real booking page/section

  // ---- DOM refs ---------------------------------------------------------
  const chatCard = document.getElementById("ariaChatCard");
  const messagesEl = document.getElementById("ariaMessages");
  const micBtn = document.getElementById("ariaMicBtn");
  const textInput = document.getElementById("ariaTextInput");
  const sendTextBtn = document.getElementById("ariaSendTextBtn");
  const statusEl = document.getElementById("ariaStatus");
  const progressEl = document.getElementById("ariaProgress");

  const resultsEl = document.getElementById("ariaResults");
  const bookingPromptEl = document.getElementById("ariaBookingPrompt");
  const bookBtn = document.getElementById("ariaBookBtn");
  const restartBtn = document.getElementById("ariaRestartBtn");

  const badgeMood = document.getElementById("badgeMood");
  const badgeStress = document.getElementById("badgeStress");
  const badgeDepression = document.getElementById("badgeDepression");
  const badgeAnxiety = document.getElementById("badgeAnxiety");
  const badgeWellness = document.getElementById("badgeWellness");
  const badgeCounseling = document.getElementById("badgeCounseling");
  const counselorNoteEl = document.getElementById("ariaCounselorNote");

  // ---- State ---------------------------------------------------------
  let sessionId = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  // =====================================================================
  // Chat UI helpers
  // =====================================================================

  function addBubble(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `aria-bubble ${sender}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const bubble = document.createElement("div");
    bubble.className = "aria-bubble ai typing";
    bubble.id = "ariaTypingBubble";
    bubble.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const bubble = document.getElementById("ariaTypingBubble");
    if (bubble) bubble.remove();
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setProgress(questionNumber, total) {
    if (questionNumber && total) {
      progressEl.textContent = `Question ${questionNumber} of ${total}`;
    } else {
      progressEl.textContent = "Getting ready…";
    }
  }

  function friendlyErrorMessage(message) {
    const text = (message || "").trim();
    if (!text) return "I couldn’t hear that clearly. Please try again.";
    if (text.length > 160) return "I couldn’t hear that clearly. Please try again.";
    return text;
  }

  function renderChoiceButtons() {
    const group = document.createElement("div");
    group.className = "aria-choice-group";

    const choices = [
      { label: "Continue talking", route: "start-chat" },
      { label: "Take assessment", route: "start-assessment" },
    ];

    choices.forEach(({ label, route }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "aria-choice-btn";
      button.textContent = label;
      button.addEventListener("click", async () => {
        group.querySelectorAll("button").forEach((btn) => {
          btn.disabled = true;
          btn.style.opacity = "0.7";
        });

        try {
          const formData = new FormData();
          formData.append("session_id", sessionId);
          const res = await fetch(`${BACKEND_URL}/api/${route}`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${res.status})`);
          }

          const data = await res.json();

          if (data.type === "question") {
            addBubble(data.text, "ai");
            speak(data.text);
            setProgress(data.question_number, data.total_questions);
            setStatus("Tap the mic and speak your answer");
            micBtn.disabled = false;
          } else {
            throw new Error("Unexpected response from server");
          }
        } catch (err) {
          console.error(err);
          setStatus(`Something went wrong: ${err.message}`);
        }
      });
      group.appendChild(button);
    });

    messagesEl.appendChild(group);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // =====================================================================
  // Text-to-Speech (browser-native, 100% free)
  // =====================================================================

  function speak(text) {
    if (!text || !text.trim()) return;

    if (!("speechSynthesis" in window)) {
      console.warn("Web Speech API not available in this browser.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }

  // =====================================================================
  // Backend calls
  // =====================================================================

  async function startSession() {
    setStatus("Connecting to Aria…");
    micBtn.disabled = true;
    try {
      const res = await fetch(`${BACKEND_URL}/api/start`, { method: "POST" });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();

      sessionId = data.session_id;
      addBubble(data.text, "ai");
      speak(data.text);
      if (data.type === "choice") {
        renderChoiceButtons();
        setStatus("Choose how you would like to continue");
      } else {
        setProgress(data.question_number, data.total_questions);
        setStatus("Tap the mic and speak your answer");
        micBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      setStatus("Couldn't reach the server. Is the backend running?");
    }
  }

  async function sendTextMessage() {
    const text = (textInput.value || "").trim();
    if (!text) {
      setStatus("Type a message or use the mic.");
      textInput.focus();
      return;
    }

    setStatus("Thinking…");
    showTyping();
    micBtn.disabled = true;
    sendTextBtn.disabled = true;
    textInput.disabled = true;

    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("text", text);

      const res = await fetch(`${BACKEND_URL}/api/converse`, {
        method: "POST",
        body: formData,
      });

      hideTyping();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      textInput.value = "";

      if (data.transcript) addBubble(data.transcript, "user");

      if (data.type === "question") {
        addBubble(data.text, "ai");
        speak(data.text);
        setProgress(data.question_number, data.total_questions);
        setStatus("Type a message or tap the mic to answer");
        micBtn.disabled = false;
      } else if (data.type === "assessment") {
        handleAssessment(data.text);
      } else if (data.type === "chat_end") {
        addBubble(data.text, "ai");
        speak(data.text);
        setStatus("You can start a new check-in whenever you're ready.");
        micBtn.disabled = true;
      }
    } catch (err) {
      console.error(err);
      hideTyping();
      setStatus(`${friendlyErrorMessage(err.message)} Try again.`);
      micBtn.disabled = false;
    } finally {
      sendTextBtn.disabled = false;
      textInput.disabled = false;
      textInput.focus();
    }
  }

  async function sendRecording(audioBlob) {
    setStatus("Thinking…");
    showTyping();
    micBtn.disabled = true;
    sendTextBtn.disabled = true;
    textInput.disabled = true;

    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("audio", audioBlob, "answer.webm");

      const res = await fetch(`${BACKEND_URL}/api/converse`, {
        method: "POST",
        body: formData,
      });

      hideTyping();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      // Show what the user said (nice for accessibility / transparency)
      if (data.transcript) addBubble(data.transcript, "user");

      if (data.type === "question") {
        addBubble(data.text, "ai");
        speak(data.text);
        setProgress(data.question_number, data.total_questions);
        setStatus("Type a message or tap the mic to answer");
        micBtn.disabled = false;
      } else if (data.type === "assessment") {
        handleAssessment(data.text);
      } else if (data.type === "chat_end") {
        addBubble(data.text, "ai");
        speak(data.text);
        setStatus("You can start a new check-in whenever you're ready.");
        micBtn.disabled = true;
      }
    } catch (err) {
      console.error(err);
      hideTyping();
      setStatus(`${friendlyErrorMessage(err.message)} Tap the mic to try again.`);
      micBtn.disabled = false;
    } finally {
      sendTextBtn.disabled = false;
      textInput.disabled = false;
      textInput.focus();
    }
  }

  // =====================================================================
  // Assessment detection & parsing
  // This is the piece that "watches for the closing block" as required.
  // =====================================================================

  function handleAssessment(rawText) {
    const blockMatch = rawText.match(/\[ASSESSMENT_START\]([\s\S]*?)\[ASSESSMENT_END\]/i);

    if (!blockMatch) {
      // Fallback: shouldn't normally happen (backend retries once already)
      setStatus("Hmm, I couldn't read your results. Please try again.");
      micBtn.disabled = false;
      return;
    }

    const block = blockMatch[1];
    const mood = (block.match(/Mood:\s*([A-Za-z]+)/i) || [])[1] || "Unknown";
    const stress = (block.match(/Stress:\s*([A-Za-z]+)/i) || [])[1] || "Unknown";
    const depression = (block.match(/Depression:\s*([A-Za-z]+)/i) || [])[1] || "Unknown";
    const anxiety = (block.match(/Anxiety:\s*([A-Za-z]+)/i) || [])[1] || "Unknown";
    const wellness = (block.match(/Overall Wellness:\s*([A-Za-z]+)/i) || [])[1] || "Unknown";
    const counseling = (block.match(/Counseling Needed:\s*([A-Za-z]+)/i) || [])[1] || "Unknown";

    showResults({ mood, stress, depression, anxiety, wellness, counseling });
  }

  function classFor(value) {
    const v = (value || "").toLowerCase();
    if (["unstable", "high", "moderate", "poor", "fair", "yes"].includes(v)) return "warn";
    return "good";
  }

  function showResults({ mood, stress, depression, anxiety, wellness, counseling }) {
    badgeMood.textContent = mood;
    badgeMood.className = `value ${classFor(mood)}`;

    badgeStress.textContent = stress;
    badgeStress.className = `value ${classFor(stress)}`;

    badgeDepression.textContent = depression;
    badgeDepression.className = `value ${classFor(depression)}`;

    badgeAnxiety.textContent = anxiety;
    badgeAnxiety.className = `value ${classFor(anxiety)}`;

    badgeWellness.textContent = wellness;
    badgeWellness.className = `value ${classFor(wellness)}`;

    badgeCounseling.textContent = counseling;
    badgeCounseling.className = `value ${classFor(counseling)}`;

    counselorNoteEl.textContent = "If you want to know more about yourself, connect with a counselor.";

    if (counseling.toLowerCase() === "yes") {
      bookingPromptEl.classList.remove("aria-hidden");
    } else {
      bookingPromptEl.classList.add("aria-hidden");
    }

    // Hide the chat, reveal the results
    chatCard.style.display = "none";
    resultsEl.classList.add("visible");
  }

  // =====================================================================
  // Microphone recording
  // =====================================================================

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop()); // release the mic
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        sendRecording(audioBlob);
      };

      mediaRecorder.start();
      isRecording = true;
      micBtn.classList.add("recording");
      micBtn.textContent = "⏹️";
      setStatus("Listening… tap again to stop");
    } catch (err) {
      console.error(err);
      setStatus("Microphone access was blocked. Please allow mic permission.");
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      micBtn.classList.remove("recording");
      micBtn.textContent = "🎙️";
    }
  }

  micBtn.addEventListener("click", () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  sendTextBtn.addEventListener("click", sendTextMessage);

  textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendTextMessage();
    }
  });

  // =====================================================================
  // Booking + restart
  // =====================================================================

  bookBtn.addEventListener("click", () => {
    window.location.href = BOOKING_URL;
  });

  restartBtn.addEventListener("click", () => {
    messagesEl.innerHTML = "";
    resultsEl.classList.remove("visible");
    chatCard.style.display = "flex";
    sessionId = null;
    startSession();
  });

  // =====================================================================
  // Boot
  // =====================================================================

  // Some browsers load voices asynchronously — this "warms up" the list
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }

  startSession();
})();

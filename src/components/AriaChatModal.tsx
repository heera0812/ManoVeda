import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Mic, MicOff, Brain, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// The Flask chatbot backend URL — change this when deployed
const CHATBOT_API = 'http://localhost:5555';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface AssessmentResult {
  mood: string;
  stress: string;
  depression: string;
  anxiety: string;
  wellness: string;
  counseling: string;
}

interface AriaChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AriaChatModal: React.FC<AriaChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'choice' | 'chat' | 'assessment' | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Speak text using browser TTS
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start a new session
  const startSession = async () => {
    setLoading(true);
    setAssessment(null);
    setMessages([]);
    setMode(null);
    try {
      const res = await fetch(`${CHATBOT_API}/api/start`, { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSessionId(data.session_id);
      setMode('choice');
      const aiMsg: ChatMessage = { id: Date.now().toString(), sender: 'ai', text: data.text };
      setMessages([aiMsg]);
      speakText(data.text);
    } catch (err) {
      console.error(err);
      setMessages([{ id: 'err', sender: 'ai', text: 'Could not connect to Aria. Please make sure the chatbot server is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-start session when opened
  useEffect(() => {
    if (isOpen && !sessionId) {
      startSession();
    }
  }, [isOpen]);

  // Choose mode: chat or assessment
  const chooseMode = async (route: 'start-chat' | 'start-assessment') => {
    if (!sessionId) return;
    setSending(true);
    const userLabel = route === 'start-chat' ? 'Continue talking' : 'Take assessment';
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userLabel }]);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);

      const res = await fetch(`${CHATBOT_API}/api/${route}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMode(route === 'start-chat' ? 'chat' : 'assessment');
      if (data.question_number && data.total_questions) {
        setProgress(`Question ${data.question_number} of ${data.total_questions}`);
      }
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: data.text };
      setMessages(prev => [...prev, aiMsg]);
      speakText(data.text);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err2', sender: 'ai', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  // Parse assessment block
  const parseAssessment = (text: string): AssessmentResult | null => {
    if (!text.includes('[ASSESSMENT_START]') || !text.includes('[ASSESSMENT_END]')) return null;
    const block = text.split('[ASSESSMENT_START]')[1].split('[ASSESSMENT_END]')[0];
    const lines = block.trim().split('\n');
    const result: any = {};
    lines.forEach(line => {
      const [key, val] = line.split(':').map(s => s.trim());
      if (key && val) {
        const k = key.toLowerCase().replace(/\s+/g, '_');
        result[k] = val;
      }
    });
    return {
      mood: result.mood || 'Unknown',
      stress: result.stress || 'Unknown',
      depression: result.depression || 'Unknown',
      anxiety: result.anxiety || 'Unknown',
      wellness: result.overall_wellness || 'Unknown',
      counseling: result.counseling_needed || 'Unknown',
    };
  };

  // Send text message
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !sessionId || sending) return;

    const userText = inputText.trim();
    setInputText('');
    setSending(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('text', userText);

      const res = await fetch(`${CHATBOT_API}/api/converse`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.type === 'assessment') {
        const parsed = parseAssessment(data.text);
        if (parsed) {
          setAssessment(parsed);
        } else {
          setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: data.text }]);
        }
      } else {
        if (data.question_number && data.total_questions) {
          setProgress(`Question ${data.question_number} of ${data.total_questions}`);
        }
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: data.text };
        setMessages(prev => [...prev, aiMsg]);
        speakText(data.text);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err3', sender: 'ai', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  // Voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return; // too small, probably silent

        setSending(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: '🎤 Voice message...' }]);

        try {
          const formData = new FormData();
          formData.append('session_id', sessionId!);
          formData.append('audio', audioBlob, 'recording.webm');

          const res = await fetch(`${CHATBOT_API}/api/converse`, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          // Update the "voice message" bubble with the actual transcript
          if (data.transcript) {
            setMessages(prev => prev.map(m =>
              m.text === '🎤 Voice message...' ? { ...m, text: data.transcript } : m
            ));
          }

          if (data.type === 'assessment') {
            const parsed = parseAssessment(data.text);
            if (parsed) {
              setAssessment(parsed);
            } else {
              setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: data.text }]);
            }
          } else {
            if (data.question_number && data.total_questions) {
              setProgress(`Question ${data.question_number} of ${data.total_questions}`);
            }
            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: data.text };
            setMessages(prev => [...prev, aiMsg]);
            speakText(data.text);
          }
        } catch (err) {
          console.error(err);
          setMessages(prev => [...prev, { id: 'errv', sender: 'ai', text: 'Could not process voice. Please try again.' }]);
        } finally {
          setSending(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };

  // Restart
  const handleRestart = () => {
    setSessionId(null);
    setMessages([]);
    setAssessment(null);
    setMode(null);
    setProgress('');
    startSession();
  };

  if (!isOpen) return null;

  // Badge color helper
  const badgeColor = (val: string) => {
    const v = val.toLowerCase();
    if (['high', 'poor', 'unstable', 'yes'].includes(v)) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (['moderate', 'fair'].includes(v)) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-28 right-6 z-[110] w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#325343] to-[#3d6652] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Chat with Aria</h3>
              <p className="text-white/60 text-[10px]">
                {progress || 'Your wellness companion'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Assessment Results View */}
        {assessment ? (
          <div className="flex-1 overflow-y-auto px-5 py-6 bg-[#FAF8F5]">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#325343]/10 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-7 h-7 text-[#325343]" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Your Wellness Check-In</h3>
              <p className="text-xs text-slate-400 mt-1">Based on your conversation with Aria</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {([
                ['Mood', assessment.mood],
                ['Stress', assessment.stress],
                ['Depression', assessment.depression],
                ['Anxiety', assessment.anxiety],
                ['Wellness', assessment.wellness],
                ['Counseling', assessment.counseling],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className={`p-3 rounded-2xl border text-center ${badgeColor(value)}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                  <p className="text-sm font-bold mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {assessment.counseling.toLowerCase() === 'yes' && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center mb-4">
                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                  Based on your responses, speaking with a campus counselor may be helpful. Remember, seeking support is a sign of strength.
                </p>
              </div>
            )}

            <button
              onClick={handleRestart}
              className="w-full py-3 bg-[#325343] text-white font-bold rounded-xl hover:bg-[#264033] transition-colors text-sm"
            >
              Start a New Check-In
            </button>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#FAF8F5]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-[#325343] animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {msg.sender === 'ai' && (
                        <span className="text-[10px] font-bold text-[#325343] mb-0.5 px-1">Aria</span>
                      )}
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#325343] text-white rounded-br-lg'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-lg shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Choice buttons */}
                  {mode === 'choice' && !sending && (
                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        onClick={() => chooseMode('start-chat')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#325343] text-[#325343] rounded-xl text-xs font-bold hover:bg-[#325343]/5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Continue talking
                      </button>
                      <button
                        onClick={() => chooseMode('start-assessment')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#325343] text-white rounded-xl text-xs font-bold hover:bg-[#264033] transition-colors"
                      >
                        <Brain className="w-3.5 h-3.5" /> Take assessment
                      </button>
                    </div>
                  )}

                  {sending && (
                    <div className="flex items-start">
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-lg px-4 py-3 shadow-xs">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {(mode === 'chat' || mode === 'assessment') && (
              <form
                onSubmit={handleSendText}
                className="shrink-0 px-3 py-3 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={isRecording ? 'Recording...' : 'Type your response...'}
                  disabled={isRecording}
                  className="flex-1 bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#325343]/20 focus:border-[#325343] transition-shadow disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending || isRecording}
                  className="w-10 h-10 rounded-xl bg-[#325343] hover:bg-[#264033] disabled:bg-slate-200 text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

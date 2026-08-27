// Audio and Web Speech Synthesis / Recognition utilities for MediKiosk
const API_BASE = 'http://localhost:8000/api';

let activeAudioElement: HTMLAudioElement | null = null;

export function playTextToSpeech(text: string, language: string = 'en') {
  if (!text || !text.trim()) return;

  // Stop any active audio element
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }

  // Cancel any ongoing browser speech synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const langCode = language.toLowerCase().split('-')[0];

  // 1. For Bengali (or when browser lacks native voice packs), stream high-fidelity TTS directly
  // Bengali in Windows browsers almost never has a native voice installed, causing silent failure.
  if (langCode === 'bn') {
    playStreamedTTS(text, 'bn');
    return;
  }

  // 2. Check if browser has a matching local voice
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    const voicePrefix = langCode === 'hi' ? 'hi' : langCode === 'ta' ? 'ta' : langCode === 'te' ? 'te' : 'en';
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(voicePrefix) || v.name.toLowerCase().includes(voicePrefix));

    if (matchingVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = matchingVoice;
      utterance.lang = matchingVoice.lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onerror = () => {
        // Fallback to streaming if speech synthesis fails
        playStreamedTTS(text, langCode);
      };

      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  // 3. Fallback: stream high-fidelity audio from TTS endpoint
  playStreamedTTS(text, langCode);
}

function playStreamedTTS(text: string, langCode: string) {
  try {
    const ttsUrl = `${API_BASE}/audio/tts?text=${encodeURIComponent(text)}&lang=${langCode}`;
    const audio = new Audio(ttsUrl);
    activeAudioElement = audio;
    audio.play().catch(err => {
      console.warn("Direct TTS stream playback notice:", err);
    });
  } catch (err) {
    console.error("Failed to initialize TTS audio element:", err);
  }
}

export function stopTextToSpeech() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Multilingual audio explanation for DPDP / Consent
export function playConsentAudio(language: string = 'en') {
  const explanation = language === 'hi' 
    ? "नमस्ते। मेडीकियोस्क में आपकी आवाज, लक्षण और पुराने पर्चे सुरक्षित रूप से दर्ज किए जाते हैं ताकि डॉक्टर को आपका पूरा विवरण तुरंत मिल सके और आपका समय बचे।"
    : language === 'bn'
    ? "নমস্কার। মেডিকিয়স্কে আপনার লক্ষণ, কণ্ঠস্বর ও পুরনো প্রেসক্রিপশন নিরাপদে রেকর্ড করা হয় যাতে ডাক্তারবাবু আপনার সম্পূর্ণ তথ্য সহজে পর্যালোচনা করতে পারেন।"
    : language === 'ta'
    ? "வணக்கம். மெடிகியோஸ்கில் உங்கள் அறிகுறிகள் மற்றும் ஆவணங்கள் பாதுகாப்பாக பதிவு செய்யப்படுகின்றன."
    : language === 'te'
    ? "నమస్కారం. మెడికియోస్క్‌లో మీ లక్షణాలు మరియు పత్రాలు సురక్షితంగా రికార్డ్ చేయబడతాయి."
    : "Welcome to MediKiosk. We securely record your symptoms, voice, and medical documents to prepare a structured clinical summary for your OPD doctor, saving your valuable consultation time.";
  playTextToSpeech(explanation, language);
}


export const SpeechRecognitionApi =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const isSpeechDictationSupported = Boolean(SpeechRecognitionApi);

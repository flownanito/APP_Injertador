import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { SpeechRecognitionApi } from '../utils/speechRecognition';

const ERROR_MESSAGES = {
  'not-allowed': 'Permite el acceso al micrófono en el navegador.',
  'service-not-allowed': 'El navegador no permite usar el servicio de voz.',
  'audio-capture': 'No se encontró un micrófono disponible.',
  'no-speech': 'No se detectó voz. Inténtalo de nuevo.',
  network: 'No se pudo conectar con el servicio de reconocimiento de voz.',
  'language-not-supported': 'El navegador no admite el reconocimiento en español.'
};

export default function SpeechDictationButton({ fieldLabel, onTranscript }) {
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');
  const isSupported = Boolean(SpeechRecognitionApi);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const handleClick = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    setMessage('');
    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ');

      if (transcript) {
        const validationMessage = onTranscriptRef.current(transcript);
        setMessage(validationMessage || '');
      }
    };
    recognition.onerror = (event) => {
      setMessage(ERROR_MESSAGES[event.error] || 'No se pudo reconocer la voz. Inténtalo de nuevo.');
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      setIsListening(false);
      setMessage('No se pudo iniciar el micrófono. Inténtalo de nuevo.');
      console.error('Error al iniciar el reconocimiento de voz:', error);
    }
  };

  return (
    <div className="speech-dictation">
      <button
        type="button"
        className={`speech-dictation-button ${isListening ? 'is-listening' : ''}`}
        onClick={handleClick}
        disabled={!isSupported}
        aria-label={isListening ? `Detener dictado de ${fieldLabel}` : `Dictar ${fieldLabel}`}
        aria-pressed={isListening}
        title={
          isSupported
            ? isListening
              ? 'Detener dictado'
              : `Dictar ${fieldLabel}`
            : 'El reconocimiento de voz no está disponible en este navegador'
        }
      >
        {isListening ? <MicOff size={19} aria-hidden="true" /> : <Mic size={19} aria-hidden="true" />}
      </button>
      {(isListening || message) && (
        <span className="speech-dictation-feedback" role="status" aria-live="polite">
          {isListening ? 'Escuchando…' : message}
        </span>
      )}
    </div>
  );
}

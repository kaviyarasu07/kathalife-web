'use client';

import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/services/journalService';
import type { SttLanguageCode } from '@/types';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface UseSttRecorderReturn {
  recordingState: RecordingState;
  errorMessage: string | null;
  toggleRecording: (languageCode: SttLanguageCode) => Promise<void>;
  onTranscript: (handler: (text: string) => void) => void;
}

export function useSttRecorder(): UseSttRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptHandlerRef = useRef<((text: string) => void) | null>(null);
  const currentLanguageRef = useRef<SttLanguageCode>('ta-IN');

  const onTranscript = useCallback((handler: (text: string) => void) => {
    transcriptHandlerRef.current = handler;
  }, []);

  const startRecording = useCallback(async (languageCode: SttLanguageCode) => {
    setErrorMessage(null);
    currentLanguageRef.current = languageCode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecordingState('processing');

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          const result = await transcribeAudio(audioBlob, currentLanguageRef.current);
          if (transcriptHandlerRef.current && result.transcript) {
            transcriptHandlerRef.current(result.transcript);
          }
          setRecordingState('idle');
        } catch (err) {
          console.error('STT transcription failed:', err);
          setErrorMessage('Could not transcribe. Please try again.');
          setRecordingState('error');
          window.setTimeout(() => setRecordingState('idle'), 3000);
        }
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (err) {
      console.error('Microphone access failed:', err);
      setErrorMessage('Microphone access denied.');
      setRecordingState('error');
      window.setTimeout(() => setRecordingState('idle'), 3000);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('processing');
    }
  }, []);

  const toggleRecording = useCallback(async (languageCode: SttLanguageCode) => {
    if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'idle' || recordingState === 'error') {
      await startRecording(languageCode);
    }
  }, [recordingState, startRecording, stopRecording]);

  return { recordingState, errorMessage, toggleRecording, onTranscript };
}

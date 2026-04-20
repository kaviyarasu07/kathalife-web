'use client';

// Local (Katha) Web Speech API types to avoid colliding with lib.dom or other declarations
type KathaSpeechRecognitionAlternative = {
  transcript: string;
  confidence?: number;
};

type KathaSpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: KathaSpeechRecognitionAlternative;
};

type KathaSpeechRecognitionResultList = {
  length: number;
  [index: number]: KathaSpeechRecognitionResult;
};

type KathaSpeechRecognitionEvent = Event & {
  readonly resultIndex: number;
  readonly results: KathaSpeechRecognitionResultList;
};

type KathaSpeechRecognitionErrorEvent = Event & {
  readonly error: string;
};

interface KathaSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((ev: KathaSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: KathaSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort?(): void;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: { new (): KathaSpeechRecognition };
    SpeechRecognition?: { new (): KathaSpeechRecognition };
  }
}

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserMenuDropdown from '@/components/UserMenuDropdown';
import { useAuth } from '@/context/AuthContext';
import { journalService, type JournalEntry } from '@/services/journalService';
import { userService } from '@/services/userService';
import type { UserResponse } from '@/types';
import { Patrick_Hand, Playfair_Display } from 'next/font/google';

const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-patrick-hand',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

type SaveActivityPayload = {
  content: string;
  activityDate: string;
};

type JournalActivityService = {
  getActivityByDate: (dateStr: string) => Promise<JournalEntry | null>;
  saveActivity: (payload: SaveActivityPayload) => Promise<void>;
};

type UserWithOptionalName = UserResponse & {
  fullName?: string | null;
  name?: string | null;
};

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

const ONE_DAY = 1000 * 60 * 60 * 24;

class JournalPageActions {
  constructor(private readonly service: JournalActivityService) {}

  getEntry(dateStr: string): Promise<JournalEntry | null> {
    return this.service.getActivityByDate(dateStr);
  }

  saveEntry(payload: SaveActivityPayload): Promise<void> {
    return this.service.saveActivity(payload);
  }
}

function formatYYYYMMDD(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Could not format date.');
  }

  return `${year}-${month}-${day}`;
}

function parseYYYYMMDD(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  if (formatYYYYMMDD(parsed) !== value) {
    return null;
  }

  return parsed;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / ONE_DAY);
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

function getLongDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// SaveButton component (manual save)
const SaveButton = ({ status, onSave }: { status: SaveStatus; onSave: () => void }) => {
  if (status === 'idle') return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 14px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 500,
      background: '#f5f0e8',
      border: '0.5px solid #e0d5c0',
      color: '#b09060',
      userSelect: 'none',
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="#b09060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Saved
    </div>
  );

  if (status === 'unsaved') return (
    <button
      onClick={onSave}
      title="Save your diary entry"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 14px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 500,
        background: '#C8860A',
        border: '0.5px solid #a06808',
        color: 'white',
        cursor: 'pointer',
        userSelect: 'none',
        animation: 'kathaFadeIn 0.3s ease',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      That&apos;s my day
    </button>
  );

  if (status === 'saving') return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 14px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 500,
      background: '#fff8ed',
      border: '0.5px solid #fcd34d',
      color: '#92400e',
      userSelect: 'none',
    }}>
      <span style={{
        width: '10px',
        height: '10px',
        border: '1.5px solid #fcd34d',
        borderTopColor: '#92400e',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'kathaSpin 0.8s linear infinite',
        flexShrink: 0,
      }} />
      Saving...
    </div>
  );

  if (status === 'saved') return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '5px 14px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 500,
      background: '#f0fdf4',
      border: '0.5px solid #86efac',
      color: '#166534',
      userSelect: 'none',
      animation: 'kathaFadeIn 0.3s ease',
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Saved
    </div>
  );

  if (status === 'error') return (
    <button
      onClick={onSave}
      title="Click to retry"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 14px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 500,
        background: '#fef2f2',
        border: '0.5px solid #fca5a5',
        color: '#991b1b',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Couldn&apos;t save · Retry
    </button>
  );

  return null;
};

export function JournalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const actions = useMemo(() => new JournalPageActions(journalService), []);

  const initialDate = useMemo(() => {
    const requestedDate = parseYYYYMMDD(searchParams.get('date'));
    return requestedDate ?? new Date();
  }, [searchParams]);

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [content, setContent] = useState('');
  const [storyLocked, setStoryLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  // removed error/lastSavedAt state - UI does not display last-saved or errors inline
  const [userName, setUserName] = useState('');

  // Voice-to-text state and ref
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<KathaSpeechRecognition | null>(null);
  // textarea ref for autosizing to avoid inner scrollbar
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Last final transcript appended — used to deduplicate repeated final events
  const lastFinalTranscriptRef = useRef<string>('');
  // Session id to ignore events from older recognition instances
  const recognitionSessionRef = useRef<number>(0);

  // Auto-resize textarea to avoid inner scrollbars — expand to fit content
  useEffect(() => {
    const resize = () => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      // Add a small extra pixel to avoid cutting descenders
      el.style.height = Math.max(el.scrollHeight, window.innerHeight - 160) + 'px';
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [content]);

  // Save state and debouncing (renamed to avoid name collision)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const currentDateStr = formatYYYYMMDD(currentDate);
  const dayNumber = getDayOfYear(currentDate);
  const dayName = getDayName(currentDate);
  // diaryStamp not used in immersive layout

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    let mounted = true;

    const loadUserName = async () => {
      try {
        const currentUser = (await userService.getCurrentUser()) as UserWithOptionalName;
        const nextName = currentUser.fullName || currentUser.name || currentUser.email || '';

        if (mounted) {
          setUserName(nextName);
        }
      } catch (err) {
        console.error('Could not load current user for journal avatar.', err);
      }
    };

    loadUserName();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const nextDate = parseYYYYMMDD(searchParams.get('date'));
    if (nextDate && formatYYYYMMDD(nextDate) !== formatYYYYMMDD(currentDate)) {
      setCurrentDate(nextDate);
    }
  }, [currentDate, searchParams]);

  useEffect(() => {
    const loadEntry = async () => {
      setLoading(true);
      setStoryLocked(false);

      try {
        const entry = await actions.getEntry(currentDateStr);
        const savedContent = entry?.content ?? '';

        setContent(savedContent);
        // mark loaded content as idle (no unsaved edits)
        setSaveStatus('idle');
        setStoryLocked(entry?.storyLocked ?? false);
        setIsDirty(false);
      } catch (err) {
        console.error('Could not load journal entry.', err);
      } finally {
        setLoading(false);
      }
    };

    // reset save status when date changes
    setSaveStatus('idle');
    loadEntry();
  }, [actions, currentDateStr]);

  // Detect browser support for Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    setIsDirty(true);
    // mark as unsaved for manual save
    if (!storyLocked) setSaveStatus('unsaved');
  };

  // Toggle voice recognition on/off (sessioned, deduped)
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText('');
      lastFinalTranscriptRef.current = '';
      return;
    }

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    // opt into single alternative if supported
    (recognition as KathaSpeechRecognition & { maxAlternatives?: number }).maxAlternatives = 1;

    const sessionId = Date.now();
    recognitionSessionRef.current = sessionId;

    recognition.onstart = () => {
      setIsListening(true);
      lastFinalTranscriptRef.current = '';
    };

    recognition.onresult = (event: KathaSpeechRecognitionEvent) => {
      // Guard: ignore if this session was replaced
      if (recognitionSessionRef.current !== sessionId) return;

      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
          // Deduplicate — skip if this exact transcript was already appended
          if (transcript === lastFinalTranscriptRef.current) continue;
          if (lastFinalTranscriptRef.current.endsWith(transcript)) continue;

          lastFinalTranscriptRef.current = transcript;

          setContent(prev => {
            const base = prev.endsWith(' ') || prev === '' ? prev : prev + ' ';
            return base + transcript;
          });
          setSaveStatus('unsaved');

        } else {
          interim += result[0].transcript;
        }
      }

      setInterimText(interim);
    };

    recognition.onerror = (event: KathaSpeechRecognitionErrorEvent) => {
      if (recognitionSessionRef.current !== sessionId) return;
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimText('');
      lastFinalTranscriptRef.current = '';
    };

    recognition.onend = () => {
      if (recognitionSessionRef.current !== sessionId) return;
      setIsListening(false);
      setInterimText('');
      lastFinalTranscriptRef.current = '';
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const saveEntry = async () => {
    // Guards
    if (storyLocked) return;
    if (!content.trim()) return;
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');

    try {
      await actions.saveEntry({ content, activityDate: currentDateStr });
      setSaveStatus('saved');
    } catch (err) {
      console.error('Could not save journal entry.', err);
      setSaveStatus('error');
    }
  };

  // Debugging: log saveStatus and isDirty on every render
  useEffect(() => {
    console.log('Render - saveStatus:', saveStatus, 'isDirty:', isDirty);
  });

  return (
    <main
      className={`${patrickHand.variable} ${playfairDisplay.variable}`}
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#FDFAF5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header style={{ position: 'relative', width: '100%', padding: '12px 20px', borderBottom: '1px solid #e8dfc8', background: '#FDFAF5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', left: 12, top: 12 }}>
            <UserMenuDropdown userName={userName ?? ''} />
          </div>

          <div style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif', color: '#C8860A', fontStyle: 'italic', fontSize: 18 }}>
            {`Day ${dayNumber}, ${dayName}, ${getLongDate(currentDate)}`}
          </div>

          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
            <SaveButton status={storyLocked ? 'idle' : saveStatus} onSave={saveEntry} />
          </div>
        </div>
      </header>

      {/* Diary writing area */}
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #fcd34d', borderTopColor: '#92400e', borderRadius: '50%', animation: 'kathaSpin 0.8s linear infinite' }} />
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          readOnly={storyLocked}
          placeholder=""
          style={{
            boxSizing: 'border-box',
            width: '100%',
            minHeight: '100%',
            padding: '16px 24px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-patrick-hand), Patrick Hand, cursive',
            fontSize: 18,
            lineHeight: '32px',
            color: '#5C3D2E',
            caretColor: '#C8860A',
            whiteSpace: 'pre-wrap',
            overflowY: 'hidden',
          }}
        />

        {/* Interim transcript bar */}
        {isListening && interimText && (
          <div style={{ position: 'absolute', bottom: 64, left: 0, right: 0, padding: '4px 16px 8px', fontFamily: 'var(--font-patrick-hand)', fontSize: 15, color: '#C8860A', fontStyle: 'italic', borderBottom: '1px dashed #e8dfc8', background: '#FDFAF5' }}>
            <span>{interimText}</span>
            <span style={{ display: 'inline-block', width: 2, height: 14, background: '#C8860A', marginLeft: 6, verticalAlign: 'text-bottom', animation: 'kathaBlinkCursor 1s step-end infinite' }} />
          </div>
        )}

        {/* Hint bar */}
        {speechSupported && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 14px', background: isListening ? '#fff8ed' : '#fef9f0', borderTop: '1px solid #e8dfc8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontSize: 12 }}>
              {!isListening ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
                  </svg>
                  <span>Tap mic to speak your thoughts</span>
                </>
              ) : (
                <>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block', boxShadow: '0 0 0 6px rgba(220,38,38,0.12)', animation: 'kathaPulseRing 1.2s ease-out infinite' }} />
                  <span>Listening... speak naturally</span>
                </>
              )}
            </div>

            <div>
              <button onClick={toggleVoice} aria-label={isListening ? 'Stop listening' : 'Start listening'} style={{ width: 36, height: 36, borderRadius: '50%', background: isListening ? '#DC2626' : '#C8860A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                {isListening ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Default export required by Next.js App Router when using client-side hooks like useSearchParams.
export default function JournalPage() {
  return (
    <Suspense fallback={<div />}>
      <JournalPageContent />
    </Suspense>
  );
}

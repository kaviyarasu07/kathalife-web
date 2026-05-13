'use client';

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSttRecorder } from '@/hooks/useSttRecorder';
import { journalService, type JournalEntry } from '@/services/journalService';
import { userService } from '@/services/userService';
import type { SttLanguageCode, UserResponse } from '@/types';
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
  const [showWelcome, setShowWelcome] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<SttLanguageCode>('ta-IN');
  const [activeTab, setActiveTab] = useState<'write' | 'speak' | 'quick'>('write');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const { recordingState, errorMessage, toggleRecording, onTranscript } = useSttRecorder();
  // textarea ref for autosizing to avoid inner scrollbar
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  onTranscript((text: string) => {
    setContent(prev => {
      const base = prev.endsWith(' ') || prev === '' ? prev : prev + ' ';
      return base + text;
    });
    setSaveStatus('unsaved');
  });

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
    if (typeof window === 'undefined') return;
    const today = formatYYYYMMDD(new Date());
    const lastOpened = localStorage.getItem('kathalife_last_opened');
    if (lastOpened !== today) {
      localStorage.setItem('kathalife_last_opened', today);
      setShowWelcome(true);
      const timer = window.setTimeout(() => setShowWelcome(false), 3000);
      return () => window.clearTimeout(timer);
    }
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

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    setIsDirty(true);
    // mark as unsaved for manual save
    if (!storyLocked) setSaveStatus('unsaved');
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
    <>
      {showWelcome && (
        <div
          onClick={() => setShowWelcome(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(253,250,245,0.97)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            animation: 'kathaFadeIn 0.6s ease',
            cursor: 'pointer',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-playfair-display), Georgia, serif',
            fontSize: 28,
            color: '#5C3D2E',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: 1.4,
          }}>
            Good {getGreeting()}, {userName?.split(' ')[0] || 'dear'} 🌿
          </div>
          <div style={{
            fontFamily: 'var(--font-patrick-hand), cursive',
            fontSize: 16,
            color: '#8B7355',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            Your diary is waiting for you.
            <br />Tap anywhere to begin writing.
          </div>
        </div>
      )}

      <main
        className={`${patrickHand.variable} ${playfairDisplay.variable}`}
        style={{
          height: '100dvh',
          width: '100%',
          background: '#0D0B1A',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        {/* HEADER - sticky */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0D0B1A', padding: '16px 20px', borderBottom: '1px solid #2A2550', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           {/* Left: back */}
           <button onClick={() => router.back()} aria-label="Back" style={{ background: 'transparent', border: 0, padding: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#9B93C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Center: Day and Date */}
          <div style={{ textAlign: 'center', lineHeight: 1 }}>
            <div style={{ fontFamily: "var(--font-playfair-display), Georgia, serif", fontSize: 18, fontWeight: 600, color: '#EEEAF8' }}>{`Day ${dayNumber}`}</div>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#9B93C4' }}>{`${dayName}, ${new Date(currentDate).toLocaleString('en-GB', { month: 'short', day: 'numeric' })}`}</div>
          </div>

          {/* Right: Save button + calendar (calendar preserves existing date picker behaviour) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <SaveButton status={storyLocked ? 'idle' : saveStatus} onSave={saveEntry} />
            </div>
            <div>
              <button
                aria-label="Pick date"
                onClick={() => {
                  // create invisible date input to preserve existing calendar behaviour
                  const input = document.createElement('input');
                  input.type = 'date';
                  input.value = formatYYYYMMDD(currentDate);
                  input.style.position = 'fixed';
                  input.style.left = '-9999px';
                  document.body.appendChild(input);
                  input.addEventListener('change', () => {
                    const val = input.value; // YYYY-MM-DD
                    if (val) {
                      // navigate to journal with date param (existing logic uses searchParams)
                      router.push(`/journal?date=${val}`);
                    }
                    document.body.removeChild(input);
                  });
                  input.click();
                }}
                style={{ background: 'transparent', border: 0, padding: 6 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="#9B93C4" strokeWidth="1.5" />
                  <path d="M16 3V7" stroke="#9B93C4" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 3V7" stroke="#9B93C4" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* INPUT MODE SELECTOR */}
        <div style={{ padding: '20px 20px 0', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['write', 'speak', 'quick'] as const).map((mode) => {
              const active = mode === (typeof window !== 'undefined' && (window as any).__journal_active_tab ? (window as any).__journal_active_tab : 'write') ? true : mode === (typeof window !== 'undefined' && (window as any).__journal_active_tab ? (window as any).__journal_active_tab : 'write');
              // Use component-local state instead of window fallback
              return null;
            })}

            {/* We use local state for activeTab */}
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                onClick={() => { (window as any).__journal_active_tab = 'write'; /* preserve for debugging */ setTimeout(() => {}, 0); }}
                className=""
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 9999,
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 14,
                  textAlign: 'center',
                  background: activeTab === 'write' ? '#7C6FE8' : 'transparent',
                  color: activeTab === 'write' ? '#fff' : '#5A5480',
                  border: `1px solid ${activeTab === 'write' ? '#7C6FE8' : '#2A2550'}`,
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClickCapture={() => setActiveTab('write')}
              >
                ✏ Write
              </button>

              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveTab('speak')}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 9999,
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 14,
                  textAlign: 'center',
                  background: activeTab === 'speak' ? '#7C6FE8' : 'transparent',
                  color: activeTab === 'speak' ? '#fff' : '#5A5480',
                  border: `1px solid ${activeTab === 'speak' ? '#7C6FE8' : '#2A2550'}`,
                }}
              >
                🎤 Speak
              </button>

              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveTab('quick')}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 9999,
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 14,
                  textAlign: 'center',
                  background: activeTab === 'quick' ? '#7C6FE8' : 'transparent',
                  color: activeTab === 'quick' ? '#fff' : '#5A5480',
                  border: `1px solid ${activeTab === 'quick' ? '#7C6FE8' : '#2A2550'}`,
                }}
              >
                ⚡ Quick Note
              </button>
            </div>
          </div>
        </div>

        {/* Writing container */}
        <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#13102A', border: '1px solid #2A2550', borderRadius: 16, padding: 20, minHeight: 300, marginBottom: 16, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* LOCKED OVERLAY */}
            {storyLocked && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,26,0.85)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="#5A5480" strokeWidth="1.5" />
                  <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="#5A5480" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#5A5480' }}>This day is locked</div>
              </div>
            )}

            {/* WRITE MODE */}
            {activeTab === 'write' && (
              <>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  readOnly={storyLocked}
                  placeholder="What's on your mind?"
                  maxLength={1000}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#EEEAF8',
                    fontFamily: "Lora, 'Lora', serif",
                    fontSize: 16,
                    lineHeight: '1.8',
                    width: '100%',
                    resize: 'none',
                    minHeight: 160,
                    overflow: 'hidden',
                  }}
                />

                {/* maxlength indicator */}
                <div style={{ position: 'absolute', right: 16, bottom: 12, fontSize: 12, color: '#5A5480' }}>{`${content.length}/1000`}</div>
              </>
            )}

            {/* SPEAK MODE */}
            {activeTab === 'speak' && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                {/* Transcribed text preview */}
                <div style={{ color: '#EEEAF8', fontFamily: "Lora, 'Lora', serif", fontSize: 16, lineHeight: '1.8', padding: '0 6px', textAlign: 'center' }}>{content || 'Your transcription will appear here'}</div>

                {/* Language selector styled as specified */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={selectedLanguage}
                    onChange={e => setSelectedLanguage(e.target.value as SttLanguageCode)}
                    style={{
                      background: '#1C1836',
                      border: '1px solid #2A2550',
                      color: '#EEEAF8',
                      padding: '8px 10px',
                      borderRadius: 8,
                      outline: 'none',
                    }}
                  >
                    <option value="ta-IN">தமிழ்</option>
                    <option value="hi-IN">हिन्दी</option>
                    <option value="en-IN">English</option>
                  </select>
                </div>

                {/* Large mic button */}
                <button
                  onClick={() => !storyLocked && toggleRecording(selectedLanguage)}
                  disabled={storyLocked || recordingState === 'processing'}
                  aria-label={recordingState === 'recording' ? 'Stop recording' : 'Start recording'}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 9999,
                    background: '#7C6FE8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: storyLocked ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 32px rgba(124,111,232,0.5)',
                    animation: recordingState === 'recording' ? 'pulse 1.6s ease-in-out infinite' : undefined,
                  }}
                >
                  {recordingState === 'recording' ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="white" />
                      <path d="M19 11v1a7 7 0 0 1-14 0v-1" fill="white" />
                    </svg>
                  )}
                </button>

                <style>{`@keyframes pulse {0%,100% { box-shadow: 0 0 32px rgba(124,111,232,0.5);}50% { box-shadow: 0 0 48px rgba(124,111,232,0.8);} }`}</style>
              </div>
            )}

            {/* QUICK NOTE MODE */}
            {activeTab === 'quick' && (
              <input
                value={content}
                onChange={(e) => { setContent(e.target.value); setIsDirty(true); if (!storyLocked) setSaveStatus('unsaved'); }}
                placeholder="A quick note..."
                readOnly={storyLocked}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#EEEAF8',
                  fontFamily: "Lora, 'Lora', serif",
                  fontSize: 16,
                  lineHeight: '1.8',
                  width: '100%',
                  padding: '8px 0',
                }}
              />
            )}

          </div>

          {/* MOOD SELECTOR */}
          <div style={{ padding: '0 0 16px', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#9B93C4', marginBottom: 8 }}>Add a Mood</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
              {[
                { emoji: '😊', label: 'Happy' },
                { emoji: '🙏', label: 'Grateful' },
                { emoji: '🌿', label: 'Calm' },
                { emoji: '💜', label: 'Loved' },
                { emoji: '😔', label: 'Sad' },
              ].map((m) => {
                const selected = m.label === selectedMood;
                return (
                  <button key={m.label} onClick={() => setSelectedMood(selected ? '' : m.label)} style={{
                    padding: '8px 14px', borderRadius: 9999, whiteSpace: 'nowrap', border: `1px solid ${selected ? '#7C6FE8' : '#2A2550'}`, background: selected ? 'rgba(124,111,232,0.15)' : '#1C1836', color: selected ? '#EEEAF8' : '#9B93C4', fontFamily: 'var(--font-dm-sans)', fontSize: 13
                  }}>{`${m.emoji} ${m.label}`}</button>
                );
              })}
            </div>
          </div>

          {/* SAVE BUTTON area */}
          <div style={{ padding: '0 20px 24px' }}>
            <button
              onClick={saveEntry}
              disabled={storyLocked || !content.trim() || saveStatus === 'saving'}
              style={{
                width: '100%',
                background: '#7C6FE8',
                color: 'white',
                borderRadius: 9999,
                padding: 16,
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 16,
                fontWeight: 600,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: storyLocked || !content.trim() ? 0.4 : 1,
                cursor: storyLocked || !content.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {saveStatus === 'saving' ? (
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.6)', borderTopColor: 'white', borderRadius: '50%', animation: 'kathaSpin 0.8s linear infinite' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2 4 4 .5-3 2 1 4-3-2-3 2 1-4-3-2L10 6 12 2z" fill="white"/></svg>
              )}
              <span>Save Moment</span>
            </button>
          </div>
        </div>
      </main>

      <style>{`@keyframes kathaSpin { to { transform: rotate(360deg); } }`}</style>
    </>
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

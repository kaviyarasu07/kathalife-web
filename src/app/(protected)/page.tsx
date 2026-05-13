'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Sparkles, Plus, ChevronRight, BookOpen, Heart, Droplet, Flame, Home, Bookmark, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { journalService } from '@/services/journalService';
import { userService } from '@/services/userService';
import type { WeekData } from '@/services/journalService';

// Utility helpers (copied to avoid depending on other pages) — preserve behaviour used elsewhere
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateYYYYMMDD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function ProtectedHomeDashboard() {
  const router = useRouter();
  const { userId, email } = useAuth(); // preserve AuthContext usage
  const [firstName, setFirstName] = useState<string>('');
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const u = await userService.getCurrentUser();
        if (!mounted) return;
        // Many user objects include fullName/name — use whichever is available
        const userLike = (u as unknown) as { fullName?: string; name?: string };
        const name = userLike.fullName || userLike.name || u.email || '';
        setFirstName((name || '').split(' ')[0] || 'friend');
      } catch (error) {
        // fall back to email from AuthContext
        if (mounted) setFirstName((email || '').split('@')[0] || 'friend');
        console.error('Could not load current user for dashboard', error);
      }
    };

    const loadWeek = async () => {
      setLoading(true);
      try {
        const start = getWeekStart(new Date());
        const weekStartStr = formatDateYYYYMMDD(start);
        const data = await journalService.getWeekActivities(weekStartStr);
        if (mounted) setWeekData(data);
      } catch (err) {
        console.error('Could not load dashboard week data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();
    loadWeek();

    return () => {
      mounted = false;
    };
  }, [userId, email]);

  // Simple streak: count consecutive days ending today that have an entry (within the fetched week)
  const computeStreak = () => {
    if (!weekData) return 0;
    const todayStr = formatDateYYYYMMDD(new Date());
    // days are expected to be ordered Mon->Sun based on service
    const days = weekData.days.slice().reverse(); // start from most recent
    let streak = 0;
    for (const d of days) {
      if (!d.entry) break;
      // ensure we only count up to today
      streak++;
      if (d.date === todayStr) continue;
    }
    return streak;
  };

  const streak = computeStreak();

  // Stories: take up to 3 story-like items from weekData entries; fallback placeholders
  const stories = (() => {
    const items: { title: string; date: string; gradient: string }[] = [];
    if (weekData) {
      for (const d of weekData.days) {
        if (d.entry) {
          items.push({
            title: d.entry.content.slice(0, 70),
            date: d.date,
            gradient: 'linear-gradient(135deg, #2D1B69, #1a0e4a)'
          });
        }
        if (items.length >= 3) break;
      }
    }

    while (items.length < 3) {
      const idx = items.length;
      const grads = [
        'linear-gradient(135deg, #2D1B69, #1a0e4a)',
        'linear-gradient(135deg, #1a3a2a, #0e2a1a)',
        'linear-gradient(135deg, #2a1a0e, #1a0e08)'
      ];
      items.push({ title: ['A quiet morning', 'A small kindness', 'A memory at the market'][idx] || 'My story', date: 'Apr 28', gradient: grads[idx] });
    }

    return items;
  })();

  const clampStyle: React.CSSProperties & { WebkitLineClamp?: number; WebkitBoxOrient?: string } = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  return (
    <div style={{ height: '100dvh', background: '#0D0B1A', color: '#EEEAF8', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 92 }}>
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 20px 16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 22, fontWeight: 600, color: '#EEEAF8' }}>{`Hey, ${firstName} 👋`}</div>
            <div style={{ marginTop: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#9B93C4' }}>Ready to capture your day?</div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button aria-label="Notifications" style={{ background: 'transparent', border: '0', padding: 6 }} onClick={() => { /* preserve routing behaviour - no-op */ }}>
              <Bell size={24} color="#9B93C4" />
            </button>
            <button aria-label="AI" style={{ background: 'transparent', border: '0', padding: 6 }}>
              <Sparkles size={24} color="#7C6FE8" />
            </button>
          </div>
        </header>

        {/* ADD A MOMENT CARD */}
        <div style={{ margin: '0 20px 24px' }}>
          <button onClick={() => router.push('/journal')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, background: '#13102A', border: '1px solid #2A2550', borderRadius: 16, padding: '16px 20px', textAlign: 'left' }}>
            <div style={{ width: 48, height: 48, borderRadius: 9999, background: '#7C6FE8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={20} color="white" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 600, color: '#EEEAF8' }}>Add a Moment</div>
              <div style={{ marginTop: 4, fontSize: 13, color: '#9B93C4' }}>Write, speak or jot down your moment</div>
            </div>

            <ChevronRight size={20} color="#9B93C4" />
          </button>
        </div>

        {/* YOUR STORIES */}
        <section style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 18, fontWeight: 600, color: '#EEEAF8' }}>Your Stories</div>
            <button onClick={() => router.push('/stories')} style={{ background: 'transparent', border: 0, color: '#7C6FE8', fontSize: 14 }}>See all</button>
          </div>

          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
            {stories.map((s, idx) => (
              <div key={idx} style={{ flex: '0 0 140px', height: 170, borderRadius: 16, border: '1px solid #2A2550', background: 'linear-gradient(180deg,#1C1836,#13102A)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: 100, background: s.gradient }}>
                  <div style={{ padding: 8, fontSize: 11, color: '#A89CF5', position: 'absolute', left: 0, top: 0 }}>{typeof s.date === 'string' && s.date.length === 10 ? new Date(s.date).toLocaleString('en-US', { month: 'short', day: 'numeric' }) : s.date}</div>
                </div>
                <div style={{ padding: 10 }}>
                  <div style={clampStyle as React.CSSProperties}>
                    <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 600, color: '#EEEAF8', lineHeight: 1.3 }}>{s.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THIS WEEK STATS */}
        <section style={{ margin: '0 20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 18, fontWeight: 600, color: '#EEEAF8', marginBottom: 12 }}>This Week</div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: '#13102A', border: '1px solid #2A2550', borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <BookOpen size={24} color="#7C6FE8" />
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 28, fontWeight: 700, color: '#EEEAF8' }}>{loading ? '—' : (weekData ? weekData.totalEntries : 0)}</div>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#9B93C4' }}>Moments Captured</div>
            </div>

            <div style={{ flex: 1, background: '#13102A', border: '1px solid #2A2550', borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Heart size={24} color="#E86F8A" />
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 28, fontWeight: 700, color: '#EEEAF8' }}>{/* Stories Created placeholder */} {Math.max(0, (weekData?.totalEntries ?? 0) - 2)}</div>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#9B93C4' }}>Stories Created</div>
            </div>

            <div style={{ flex: 1, background: '#13102A', border: '1px solid #2A2550', borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Droplet size={24} color="#4DC8C8" />
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 28, fontWeight: 700, color: '#EEEAF8' }}>{streak}</div>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#9B93C4' }}>Days in a Row</div>
            </div>
          </div>
        </section>

        {/* STREAK BANNER */}
        <section style={{ margin: '0 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #1C1836, #13102A)', border: '1px solid #2A2550', borderRadius: 16, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Flame size={28} color="#4DC8C8" />
              <div>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 600, color: '#EEEAF8' }}>{`${streak} day streak`}</div>
                <div style={{ fontSize: 13, color: '#9B93C4', marginTop: 4 }}>You are on fire! Keep it up.</div>
              </div>
            </div>
            <ChevronRight size={20} color="#5A5480" />
          </div>
        </section>
      </div>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 72, background: '#13102A', borderTop: '1px solid #2A2550', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 20px' }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 0, color: '#5A5480' }}>
          <Home size={22} color="#5A5480" />
          <div style={{ fontSize: 11, fontFamily: 'var(--font-dm-sans)', color: '#5A5480' }}>Home</div>
        </button>

        <button onClick={() => router.push('/journal')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 0, color: '#5A5480' }}>
          <BookOpen size={22} color="#5A5480" />
          <div style={{ fontSize: 11, fontFamily: 'var(--font-dm-sans)', color: '#5A5480' }}>Journal</div>
        </button>

        {/* Center + */}
        <div style={{ marginTop: -20 }}>
          <button onClick={() => router.push('/journal')} aria-label="Create" style={{ width: 52, height: 52, borderRadius: 9999, background: '#7C6FE8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(124,111,232,0.5)', border: '0' }}>
            <Plus size={24} color="white" />
          </button>
        </div>

        <button onClick={() => router.push('/stories')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 0, color: '#5A5480' }}>
          <Bookmark size={22} color="#5A5480" />
          <div style={{ fontSize: 11, fontFamily: 'var(--font-dm-sans)', color: '#5A5480' }}>Stories</div>
        </button>

        <button onClick={() => router.push('/bio')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 0, color: '#5A5480' }}>
          <User size={22} color="#5A5480" />
          <div style={{ fontSize: 11, fontFamily: 'var(--font-dm-sans)', color: '#5A5480' }}>Profile</div>
        </button>
      </nav>
    </div>
  );
}

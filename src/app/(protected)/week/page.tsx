'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import UserMenuDropdown from '@/components/UserMenuDropdown';
import { journalService, WeekData } from '@/services/journalService';
import { userService } from '@/services/userService';
import type { UserResponse } from '@/types';

type UserWithOptionalName = UserResponse & {
  fullName?: string | null;
  name?: string | null;
};

// --- Utils ---
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  // Treat Monday as the start of the week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

// ISO week number helper (Monday as first day of week)
function getISOWeek(date: Date): number {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7; // Monday=1, Sunday=7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

const getDayNumber = (dateStr: string): number => {
  // Safely extract day without timezone shifting risks
  return parseInt(dateStr.split('-')[2], 10);
};

export default function WeekPage() {
  const router = useRouter();
  const currentWeekStart = getWeekStart(new Date());

  // --- State ---
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(currentWeekStart);
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

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
        console.error('Could not load current user for week avatar.', err);
      }
    };

    loadUserName();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Fetch Week Data ---
  useEffect(() => {
    const fetchWeek = async () => {
      setLoading(true);
      setError('');
      
      try {
        const weekStartStr = formatDateYYYYMMDD(selectedWeekStart);
        const data = await journalService.getWeekActivities(weekStartStr);
        setWeekData(data);
      } catch (err) {
        console.error('Could not load weekly journal activities.', err);
        setError('Could not load your week. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeek();
  }, [selectedWeekStart]);

  // --- Handlers ---
  const handlePrevWeek = () => {
    setSelectedWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setSelectedWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // --- Derived Values ---
  const isCurrentWeek = selectedWeekStart.getTime() === currentWeekStart.getTime();
  const todayStr = formatDateYYYYMMDD(new Date());
  const isSaturday = new Date().getDay() === 6;
  
  const canGenerateStory = weekData && (weekData.totalEntries >= 5 || isSaturday);

  return (
    <div className="min-h-screen bg-[#fdfaf6] px-6 py-6 md:py-10 md:px-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        <UserMenuDropdown userName={userName} />

        {/* Header Navigation */}
        <div className="flex justify-between items-end mt-4 mb-8">
          <button 
            onClick={handlePrevWeek}
            className="p-2 text-gray-400 hover:text-orange-500 bg-white rounded-full shadow-sm border border-gray-100 transition-colors"
            disabled={loading}
          >
            &larr; <span className="hidden sm:inline ml-1">Prev</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Your Week</h1>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">
              Week {getISOWeek(selectedWeekStart)}
            </p>
          </div>

          <button 
            onClick={handleNextWeek}
            disabled={isCurrentWeek || loading}
            className={`p-2 rounded-full shadow-sm border transition-colors ${
              isCurrentWeek || loading ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-gray-100 text-gray-400 hover:text-orange-500'
            }`}
          >
            <span className="hidden sm:inline mr-1">Next</span> &rarr;
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center text-sm font-medium">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : weekData && (
          <>
            {/* 1. WEEK STRIP (Overview) */}
            <div className="flex justify-between gap-2 mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              {weekData.days.map((day) => {
                const isToday = day.date === todayStr;
                return (
                  <div key={`strip-${day.date}`} className="flex flex-col items-center min-w-[40px]">
                    <span className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">{day.dayOfWeek.substring(0, 3)}</span>
                    <span className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 bg-gray-50'}`}>
                      {getDayNumber(day.date)}
                    </span>
                    <span className="mt-3 text-xs">
                      {day.entry ? '✅' : '○'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 2. DAY CARDS (Detailed view) */}
            <div className="grid gap-4 mb-10">
              {weekData.days.map((day) => {
                const isToday = day.date === todayStr;
                const hasEntry = !!day.entry;
                
                return (
                  <div
                    key={`card-${day.date}`}
                    onClick={() => router.push(`/journal?date=${day.date}`)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-md ${
                      isToday ? 'ring-2 ring-orange-200 border-orange-200' : 'border-gray-100'
                    } ${
                      hasEntry ? 'bg-orange-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-800 text-lg">{day.dayOfWeek}</span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{day.date}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${hasEntry ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                      {hasEntry ? (day.entry!.content.substring(0, 80) + (day.entry!.content.length > 80 ? '...' : '')) : 'No entry yet. Click to write.'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 3. SUMMARY & STORY BUTTON */}
            <div className="text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm mb-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Weekly Story</h3>
              <p className="text-gray-500 text-sm mb-8">You wrote <span className="font-semibold text-gray-700">{weekData.totalEntries}</span> entries this week.</p>
              
              <button 
                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:transform-none"
                disabled={!canGenerateStory}
              >
                ✨ Create My Story
              </button>
              
              {!canGenerateStory && (
                <p className="text-xs text-gray-400 mt-4 font-medium">
                  Write at least 5 days to unlock your story.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

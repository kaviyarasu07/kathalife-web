import api from './api'; // Adjust if your axios instance is located elsewhere (e.g., '@/lib/api')
import type { AxiosError } from 'axios';
import type { SttLanguageCode, SttTranscriptResponse } from '@/types';

export interface JournalEntry {
  id?: string;
  activityDate: string;
  content: string;
  storyLocked: boolean;
}

export interface WeekDayActivity {
  date: string;
  dayOfWeek: string;
  entry: JournalEntry | null;
}

export interface WeekData {
  weekStart: string;
  weekEnd: string;
  totalEntries: number;
  storyGenerated: boolean;
  days: WeekDayActivity[];
}

export const journalService = {
  getActivityByDate: async (dateStr: string): Promise<JournalEntry | null> => {
    try {
      const response = await api.get(`/v1/journal/activities?date=${dateStr}`);
      return response.data.data;
    } catch (error) {
      // Gracefully handle a 404 response (no entry for the selected date) 
      // by returning null, which gives the user a blank page to write on.
      const status = (error as AxiosError).response?.status;
      if (status === 404) {
        return null;
      }
      throw error;
    }
  },

  saveActivity: async (payload: { content: string; activityDate: string }): Promise<void> => {
    await api.post('/v1/journal/activities', payload);
  },

  getWeekActivities: async (weekStartStr: string): Promise<WeekData> => {
    const response = await api.get(`/v1/journal/activities/week?weekStart=${weekStartStr}`);
    return response.data.data;
  }
};

export const transcribeAudio = async (
  audioBlob: Blob,
  languageCode: SttLanguageCode
): Promise<SttTranscriptResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  const response = await api.post<SttTranscriptResponse>(
    `/v1/stt/transcribe?language=${languageCode}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

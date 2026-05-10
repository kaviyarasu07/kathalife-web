// Auto-generated types matching backend DTOs

// Auth types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  bioCompleted: boolean;
  userId: string;
  email: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User types
export interface UserResponse {
  id: string;
  email: string;
  languagePref: string | null;
  isActive: boolean;
  bioCompleted: boolean;
}

export interface BioProfileRequest {
  fullName?: string;
  dateOfBirth?: string;
  hometown?: string;
  occupation?: string;
  familyNotes?: string;
  languagePref?: string;
}

export interface BioProfileResponse {
  id: string | null;
  fullName: string | null;
  dateOfBirth: string | null;
  hometown: string | null;
  occupation: string | null;
  familyNotes: string | null;
  profilePicUrl: string | null;
  languagePref: string | null;
  updatedAt: string | null;
}

export interface LifeSummaryRequest {
  summaryText: string;
}

export interface LifeSummaryResponse {
  id: string | null;
  summaryText: string | null;
  lastUpdatedAt: string | null;
}

// Language types
export interface LanguageResponse {
  code: string;
  name: string;
  nativeName: string;
  ttsSupported: boolean;
  sttSupported: boolean;
}

// Journal types
export interface ActivityRequest {
  content: string;
  activityDate?: string;
}

export interface ActivityResponse {
  id: string;
  content: string;
  activityDate: string;
  sttStatus: string;
  storyLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayEntryResponse {
  date: string;
  dayOfWeek: string;
  entry: ActivityResponse | null;
}

export interface WeekActivitiesResponse {
  weekStart: string;
  weekEnd: string;
  totalEntries: number;
  storyGenerated: boolean;
  days: DayEntryResponse[];
}

export interface SttTranscriptResponse {
  transcript: string;
  languageCode: string;
}

export type SttLanguageCode = 'ta-IN' | 'hi-IN' | 'en-IN';

export interface SttLanguageOption {
  code: SttLanguageCode;
  label: string;
  nativeLabel: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

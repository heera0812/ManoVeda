export type ThemeId = 'blue' | 'rose' | 'amber';

export type GenderOption = 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';

export type AgeRange = '16-18' | '19-21' | '22-24' | '25+';

export type MoodValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface MoodConfig {
  value: MoodValue;
  emoji: string;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
}

export type MoodFactor =
  | 'Academics'
  | 'Stress'
  | 'Sleep'
  | 'Family'
  | 'Relationships'
  | 'Friends'
  | 'Loneliness'
  | 'Money'
  | 'Career'
  | 'Social media'
  | 'Health/wellbeing'
  | 'Nothing specific'
  | 'I\'m not sure';

export interface CheckInRecord {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // e.g. Mon 12
  mood: MoodValue;
  moodLabel: string;
  factors: MoodFactor[];
  energy?: number; // 1 to 5
  sleep?: number; // 1 to 5
  journalText?: string;
  journalPrompt?: string;
}

export interface UserBaseline {
  overallMood: string;
  stress: string;
  sleep: string;
  energy: string;
  socialConnection: string;
  academicPressure: string;
  mainConcerns: string[];
  selfWorth?: string;
  supportNetwork?: string;
  dailyFunctioning?: string;
  previousExperience?: string;
  createdAt: string;
}

export interface Counselor {
  id: string;
  name: string;
  title: string;
  photo: string;
  badge?: string;
  experienceYears: number;
  rating: number;
  specializations: string[];
  sessionTypes: ('In-Person Wellness Center' | 'Secure Video Call')[];
  intro: string;
  approach: string;
  availableDays: string[];
  availableSlots: { [dateStr: string]: string[] };
}

export interface Booking {
  id: string;
  counselorId: string;
  counselorName: string;
  counselorTitle: string;
  counselorPhoto: string;
  date: string;
  time: string;
  sessionType: 'In-Person Wellness Center' | 'Secure Video Call';
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  shareMoodTrend: boolean;
  notes?: string;
  bookedAt: number;
}

export interface PatternObservation {
  id: string;
  title: string;
  description: string;
  category: 'mood' | 'sleep' | 'academics' | 'energy' | 'social';
  confidence: 'High' | 'Moderate';
  dismissed: boolean;
  userFeedback?: 'accurate' | 'inaccurate';
  detectedDate: string;
}

export interface WeeklyReflection {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  avgMoodScore: number;
  avgMoodLabel: string;
  energyTrend: string;
  sleepTrend: string;
  topFactor: string;
  checkInCount: number;
  changeFromLastWeek: string;
  userReflectionNote?: string;
  completedAt?: number;
}

export interface MicroExercise {
  id: string;
  title: string;
  tagline: string;
  category: 'breathing' | 'grounding' | 'focus' | 'reframe' | 'sleep';
  durationMinutes: number;
  targetFactor?: MoodFactor;
  description: string;
  steps: {
    title: string;
    instruction: string;
    durationSeconds?: number;
  }[];
}

export interface UserProfile {
  name: string;
  gender: GenderOption;
  theme: ThemeId;
  ageRange: AgeRange;
  completedOnboarding: boolean;
  baseline: UserBaseline | null;
  notificationFrequency: 'daily' | 'few_times_week' | 'none';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  privacy: {
    shareMoodByDefault: boolean;
    anonymousCampusAnalytics: boolean;
    encryptedLocalOnly: boolean;
  };
  supportPromptDismissedUntil?: number;
}

export type ActiveTab =
  | 'home'
  | 'checkin'
  | 'pulse'
  | 'patterns'
  | 'counseling'
  | 'exercises'
  | 'profile';

export interface WellnessQuestion {
  id: string;
  text: string;
  reverseScore?: boolean;
}

export interface WellnessCheckin {
  id: string;
  title: string;
  subtitle: string;
  questions: WellnessQuestion[];
  interpretation: {
    labels: [string, string, string, string]; // [Low, Mild, Moderate, High] or equivalent
    type: 'concern' | 'positive'; // 'concern' = higher score is worse (e.g. Stress), 'positive' = higher score is better (e.g. Connection)
  };
}

export interface WellnessResult {
  checkinId: string;
  score: number;
  percentage: number;
  categoryIndex: 0 | 1 | 2 | 3; // 0 = 0-24%, 1 = 25-49%, 2 = 50-74%, 3 = 75-100%
  completedAt: number;
}

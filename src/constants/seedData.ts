import {
  Booking,
  CheckInRecord,
  MoodFactor,
  MoodValue,
  PatternObservation,
  UserBaseline,
  UserProfile,
  WeeklyReflection,
} from '../types';
import { getLocalDateKey } from '../utils/date';

export const INITIAL_BASELINE: UserBaseline = {
  overallMood: 'Good',
  stress: 'Moderate',
  energy: 'Moderate',
  sleep: 'Okay',
  socialConnection: 'Connected',
  academicPressure: 'High',
  mainConcerns: ['Studies', 'Career/future', 'Sleep', 'Stress'],
  previousExperience: 'Used mindfulness apps before',
  createdAt: '2026-08-01',
};

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  gender: 'male',
  theme: 'blue',
  ageRange: '19-21',
  completedOnboarding: true,
  baseline: INITIAL_BASELINE,
  notificationFrequency: 'few_times_week',
  quietHoursEnabled: true,
  quietHoursStart: '23:00',
  quietHoursEnd: '08:00',
  privacy: {
    shareMoodByDefault: false,
    anonymousCampusAnalytics: true,
    encryptedLocalOnly: true,
  },
};

// Generates 14 days of realistic check-in history ending yesterday
export function generateSeedCheckIns(): CheckInRecord[] {
  const records: CheckInRecord[] = [];
  const daysAgoList: {
    daysAgo: number;
    mood: MoodValue;
    factors: MoodFactor[];
    energy: number;
    sleep: number;
    journal: string;
    prompt: string;
  }[] = [
    { daysAgo: 13, mood: 5, factors: ['Academics', 'Sleep'], energy: 4, sleep: 4, journal: "Felt good after finishing the lab assignment early.", prompt: "What's one thing that happened today?" },
    { daysAgo: 12, mood: 5, factors: ['Friends', 'Health/wellbeing'], energy: 4, sleep: 5, journal: "Had lunch with study group outside.", prompt: "One moment from today you'd like to acknowledge:" },
    { daysAgo: 11, mood: 4, factors: ['Academics', 'Stress'], energy: 3, sleep: 3, journal: "Long lecture block, feeling a bit sluggish.", prompt: "A thought that's been lingering in your mind..." },
    { daysAgo: 10, mood: 6, factors: ['Academics', 'Friends'], energy: 5, sleep: 4, journal: "Got an A on the midterm project! Celebrated with coffee.", prompt: "What's making today feel good?" },
    { daysAgo: 9, mood: 4, factors: ['Sleep', 'Nothing specific'], energy: 3, sleep: 3, journal: "", prompt: "" },
    { daysAgo: 8, mood: 3, factors: ['Academics', 'Stress', 'Sleep'], energy: 2, sleep: 2, journal: "Didn't sleep well before the group presentation.", prompt: "What's one thing that happened today?" },
    { daysAgo: 7, mood: 3, factors: ['Academics', 'Career', 'Stress'], energy: 2, sleep: 3, journal: "Internship deadlines are piling up alongside problem sets.", prompt: "What would feel comforting or helpful right now?" },
    { daysAgo: 6, mood: 4, factors: ['Relationships', 'Sleep'], energy: 3, sleep: 3, journal: "Talked with family over the weekend. Reset a bit.", prompt: "A thought that's been lingering in your mind..." },
    { daysAgo: 5, mood: 5, factors: ['Health/wellbeing', 'Friends'], energy: 4, sleep: 4, journal: "Went for a 20-minute walk between classes.", prompt: "What's making today feel good?" },
    { daysAgo: 4, mood: 3, factors: ['Academics', 'Sleep', 'Stress'], energy: 2, sleep: 2, journal: "Stayed up until 2am finishing revisions.", prompt: "What is something your mind is holding onto right now?" },
    { daysAgo: 3, mood: 2, factors: ['Academics', 'Stress', 'Loneliness'], energy: 2, sleep: 2, journal: "Heavy brain fog today. Felt disconnected during seminar.", prompt: "What would feel comforting or helpful right now?" },
    { daysAgo: 2, mood: 3, factors: ['Academics', 'Career'], energy: 3, sleep: 3, journal: "Met with academic advisor. Feeling slightly clearer on course path.", prompt: "One moment from today you'd like to acknowledge:" },
    { daysAgo: 1, mood: 4, factors: ['Sleep', 'Health/wellbeing'], energy: 3, sleep: 4, journal: "Got 8 hours of sleep last night. Noticeably calmer.", prompt: "What's one thing that happened today?" },
  ];

  const now = new Date();

  daysAgoList.forEach((item, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - item.daysAgo);
    const dateStr = getLocalDateKey(d);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const moodLabels: Record<number, string> = {
      6: 'Great',
      5: 'Good',
      4: 'Okay',
      3: 'Not great',
      2: 'Low',
      1: 'Really struggling',
    };

    records.push({
      id: `seed-checkin-${idx}`,
      timestamp: d.getTime(),
      dateStr,
      dayLabel,
      mood: item.mood,
      moodLabel: moodLabels[item.mood],
      factors: item.factors,
      energy: item.energy,
      sleep: item.sleep,
      journalText: item.journal,
      journalPrompt: item.prompt,
    });
  });

  return records;
}

export const INITIAL_PATTERNS: PatternObservation[] = [
  {
    id: 'pattern-1',
    title: 'Academic Pressure & Mood Correlation',
    description: 'Academic pressure has appeared in 65% of your lower-energy check-ins over the past two weeks.',
    category: 'academics',
    confidence: 'High',
    dismissed: false,
    detectedDate: '3 days ago',
  },
  {
    id: 'pattern-2',
    title: 'Sleep Quality as a Mood Stabilizer',
    description: 'Your mood average rises significantly (from 3.1 to 5.2) on days following 4+ star sleep ratings.',
    category: 'sleep',
    confidence: 'High',
    dismissed: false,
    detectedDate: 'Yesterday',
  },
  {
    id: 'pattern-3',
    title: 'Mid-Week Energy Dips',
    description: 'Tuesdays and Wednesdays consistently reflect your lowest reported energy levels across class schedules.',
    category: 'energy',
    confidence: 'Moderate',
    dismissed: false,
    detectedDate: '5 days ago',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_WEEKLY_REFLECTION: WeeklyReflection = {
  id: 'week-reflection-1',
  weekLabel: 'Past 7 Days Review',
  startDate: 'Aug 8',
  endDate: 'Aug 14',
  avgMoodScore: 3.6,
  avgMoodLabel: 'Okay / Mild Fatigue',
  energyTrend: 'Dipping mid-week, recovering on weekends',
  sleepTrend: 'Averaging 3.2 / 5 (improving over last 2 nights)',
  topFactor: 'Academics (noted in 5 check-ins)',
  checkInCount: 6,
  changeFromLastWeek: '-0.4 from previous baseline',
  userReflectionNote: 'Midterms were heavy, but starting to get my sleep back on track.',
  completedAt: Date.now() - 86400000 * 1,
};

import { MoodConfig, MoodFactor, MoodValue } from '../types';

export const MOOD_CONFIGS: Record<MoodValue, MoodConfig> = {
  6: {
    value: 6,
    emoji: '😄',
    label: 'Great',
    description: 'Feeling energized, joyful, or accomplished',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900',
  },
  5: {
    value: 5,
    emoji: '🙂',
    label: 'Good',
    description: 'Steady, content, and in a pleasant space',
    colorClass: 'text-teal-700 dark:text-teal-400',
    bgClass: 'bg-teal-500/10 border-teal-500/30 text-teal-900',
  },
  4: {
    value: 4,
    emoji: '😐',
    label: 'Okay',
    description: 'Neutral, floating through the day, calm',
    colorClass: 'text-amber-700 dark:text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-900',
  },
  3: {
    value: 3,
    emoji: '😕',
    label: 'Not great',
    description: 'Slightly drained, stressed, or off balance',
    colorClass: 'text-orange-700 dark:text-orange-400',
    bgClass: 'bg-orange-500/10 border-orange-500/30 text-orange-900',
  },
  2: {
    value: 2,
    emoji: '😔',
    label: 'Low',
    description: 'Heavy, overwhelmed, sad, or low motivation',
    colorClass: 'text-indigo-700 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900',
  },
  1: {
    value: 1,
    emoji: '😣',
    label: 'Really struggling',
    description: 'Exhausted, very high distress, needing gentleness',
    colorClass: 'text-rose-700 dark:text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-900',
  },
};

export const ALL_MOOD_FACTORS: MoodFactor[] = [
  'Academics',
  'Stress',
  'Sleep',
  'Family',
  'Relationships',
  'Friends',
  'Loneliness',
  'Money',
  'Career',
  'Social media',
  'Health/wellbeing',
  'Nothing specific',
  'I\'m not sure',
];

export const JOURNAL_PROMPTS = [
  "What's one thing that happened today, big or small?",
  "What would feel comforting or helpful right now?",
  "A thought that's been lingering in your mind...",
  "One moment from today you'd like to acknowledge:",
  "What is something your mind is holding onto right now?",
];

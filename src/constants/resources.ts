import { MicroExercise } from '../types';

export const MICRO_EXERCISES: MicroExercise[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing Reset',
    tagline: 'Regulate your autonomic nervous system in 2 minutes',
    category: 'breathing',
    durationMinutes: 2,
    targetFactor: 'Stress',
    description: 'A 4x4 balanced breathing pattern used to down-regulate the nervous system during acute stress or pre-exam jitters.',
    steps: [
      { title: 'Inhale', instruction: 'Breathe in slowly and deeply through your nose', durationSeconds: 4 },
      { title: 'Hold', instruction: 'Gently hold the breath at the top without straining', durationSeconds: 4 },
      { title: 'Exhale', instruction: 'Release all the air through your mouth softly', durationSeconds: 4 },
      { title: 'Rest', instruction: 'Hold the space at the bottom of your breath in stillness', durationSeconds: 4 },
    ],
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Sensory Grounding',
    tagline: 'Anchor yourself in the present room right now',
    category: 'grounding',
    durationMinutes: 3,
    targetFactor: 'Academics',
    description: 'When your thoughts are racing into future spirals, use your five senses to ground your body in physical reality.',
    steps: [
      { title: '5 Things You Can See', instruction: 'Look around your room or desk. Silently name 5 distinct physical objects (e.g. lamp, notebook, cup).' },
      { title: '4 Things You Can Feel', instruction: 'Notice 4 physical sensations (e.g. feet on the floor, sweater on arms, chair back support).' },
      { title: '3 Things You Can Hear', instruction: 'Tune into 3 subtle auditory cues (e.g. clock hum, footsteps outside, distant AC).' },
      { title: '2 Things You Can Smell', instruction: 'Notice 2 scents in your environment or breathe in fresh air.' },
      { title: '1 Thing You Can Taste', instruction: 'Notice the lingering taste of coffee, water, or take a sip of cool water.' },
    ],
  },
  {
    id: 'academic-focus-reset',
    title: '3-Minute Academic De-Clutter',
    tagline: 'Break cognitive paralysis when overwhelmed with assignments',
    category: 'focus',
    durationMinutes: 3,
    targetFactor: 'Academics',
    description: 'Transform overwhelming academic dread into 1 micro-action step with zero judgment.',
    steps: [
      { title: 'The Brain Dump', instruction: 'Set down every pending task. Acknowledge that doing everything simultaneously is impossible.' },
      { title: 'Pick The Micro-Step', instruction: 'Find the single smallest 5-minute action: opening the document, writing one sentence, or reading 1 page.' },
      { title: 'Permitted Imperfection', instruction: 'Give yourself explicit permission for the first draft or attempt to be messy and imperfect.' },
    ],
  },
  {
    id: 'cognitive-reframe',
    title: 'Perspective & Reframe Shift',
    tagline: 'Unpack catastrophizing thoughts with gentle curiosity',
    category: 'reframe',
    durationMinutes: 4,
    targetFactor: 'Relationships',
    description: 'A non-judgmental CBT-based reflection to distinguish feelings from hard facts.',
    steps: [
      { title: 'Identify The Thought', instruction: 'What absolute story is your mind telling you right now? (e.g. "I am falling behind everyone else")' },
      { title: 'Look For The Middle Gray', instruction: 'Is there a gentler, more realistic explanation that leaves room for being human?' },
      { title: 'Self-Compassion Statement', instruction: 'Say to yourself: "I am doing the best I can with the energy I have today, and that is enough."' },
    ],
  },
  {
    id: 'sleep-winddown',
    title: 'Late Night Somatic Release',
    tagline: 'Release tension in your jaw, shoulders, and brow before sleep',
    category: 'sleep',
    durationMinutes: 3,
    targetFactor: 'Sleep',
    description: 'Systematic progressive relaxation to dissolve academic tension held in the physical body.',
    steps: [
      { title: 'Jaw & Facial Unclench', instruction: 'Drop your tongue from the roof of your mouth, unclench your teeth, soften your forehead.' },
      { title: 'Shoulder Drop', instruction: 'Inhale your shoulders up to your ears, then let them drop completely down with a heavy exhale.' },
      { title: 'Hands & Torso', instruction: 'Open your palms flat, release tension in your stomach, and breathe into your belly.' },
    ],
  },
];

export const PEER_REFLECTIONS = [
  {
    factor: 'Academics',
    text: '48% of students on campus reported academic pressure this week. You are not alone in feeling the midterm weight.',
  },
  {
    factor: 'Sleep',
    text: 'Many students are navigating irregular sleep rhythms this semester. Small rests during the day still support your recovery.',
  },
  {
    factor: 'Loneliness',
    text: 'Over 1 in 3 students experience feelings of disconnection during term transitions. Be gentle with your social pace.',
  },
  {
    factor: 'Career',
    text: 'Career and future uncertainty is the most discussed topic among juniors & seniors this month.',
  },
];

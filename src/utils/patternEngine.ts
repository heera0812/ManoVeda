import { CheckInRecord, MoodFactor, PatternObservation, UserBaseline } from '../types';

export function analyzePatterns(records: CheckInRecord[]): {
  patterns: PatternObservation[];
  hasSufficientData: boolean;
  checkInCount: number;
} {
  const activeRecords = [...records]
    .filter(r => Boolean(r.mood))
    .sort((a, b) => b.timestamp - a.timestamp);
  const count = activeRecords.length;

  if (count < 5) {
    return {
      patterns: [],
      hasSufficientData: false,
      checkInCount: count,
    };
  }

  const generatedPatterns: PatternObservation[] = [];

  // 1. Factor correlation with low mood
  const lowMoodRecords = activeRecords.filter(r => r.mood <= 3);
  const factorCounts: Record<string, number> = {};

  lowMoodRecords.forEach(r => {
    r.factors.forEach(f => {
      if (f !== 'Nothing specific' && f !== 'I\'m not sure') {
        factorCounts[f] = (factorCounts[f] || 0) + 1;
      }
    });
  });

  const topLowFactor = Object.entries(factorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topLowFactor && topLowFactor[1] >= 2) {
    const percentage = Math.round((topLowFactor[1] / Math.max(1, lowMoodRecords.length)) * 100);
    generatedPatterns.push({
      id: `dyn-pattern-factor-${topLowFactor[0].toLowerCase().replace(/[^a-z]/g, '')}`,
      title: `${topLowFactor[0]} & Emotional Load`,
      description: `${topLowFactor[0]} was present in ${percentage}% of your lower-mood check-ins over recent days.`,
      category: topLowFactor[0] === 'Academics' ? 'academics' : topLowFactor[0] === 'Sleep' ? 'sleep' : 'mood',
      confidence: percentage >= 50 ? 'High' : 'Moderate',
      dismissed: false,
      detectedDate: 'Recently observed',
    });
  }

  // 2. Sleep vs Mood correlation
  const sleepRecords = activeRecords.filter(r => r.sleep !== undefined && r.sleep > 0);
  if (sleepRecords.length >= 4) {
    const highSleep = sleepRecords.filter(r => (r.sleep || 0) >= 4);
    const lowSleep = sleepRecords.filter(r => (r.sleep || 0) <= 2);

    if (highSleep.length >= 2 && lowSleep.length >= 2) {
      const avgMoodHighSleep = (highSleep.reduce((acc, r) => acc + r.mood, 0) / highSleep.length).toFixed(1);
      const avgMoodLowSleep = (lowSleep.reduce((acc, r) => acc + r.mood, 0) / lowSleep.length).toFixed(1);

      if (Number(avgMoodHighSleep) > Number(avgMoodLowSleep) + 0.8) {
        generatedPatterns.push({
          id: 'dyn-pattern-sleep-mood',
          title: 'Sleep Quality as a Stabilizer',
          description: `Your mood tends to be noticeably higher (avg ${avgMoodHighSleep}/6 vs ${avgMoodLowSleep}/6) on days following restorative sleep.`,
          category: 'sleep',
          confidence: 'High',
          dismissed: false,
          detectedDate: 'Ongoing trend',
        });
      }
    }
  }

  // 3. Energy pattern
  const energyRecords = activeRecords.filter(r => r.energy !== undefined);
  if (energyRecords.length >= 5) {
    const recent3 = energyRecords.slice(0, 3);
    const lowEnergyCount = recent3.filter(r => (r.energy || 0) <= 2).length;
    if (lowEnergyCount >= 2) {
      generatedPatterns.push({
        id: 'dyn-pattern-energy-dip',
        title: 'Recent Energy Strain',
        description: 'You have reported lower physical or mental energy over recent check-ins. Consider a brief somatic rest.',
        category: 'energy',
        confidence: 'Moderate',
        dismissed: false,
        detectedDate: 'This week',
      });
    }
  }

  // 4. Positive correlation
  const highMoodRecords = activeRecords.filter(r => r.mood >= 5);
  const positiveFactorCounts: Record<string, number> = {};
  highMoodRecords.forEach(r => {
    r.factors.forEach(f => {
      if (f !== 'Nothing specific' && f !== 'I\'m not sure') {
        positiveFactorCounts[f] = (positiveFactorCounts[f] || 0) + 1;
      }
    });
  });
  const topPosFactor = Object.entries(positiveFactorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topPosFactor && topPosFactor[1] >= 2) {
    generatedPatterns.push({
      id: `dyn-pattern-pos-${topPosFactor[0].toLowerCase().replace(/[^a-z]/g, '')}`,
      title: `${topPosFactor[0]} & Joy Boosts`,
      description: `Connecting with ${topPosFactor[0].toLowerCase()} frequently accompanies your most positive, energized days.`,
      category: 'social',
      confidence: 'Moderate',
      dismissed: false,
      detectedDate: 'Observed trend',
    });
  }

  return {
    patterns: generatedPatterns,
    hasSufficientData: true,
    checkInCount: count,
  };
}

export function shouldTriggerSupportRecommendation(
  records: CheckInRecord[],
  baseline: UserBaseline | null,
  dismissedUntil?: number
): boolean {
  if (dismissedUntil && Date.now() < dismissedUntil) {
    return false;
  }

  if (records.length < 3) return false;

  const recent = [...records].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
  const lowCount = recent.filter(r => r.mood <= 3).length;

  // If 2 or more of last 3 are low/struggling
  return lowCount >= 2;
}

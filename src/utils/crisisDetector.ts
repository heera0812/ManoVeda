export interface CrisisDetectionResult {
  hasRiskIndicator: boolean;
  message?: string;
}

const CRISIS_KEYWORDS = [
  'kill myself',
  'end it all',
  'suicide',
  'suicidal',
  'want to die',
  'no reason to live',
  'hurt myself',
  'self harm',
  'cutting myself',
  'better off dead',
  'can\'t go on living',
];

export function detectCrisisIndicators(text: string): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return { hasRiskIndicator: false };
  }

  const normalized = text.toLowerCase();
  const matched = CRISIS_KEYWORDS.some(kw => normalized.includes(kw));

  if (matched) {
    return {
      hasRiskIndicator: true,
      message:
        'We noticed you might be carrying something very heavy right now. You are never alone, and support is immediately available.',
    };
  }

  return { hasRiskIndicator: false };
}

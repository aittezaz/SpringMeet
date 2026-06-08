// Basic rule-based moderation (replace with AI API in production)
const BAD_WORDS = ['spam', 'scam', 'nude', 'sex', 'porn', 'kill', 'die', 'suicide', 'drug'];
const THREAT_WORDS = ['threat', 'hurt', 'attack', 'murder', 'bomb'];
const SPAM_PATTERN = /(.)\1{5,}/; // repeated chars

export interface ModerationResult {
  blocked: boolean;
  flagged: boolean;
  type: string;
  severity: number;
  score: number;
}

export async function moderateMessage(content: string): Promise<ModerationResult> {
  const lower = content.toLowerCase();

  // Threat detection
  if (THREAT_WORDS.some(w => lower.includes(w))) {
    return { blocked: true, flagged: true, type: 'THREAT', severity: 9, score: 0.95 };
  }

  // Spam detection
  if (SPAM_PATTERN.test(content) || content.length > 1500) {
    return { blocked: false, flagged: true, type: 'SPAM', severity: 4, score: 0.7 };
  }

  // Bad words
  if (BAD_WORDS.some(w => lower.includes(w))) {
    return { blocked: false, flagged: true, type: 'INAPPROPRIATE', severity: 5, score: 0.65 };
  }

  // URLs in timed chat (potential phishing)
  const urlPattern = /https?:\/\//gi;
  if (urlPattern.test(content)) {
    return { blocked: false, flagged: true, type: 'URL_SHARED', severity: 2, score: 0.3 };
  }

  return { blocked: false, flagged: false, type: 'CLEAN', severity: 0, score: 0.0 };
}

export type SelfAuditRatingKey =
  | 'excellent'
  | 'very_good'
  | 'sufficient'
  | 'weak'
  | 'insufficient'
  | 'empty';

export function getSelfAuditRating(score: number | null) {
  if (score === null || Number.isNaN(score)) return 'empty';
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'very_good';
  if (score >= 50) return 'sufficient';
  if (score >= 30) return 'weak';
  return 'insufficient';
}

export function getSelfAuditRatingLabel(score: number | null, lang: 'cs' | 'en') {
  const key = getSelfAuditRating(score);
  if (key === 'empty') return '';
  const labels: Record<SelfAuditRatingKey, { cs: string; en: string }> = {
    excellent: { cs: 'Výborné', en: 'Excellent' },
    very_good: { cs: 'Velmi dobré', en: 'Very good' },
    sufficient: { cs: 'Dostatečné', en: 'Sufficient' },
    weak: { cs: 'Slabé', en: 'Weak' },
    insufficient: { cs: 'Nedostatečné', en: 'Insufficient' },
    empty: { cs: '', en: '' },
  };
  return labels[key][lang];
}

export function getSelfAuditRatingColorClass(score: number | null) {
  const key = getSelfAuditRating(score);
  if (key === 'excellent') return 'text-emerald-700';
  if (key === 'very_good') return 'text-green-600';
  if (key === 'sufficient') return 'text-amber-600';
  if (key === 'weak') return 'text-orange-700';
  if (key === 'insufficient') return 'text-red-600';
  return 'text-stone-500';
}

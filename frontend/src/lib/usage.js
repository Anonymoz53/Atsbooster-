// localStorage key for tracking usage
const USAGE_KEY = 'ats_optimizer_usage';
const FREE_LIMIT = 3;

export function getUsageCount() {
  try {
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    return data.count || 0;
  } catch {
    return 0;
  }
}

export function incrementUsage() {
  const count = getUsageCount();
  localStorage.setItem(USAGE_KEY, JSON.stringify({ count: count + 1 }));
}

export function getFreeRemaining() {
  return Math.max(0, FREE_LIMIT - getUsageCount());
}

export function isPaywalled() {
  return getUsageCount() >= FREE_LIMIT;
}

export const FREE_LIMIT_CONST = FREE_LIMIT;

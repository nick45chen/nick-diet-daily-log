// ===== Daily Meal Data Repository =====

import { state } from '../state.js';
import { fetchJSON } from '../api.js';

export async function getDayData(dateStr, { forceRefresh = false } = {}) {
  if (!forceRefresh && state.dayCache[dateStr]) return state.dayCache[dateStr];
  const data = await fetchJSON(`data/${dateStr}.json`);
  if (data) state.dayCache[dateStr] = data;
  return data;
}

export function getCachedDay(dateStr) {
  return state.dayCache[dateStr] || null;
}

export function clearDayCache() {
  state.dayCache = {};
}

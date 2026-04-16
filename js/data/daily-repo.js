// ===== Daily Meal Data Repository =====

import { state } from '../state.js';
import { fetchJSON } from '../api.js';

function mealPath(dateStr) {
  const [yyyy, mm] = dateStr.split('-');
  return `data/meals/${yyyy}/${mm}/${dateStr}.json`;
}

export async function getDayData(dateStr, { forceRefresh = false } = {}) {
  if (!forceRefresh && state.dayCache[dateStr]) return state.dayCache[dateStr];
  const data = await fetchJSON(mealPath(dateStr));
  if (data) state.dayCache[dateStr] = data;
  return data;
}

export function getCachedDay(dateStr) {
  return state.dayCache[dateStr] || null;
}

export function clearDayCache() {
  state.dayCache = {};
}

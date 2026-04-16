// ===== InBody Data Repository =====

import { state } from '../state.js';
import { fetchJSON } from '../api.js';

export async function getInBodyData(dateStr, { forceRefresh = false } = {}) {
  if (!forceRefresh && state.inbodyCache[dateStr]) return state.inbodyCache[dateStr];
  const data = await fetchJSON(`data/inbody/${dateStr}.json`);
  if (data) state.inbodyCache[dateStr] = data;
  return data;
}

export async function getLatestInBody() {
  const dates = getInBodyDates();
  if (dates.length === 0) return null;
  const latestDate = dates[dates.length - 1];
  return getInBodyData(latestDate);
}

export async function getAllInBodyData() {
  const dates = [...getInBodyDates()].reverse();
  const results = [];
  for (const d of dates) {
    const data = await getInBodyData(d);
    if (data) results.push(data);
  }
  return results;
}

export function getInBodyDates() {
  return [...(state.manifest?.inbody || [])].sort();
}

export function clearInBodyCache() {
  state.inbodyCache = {};
}

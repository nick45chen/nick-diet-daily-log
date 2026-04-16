// ===== Goals Data Repository =====

import { state } from '../state.js';
import { fetchJSON } from '../api.js';

export async function getGoals() {
  if (state.goals) return state.goals;
  const data = await fetchJSON('data/goals.json');
  if (data) state.goals = data;
  return data;
}

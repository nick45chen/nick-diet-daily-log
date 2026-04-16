// ===== Manifest Data Repository =====

import { state } from '../state.js';
import { fetchJSON } from '../api.js';
import { clearDayCache } from './daily-repo.js';
import { clearInBodyCache, getLatestInBody } from './inbody-repo.js';

export async function getManifest() {
  if (state.manifest) return state.manifest;
  const data = await fetchJSON('data/manifest.json');
  if (data) state.manifest = data;
  return data;
}

export async function refreshManifest() {
  const latestManifest = await fetchJSON('data/manifest.json');
  if (!latestManifest) return { changed: false };

  const previousLastUpdated = state.manifest?.lastUpdated;
  state.manifest = latestManifest;

  const changed = previousLastUpdated && previousLastUpdated !== latestManifest.lastUpdated;

  if (changed) {
    clearDayCache();
    clearInBodyCache();

    const latestInBody = await getLatestInBody();
    if (latestInBody?.basalMetabolicRate) state.latestBmr = latestInBody.basalMetabolicRate;
  }

  return { changed, manifest: latestManifest };
}

export function getRecordedDays() {
  return [...(state.manifest?.days || [])].sort();
}

export function getInBodyDates() {
  return [...(state.manifest?.inbody || [])].sort();
}

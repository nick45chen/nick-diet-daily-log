// ===== Shared Utilities =====
// Asset URL helpers and DOM helpers.

import { state, PRIORITY_MEAL_IMAGE_LIMIT } from './state.js';
import { REQUEST_VERSION, withCacheBust } from './api.js';
import { getAdjacentRecordedDates } from './logic/dates.js';

// ----- Math helpers -----

export function pct(value, goal) {
  if (!goal) return 0;
  return Math.min(Math.round((value / goal) * 100), 100);
}

// ----- Asset URL helpers -----

export function getAssetURL(path) {
  if (!path) return path;
  const version = state.manifest?.lastUpdated || REQUEST_VERSION;
  return withCacheBust(path, version);
}

export function getImageAttrs({ width, height, priority = 'lazy' } = {}) {
  const attrs = [
    `decoding="async"`,
    `loading="${priority === 'high' ? 'eager' : 'lazy'}"`,
    `fetchpriority="${priority}"`
  ];
  if (width) attrs.push(`width="${width}"`);
  if (height) attrs.push(`height="${height}"`);
  return attrs.join(' ');
}

// ----- DOM helpers -----

export function updateDateNavigation(dateStr) {
  const prevButton = document.getElementById('prevDay');
  const nextButton = document.getElementById('nextDay');
  if (!prevButton || !nextButton) return;

  const sortedDays = [...(state.manifest?.days || [])].sort();
  const { prev, next } = getAdjacentRecordedDates(dateStr, sortedDays);
  prevButton.disabled = !prev;
  nextButton.disabled = !next;
}

export function updateMealImagePreloads(imageUrls = []) {
  document.querySelectorAll('link[data-meal-preload="true"]').forEach(link => link.remove());

  imageUrls.slice(0, PRIORITY_MEAL_IMAGE_LIMIT).forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('data-meal-preload', 'true');
    document.head.appendChild(link);
  });
}

export function updateLastUpdatedLabel(lastUpdated) {
  if (!lastUpdated) return;
  const dt = new Date(lastUpdated);
  document.getElementById('lastUpdated').textContent =
    `最後更新：${dt.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`;
}

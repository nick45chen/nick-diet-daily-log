// ===== Shared Utilities =====

import { state, WEEKDAYS, PRIORITY_MEAL_IMAGE_LIMIT } from './state.js';
import { REQUEST_VERSION, withCacheBust } from './api.js';

// ----- Date helpers -----

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function getWeekday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return `星期${WEEKDAYS[d.getDay()]}`;
}

export function getTodayTaipei() {
  const now = new Date();
  const taipei = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  return `${taipei.getFullYear()}-${String(taipei.getMonth()+1).padStart(2,'0')}-${String(taipei.getDate()).padStart(2,'0')}`;
}

// ----- Navigation helpers -----

function getRecordedDays() {
  return [...(state.manifest?.days || [])].sort();
}

export function getAdjacentRecordedDates(dateStr) {
  const recordedDays = getRecordedDays();
  let prev = null;
  let next = null;

  for (const day of recordedDays) {
    if (day < dateStr) prev = day;
    if (day > dateStr) {
      next = day;
      break;
    }
  }

  return { prev, next };
}

export function updateDateNavigation(dateStr) {
  const prevButton = document.getElementById('prevDay');
  const nextButton = document.getElementById('nextDay');
  if (!prevButton || !nextButton) return;

  const { prev, next } = getAdjacentRecordedDates(dateStr);
  prevButton.disabled = !prev;
  nextButton.disabled = !next;
}

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

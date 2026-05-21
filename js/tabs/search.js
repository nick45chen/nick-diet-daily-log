// ===== Search Tab =====

import { state, MEAL_ICONS } from '../state.js';
import { getDayData } from '../data/daily-repo.js';
import { getRecordedDays } from '../data/manifest-repo.js';
import { parseDateParts } from '../logic/dates.js';

let searchIndex = [];
let indexBuiltForKey = null;
let inputBound = false;
let debounceTimer = null;

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function buildIndex() {
  const days = [...getRecordedDays()].reverse();
  const datas = await Promise.all(
    days.map(d => getDayData(d).catch(() => null))
  );
  const rows = [];
  datas.forEach((data, i) => {
    if (!data?.meals) return;
    const date = days[i];
    const { weekday } = parseDateParts(date);
    data.meals.forEach(m => {
      if (!m?.displayName) return;
      rows.push({
        date,
        weekday,
        mealType: m.type || '',
        time: m.time || '',
        displayName: m.displayName,
        lcName: m.displayName.toLowerCase()
      });
    });
  });
  searchIndex = rows;
  indexBuiltForKey = state.manifest?.lastUpdated || 'init';
}

function renderResults(query) {
  const resultsEl = document.getElementById('searchResults');
  const emptyEl = document.getElementById('emptySearch');
  const statusEl = document.getElementById('searchStatus');
  const q = query.trim().toLowerCase();

  if (!q) {
    resultsEl.innerHTML = '';
    emptyEl.style.display = 'none';
    statusEl.textContent = `共 ${searchIndex.length} 筆餐點可搜尋`;
    return;
  }

  const matches = searchIndex.filter(r => r.lcName.includes(q));
  if (matches.length === 0) {
    resultsEl.innerHTML = '';
    statusEl.textContent = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';
  statusEl.textContent = `找到 ${matches.length} 筆`;

  const groups = new Map();
  for (const r of matches) {
    if (!groups.has(r.date)) groups.set(r.date, { weekday: r.weekday, rows: [] });
    groups.get(r.date).rows.push(r);
  }

  resultsEl.innerHTML = [...groups.entries()].map(([date, g]) => `
    <li class="search-day-group">
      <div class="search-day-header">${date}（星期${g.weekday}）</div>
      <ul class="search-day-items">
        ${g.rows.map(r => `
          <li class="search-item" onclick="goToDay('${date}')">
            <span class="search-meal-icon">${MEAL_ICONS[r.mealType] || '🍽️'}</span>
            <div class="search-item-info">
              <div class="search-item-name">${escapeHTML(r.displayName)}</div>
              <div class="search-item-meta">${escapeHTML(r.mealType)}${r.time ? ' · ' + escapeHTML(r.time) : ''}</div>
            </div>
            <span class="search-arrow">›</span>
          </li>
        `).join('')}
      </ul>
    </li>
  `).join('');
}

function bindInputOnce() {
  if (inputBound) return;
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', e => {
    clearTimeout(debounceTimer);
    const value = e.target.value;
    debounceTimer = setTimeout(() => renderResults(value), 150);
  });
  inputBound = true;
}

export async function renderSearch() {
  bindInputOnce();
  const statusEl = document.getElementById('searchStatus');
  const currentKey = state.manifest?.lastUpdated || 'init';
  if (indexBuiltForKey !== currentKey) {
    if (statusEl) statusEl.textContent = '載入中…';
    await buildIndex();
  }
  const input = document.getElementById('searchInput');
  renderResults(input?.value || '');
}

export function invalidateSearchIndex() {
  indexBuiltForKey = null;
}

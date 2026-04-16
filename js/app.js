// ===== App Shell =====

import { state, MANIFEST_POLL_MS, TAB_PARTIALS, SHELL_PARTIALS } from './state.js';
import { fetchHTML } from './api.js';
import { getTodayTaipei, getAdjacentRecordedDates } from './logic/dates.js';
import { updateLastUpdatedLabel } from './utils.js';
import { getGoals } from './data/goals-repo.js';
import { getManifest, refreshManifest as repoRefreshManifest } from './data/manifest-repo.js';
import { getLatestInBody } from './data/inbody-repo.js';
import { loadDay } from './tabs/daily.js';
import { renderHistory } from './tabs/history.js';
import { renderInBody } from './tabs/inbody.js';
import { renderGoals } from './tabs/goals.js';

function renderShellError(message) {
  document.getElementById('tabContainer').innerHTML = `
    <div class="card">
      <div class="empty-state" style="padding: 32px 20px;">
        <div class="empty-icon">⚠️</div>
        <h3>頁面載入失敗</h3>
        <p>${message}</p>
      </div>
    </div>
  `;
}

async function loadShellPartials() {
  for (const { path, mountId } of SHELL_PARTIALS) {
    const html = await fetchHTML(path);
    if (html) {
      document.getElementById(mountId).innerHTML = html;
    }
  }
}

async function loadTabPartials() {
  const partials = await Promise.all(TAB_PARTIALS.map(path => fetchHTML(path)));
  if (partials.some(partial => !partial)) {
    renderShellError('部分內容檔案不存在，請確認 partials 目錄是否完整。');
    return false;
  }
  document.getElementById('tabContainer').innerHTML = partials.join('\n');
  return true;
}

async function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });

  if (tabId === 'history') await renderHistory();
  if (tabId === 'inbody') await renderInBody();
  if (tabId === 'goals') renderGoals(state.goals, state.latestBmr);
}

function setupTabNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await switchTab(btn.dataset.tab);
    });
  });
}

function setupDateNavigation() {
  document.getElementById('prevDay').addEventListener('click', () => {
    const sortedDays = [...(state.manifest?.days || [])].sort();
    const { prev } = getAdjacentRecordedDates(state.currentDate, sortedDays);
    if (prev) loadDay(prev);
  });
  document.getElementById('nextDay').addEventListener('click', () => {
    const sortedDays = [...(state.manifest?.days || [])].sort();
    const { next } = getAdjacentRecordedDates(state.currentDate, sortedDays);
    if (next) loadDay(next);
  });
}

async function goToDay(dateStr) {
  await loadDay(dateStr);
  await switchTab('daily');
}

function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

async function refreshManifest() {
  const { changed, manifest } = await repoRefreshManifest();
  if (!manifest) return;

  updateLastUpdatedLabel(manifest.lastUpdated);

  if (!changed) return;

  await loadDay(state.currentDate, { forceRefresh: true });
  if (document.getElementById('history').classList.contains('active')) await renderHistory();
  if (document.getElementById('inbody').classList.contains('active')) await renderInBody();
  if (document.getElementById('goals').classList.contains('active')) renderGoals(state.goals, state.latestBmr);
}

async function init() {
  await loadShellPartials();

  const partialsLoaded = await loadTabPartials();
  if (!partialsLoaded) return;

  setupTabNavigation();
  setupDateNavigation();

  await Promise.all([getGoals(), getManifest()]);

  const latestInBody = await getLatestInBody();
  if (latestInBody?.basalMetabolicRate) state.latestBmr = latestInBody.basalMetabolicRate;

  const today = getTodayTaipei();
  await loadDay(today);

  updateLastUpdatedLabel(state.manifest?.lastUpdated);
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'daily';
  if (activeTab !== 'daily') await switchTab(activeTab);

  window.setInterval(refreshManifest, MANIFEST_POLL_MS);
}

window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.goToDay = goToDay;

init();

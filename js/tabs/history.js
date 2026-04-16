// ===== History Tab =====

import { state } from '../state.js';
import { getDayData } from '../data/daily-repo.js';
import { getRecordedDays } from '../data/manifest-repo.js';
import { getDailyCost, roundCost, formatCurrencyTWD } from '../logic/costs.js';
import { renderMacroSummaryHTML } from '../logic/nutrition.js';
import { parseDateParts } from '../logic/dates.js';
import { DateBadge } from '../components/date-badge.js';
import { CostPill } from '../components/cost-pill.js';

export async function renderHistory() {
  const list = document.getElementById('historyList');
  const empty = document.getElementById('emptyHistory');

  const recordedDays = getRecordedDays();
  if (recordedDays.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const days = [...recordedDays].reverse();
  const entries = await Promise.all(days.map(async (day) => {
    const d = await getDayData(day);
    const parts = parseDateParts(day);
    return {
      day,
      dayNum: parts.day,
      month: parts.month,
      year: parts.year,
      weekday: parts.weekday,
      monthKey: `${parts.year}-${String(parts.month).padStart(2, '0')}`,
      cost: getDailyCost(d),
      total: d?.dailyTotal
    };
  }));

  const monthGroups = [];
  for (const entry of entries) {
    let group = monthGroups[monthGroups.length - 1];
    if (!group || group.monthKey !== entry.monthKey) {
      group = {
        monthKey: entry.monthKey,
        year: entry.year,
        month: entry.month,
        totalCost: 0,
        hasCost: false,
        costDays: 0,
        days: []
      };
      monthGroups.push(group);
    }
    if (entry.cost !== null) {
      group.hasCost = true;
      group.totalCost = roundCost(group.totalCost + entry.cost);
      group.costDays += 1;
    }
    group.days.push(entry);
  }

  const goalsWithBmr = { ...(state.goals || {}), bmr: state.latestBmr };

  list.innerHTML = monthGroups.map(group => `
    <li class="history-month-group">
      <div class="history-month-header">
        <div class="history-month-label">
          <span class="history-month-label-text">${group.year} 年 ${group.month} 月</span>
          <span class="history-month-record-pill" aria-label="${group.year} 年 ${group.month} 月共有 ${group.days.length} 天紀錄">
            <span class="history-month-record-pill-label">已記錄</span>
            <span class="history-month-record-pill-value">${group.days.length} 天</span>
          </span>
        </div>
        <div class="history-month-metrics">
          <span class="history-month-stat history-month-stat-average">日均花費 ${group.costDays > 0 ? formatCurrencyTWD(roundCost(group.totalCost / group.costDays)) : '無資料'}</span>
          <span class="history-month-stat history-month-stat-total">月總金額 ${group.hasCost ? formatCurrencyTWD(group.totalCost) : '無資料'}</span>
        </div>
      </div>
      <ul class="history-month-items">
        ${group.days.map(({ day, weekday, cost, total }) => `
          <li class="history-item" onclick="goToDay('${day}')">
            ${DateBadge({ dateStr: day })}
            <div class="history-info">
              <div class="history-topline">
                <div class="h-date">${day} (${weekday})</div>
                ${CostPill({ amount: cost, className: 'history-cost' })}
              </div>
              <div class="h-summary">${renderMacroSummaryHTML(total, goalsWithBmr)}</div>
            </div>
            <span class="history-arrow">›</span>
          </li>
        `).join('')}
      </ul>
    </li>
  `).join('');
}

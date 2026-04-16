// ===== History Tab =====

import { state, WEEKDAYS } from '../state.js';
import { fetchJSON } from '../api.js';
import { getDailyCost, roundCost, formatCurrencyTWD, renderMacroSummaryHTML } from '../nutrition.js';

export async function renderHistory() {
  const list = document.getElementById('historyList');
  const empty = document.getElementById('emptyHistory');

  if (!state.manifest || state.manifest.days.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const days = [...state.manifest.days].sort().reverse();
  const entries = await Promise.all(days.map(async (day) => {
    if (!state.dayCache[day]) {
      state.dayCache[day] = await fetchJSON(`data/${day}.json`);
    }
    const d = state.dayCache[day];
    const date = new Date(day + 'T00:00:00+08:00');
    const total = d?.dailyTotal;
    return {
      day,
      date,
      dayNum: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      cost: getDailyCost(d),
      total
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
        ${group.days.map(({ day, date, dayNum, month, cost, total }) => `
          <li class="history-item" onclick="goToDay('${day}')">
            <div class="history-date-badge">
              <span class="h-day">${dayNum}</span>
              <span class="h-month">${month}月</span>
            </div>
            <div class="history-info">
              <div class="history-topline">
                <div class="h-date">${day} (${WEEKDAYS[date.getDay()]})</div>
                ${cost !== null ? `<span class="history-cost">${formatCurrencyTWD(cost)}</span>` : ''}
              </div>
              <div class="h-summary">${renderMacroSummaryHTML(total, { ...(state.goals || {}), bmr: state.latestBmr })}</div>
            </div>
            <span class="history-arrow">›</span>
          </li>
        `).join('')}
      </ul>
    </li>
  `).join('');
}

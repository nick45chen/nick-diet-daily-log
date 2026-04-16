// ===== DateBadge Component =====
// (props) => htmlString — no DOM, no side effects.

import { parseDateParts } from '../logic/dates.js';

export function DateBadge({ dateStr }) {
  const { day, month } = parseDateParts(dateStr);
  return `
    <div class="history-date-badge">
      <span class="h-day">${day}</span>
      <span class="h-month">${month}月</span>
    </div>`;
}

// ===== Date & Navigation Logic =====
// Pure functions — no DOM, no global state.

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function getWeekday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return `星期${WEEKDAYS[d.getDay()]}`;
}

export function getWeekdayShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return WEEKDAYS[d.getDay()];
}

export function getTodayTaipei() {
  const now = new Date();
  const taipei = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  return `${taipei.getFullYear()}-${String(taipei.getMonth()+1).padStart(2,'0')}-${String(taipei.getDate()).padStart(2,'0')}`;
}

export function getAdjacentRecordedDates(dateStr, sortedDays) {
  let prev = null;
  let next = null;

  for (const day of sortedDays) {
    if (day < dateStr) prev = day;
    if (day > dateStr) {
      next = day;
      break;
    }
  }

  return { prev, next };
}

export function parseDateParts(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: WEEKDAYS[d.getDay()]
  };
}

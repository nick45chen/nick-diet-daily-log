// ===== App State & Constants =====

export const state = {
  goals: null,
  manifest: null,
  currentDate: null,
  dayCache: {},
  inbodyCache: {},
  latestBmr: null
};

export const MEAL_ICONS = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '點心': '🍪', '消夜': '🌃' };
export const MANIFEST_POLL_MS = 60000;
export const PRIORITY_MEAL_IMAGE_LIMIT = 3;
export const TAB_PARTIALS = [
  'partials/daily.html',
  'partials/history.html',
  'partials/inbody.html',
  'partials/goals.html'
];
export const SHELL_PARTIALS = [
  { path: 'partials/header.html', mountId: 'headerMount' },
  { path: 'partials/tab-nav.html', mountId: 'tabNavMount' },
  { path: 'partials/lightbox.html', mountId: 'lightboxMount' },
  { path: 'partials/footer.html', mountId: 'footerMount' }
];

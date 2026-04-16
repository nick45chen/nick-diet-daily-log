// ===== Nutrition & Cost Business Logic =====
// Pure functions — no DOM, no global state.

// ----- Cost -----

export function roundCost(value) {
  return Math.round(value * 1000) / 1000;
}

export function formatCurrencyTWD(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';
  return `NT$${Number(value.toFixed(3)).toString()}`;
}

export function getMealCost(meal) {
  const amount = Number(meal?.cost?.amount);
  return Number.isFinite(amount) ? amount : null;
}

export function getDailyCost(data) {
  const total = Number(data?.dailyCostTotal?.amount);
  if (Number.isFinite(total)) return total;
  const costs = (data?.meals || []).map(getMealCost).filter(amount => amount !== null);
  if (!costs.length) return null;
  return roundCost(costs.reduce((sum, amount) => sum + amount, 0));
}

// ----- Macro Status -----

export const STATUS_LABELS = {
  good: '達標',
  warning: '偏低',
  danger: '超標',
  neutral: ''
};

export const DANGER_LABELS = {
  calories_low: '偏低',
  calories_high: '超標',
  protein: '不足',
  fat: '超標',
  carbs_low: '偏低',
  carbs_high: '超標',
};

export function getMacroStatus(type, value, g) {
  if (!value) return 'neutral';
  switch (type) {
    case 'calories': {
      const bmr = 1563;
      const target = g.dailyCalories || 2100;
      if (value >= bmr && value <= target) return 'good';
      if (value < bmr) return 'warning';
      return 'danger';
    }
    case 'protein': {
      const goal = g.protein || 120;
      return value >= goal ? 'good' : 'danger';
    }
    case 'fat': {
      const limit = g.fat || 50;
      return value <= limit ? 'good' : 'danger';
    }
    case 'carbs': {
      const target = g.carbs || 293;
      const min = target * 0.8;
      if (value >= min && value <= target) return 'good';
      if (value < min) return 'warning';
      return 'danger';
    }
    default: return 'neutral';
  }
}

// ----- HTML Helpers (pure string builders, no DOM) -----

const STATUS_COLORS = {
  good: '#3a7d44',
  warning: '#b85c00',
  danger: '#c0392b',
  neutral: 'inherit'
};

export function renderMacroSummaryHTML(total, g) {
  if (!total) return '<span>無資料</span>';
  const s = (type, value) => {
    const st = getMacroStatus(type, value, g);
    const color = STATUS_COLORS[st];
    const bold = st !== 'neutral' ? 'font-weight:700;' : '';
    return `style="color:${color};${bold}"`;
  };
  return [
    `<span ${s('calories', total.calories)}>${total.calories} kcal</span>`,
    `<span class="h-summary-sep"> · </span>`,
    `<span ${s('protein', total.protein)}>P ${total.protein}g</span>`,
    `<span class="h-summary-sep"> · </span>`,
    `<span ${s('fat', total.fat)}>F ${total.fat}g</span>`,
    `<span class="h-summary-sep"> · </span>`,
    `<span ${s('carbs', total.carbs)}>C ${total.carbs}g</span>`,
  ].join('');
}

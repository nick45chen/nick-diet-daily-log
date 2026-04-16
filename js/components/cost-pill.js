// ===== CostPill Component =====
// (props) => htmlString — no DOM, no side effects.

import { formatCurrencyTWD } from '../logic/costs.js';

export function CostPill({ amount, className = 'cost-pill' }) {
  if (amount === null || amount === undefined) return '';
  return `<span class="${className}">${formatCurrencyTWD(amount)}</span>`;
}

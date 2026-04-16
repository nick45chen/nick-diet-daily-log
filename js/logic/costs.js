// ===== Cost Business Logic =====
// Pure functions — no DOM, no global state.

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

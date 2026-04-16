// ===== Daily Tab =====

import { state, PRIORITY_MEAL_IMAGE_LIMIT } from '../state.js';
import { getDayData } from '../data/daily-repo.js';
import { getDailyCost, formatCurrencyTWD } from '../logic/costs.js';
import { getMacroStatus } from '../logic/nutrition.js';
import { getWeekday } from '../logic/dates.js';
import { getAssetURL, getImageAttrs, updateMealImagePreloads, updateDateNavigation, pct } from '../utils.js';
import { MealCard } from '../components/meal-card.js';

export async function loadDay(dateStr, { forceRefresh = false } = {}) {
  state.currentDate = dateStr;
  document.getElementById('currentDate').textContent = dateStr;
  document.getElementById('currentWeekday').textContent = getWeekday(dateStr);
  updateDateNavigation(dateStr);

  const data = await getDayData(dateStr, { forceRefresh });
  renderDay(data);
}

function renderDay(data) {
  const mealsContainer = document.getElementById('mealsContainer');
  const adviceContainer = document.getElementById('adviceContainer');
  const emptyState = document.getElementById('emptyDaily');

  if (!data) {
    updateMealImagePreloads([]);
    mealsContainer.innerHTML = '';
    adviceContainer.innerHTML = '';
    emptyState.style.display = 'block';
    updateMacros(null);
    updateCostSummary(null);
    return;
  }

  emptyState.style.display = 'none';
  updateMacros(data.dailyTotal);
  updateCostSummary(data);

  const priorityImageUrls = [];
  for (const meal of data.meals) {
    for (const item of meal.items || []) {
      if (!item.image) continue;
      const imageUrl = getAssetURL(item.image);
      if (priorityImageUrls.includes(imageUrl)) continue;
      priorityImageUrls.push(imageUrl);
      if (priorityImageUrls.length >= PRIORITY_MEAL_IMAGE_LIMIT) break;
    }
    if (priorityImageUrls.length >= PRIORITY_MEAL_IMAGE_LIMIT) break;
  }
  updateMealImagePreloads(priorityImageUrls);

  const priorityImageCount = { value: 0 };

  mealsContainer.innerHTML = data.meals.map(meal =>
    MealCard({
      meal,
      getAssetURL,
      getImageAttrs,
      priorityImageCount,
      priorityLimit: PRIORITY_MEAL_IMAGE_LIMIT
    })
  ).join('');

  if (data.advice) {
    adviceContainer.innerHTML = `
      <div class="advice-box">
        <div class="advice-title">💡 AI 營養師建議</div>
        <div class="advice-text">${data.advice.replace(/\n/g, '<br>')}</div>
      </div>
    `;
  } else {
    adviceContainer.innerHTML = '';
  }
}

export function updateCostSummary(data) {
  const summary = document.getElementById('costSummary');
  if (!summary) return;

  const totalCost = getDailyCost(data);
  if (totalCost === null) {
    summary.style.display = 'none';
    return;
  }

  summary.style.display = 'block';
  document.getElementById('totalCostValue').textContent = formatCurrencyTWD(totalCost);
}

function applyMacroStatus(cardId, type, value, g) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.classList.remove('status-good', 'status-warning', 'status-danger');

  let badge = card.querySelector('.macro-status-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'macro-status-badge';
    const goal = card.querySelector('.macro-goal');
    if (goal) goal.after(badge);
  }

  if (!value) { badge.textContent = ''; return; }

  const status = getMacroStatus(type, value, g);
  if (status !== 'neutral') card.classList.add('status-' + status);

  let label = '';
  if (status === 'good') label = '達標';
  else if (status === 'warning') label = '偏低';
  else if (status === 'danger') {
    if (type === 'calories') label = value > (g.dailyCalories || 2100) ? '超標' : '偏低';
    else if (type === 'protein') label = '不足';
    else if (type === 'fat') label = '超標';
    else if (type === 'carbs') label = '超標';
  }
  badge.textContent = label;
}

export function updateMacros(totals) {
  const g = { ...(state.goals || {}), bmr: state.latestBmr };
  const cal = totals?.calories || 0;
  const protein = totals?.protein || 0;
  const fat = totals?.fat || 0;
  const carbs = totals?.carbs || 0;

  document.getElementById('totalCal').textContent = cal;
  document.getElementById('totalProtein').textContent = protein + 'g';
  document.getElementById('totalFat').textContent = fat + 'g';
  document.getElementById('totalCarbs').textContent = carbs + 'g';

  document.getElementById('goalCal').textContent = `${g.dailyCalories || '-'} kcal 目標`;
  document.getElementById('goalProtein').textContent = `≥ ${g.protein || '-'}g`;
  document.getElementById('goalFat').textContent = `≤ ${g.fat || '-'}g`;
  document.getElementById('goalCarbs').textContent = `${g.carbs || '-'}g 目標`;

  document.getElementById('barCal').style.width = pct(cal, g.dailyCalories) + '%';
  document.getElementById('barProtein').style.width = pct(protein, g.protein) + '%';
  document.getElementById('barFat').style.width = pct(fat, g.fat) + '%';
  document.getElementById('barCarbs').style.width = pct(carbs, g.carbs) + '%';

  applyMacroStatus('macroCalories', 'calories', cal, g);
  applyMacroStatus('macroProtein', 'protein', protein, g);
  applyMacroStatus('macroFat', 'fat', fat, g);
  applyMacroStatus('macroCarbs', 'carbs', carbs, g);
}

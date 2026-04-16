// ===== Daily Tab =====

import { state, MEAL_ICONS, PRIORITY_MEAL_IMAGE_LIMIT } from '../state.js';
import { fetchJSON } from '../api.js';
import { getMealCost, getDailyCost, formatCurrencyTWD, getMacroStatus } from '../nutrition.js';
import { getAssetURL, getImageAttrs, updateMealImagePreloads, getWeekday, updateDateNavigation, pct } from '../utils.js';

export async function loadDay(dateStr, { forceRefresh = false } = {}) {
  state.currentDate = dateStr;
  document.getElementById('currentDate').textContent = dateStr;
  document.getElementById('currentWeekday').textContent = getWeekday(dateStr);
  updateDateNavigation(dateStr);

  if (forceRefresh || !state.dayCache[dateStr]) {
    state.dayCache[dateStr] = await fetchJSON(`data/${dateStr}.json`);
  }
  renderDay(state.dayCache[dateStr]);
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

  let priorityImageCount = 0;

  mealsContainer.innerHTML = data.meals.map(meal => {
    const icon = MEAL_ICONS[meal.type] || '🍽️';
    const mealTitle = meal.displayName || `${icon} ${meal.type}`;
    const mealMeta = meal.displayName
      ? [ `${icon} ${meal.type}`, meal.time ].filter(Boolean).join(' · ')
      : meal.time || '';
    const mealCost = getMealCost(meal);
    const seenPhotos = new Set();
    const photos = meal.items.filter(i => i.image).reduce((acc, i) => {
      const imageUrl = getAssetURL(i.image);
      if (!seenPhotos.has(imageUrl)) {
        seenPhotos.add(imageUrl);
        const priority = priorityImageCount < PRIORITY_MEAL_IMAGE_LIMIT ? 'high' : 'low';
        priorityImageCount += 1;
        acc += `<img src="${imageUrl}" alt="${i.name}" ${getImageAttrs({ width: 120, height: 90, priority })} onclick="openLightbox('${imageUrl}')">`;
      }
      return acc;
    }, '');

    const items = meal.items.map(item => `
      <div class="meal-item">
        ${item.image && !seenPhotos.has(getAssetURL(item.image)) ? `<img class="meal-item-photo" src="${getAssetURL(item.image)}" alt="${item.name}" ${getImageAttrs({ width: 56, height: 56, priority: 'low' })} onclick="event.stopPropagation();openLightbox('${getAssetURL(item.image)}')">` : ''}
        <div class="meal-item-info">
          <div class="meal-item-name">${item.name}</div>
          <div class="meal-item-macros">
            <span>Cal ${item.calories}</span>
            <span>Pro ${item.protein}g</span>
            <span>Fat ${item.fat}g</span>
            <span>Carb ${item.carbs}g</span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="meal-card">
        <div class="meal-header">
          <div class="meal-header-main">
            <div class="meal-title">${mealTitle}</div>
            ${mealMeta ? `<div class="meal-meta">${mealMeta}</div>` : ''}
          </div>
          <div class="meal-header-totals">
            ${mealCost !== null ? `<span class="meal-cost">${formatCurrencyTWD(mealCost)}</span>` : ''}
            <span class="meal-kcal">${meal.subtotal?.calories || 0} kcal</span>
            <div class="meal-subtotal-macros">
              <span>🥩 ${meal.subtotal?.protein || 0}g</span>
              <span>🧈 ${meal.subtotal?.fat || 0}g</span>
              <span>🍚 ${meal.subtotal?.carbs || 0}g</span>
            </div>
          </div>
        </div>
        ${photos ? `<div class="meal-photos">${photos}</div>` : ''}
        <div class="meal-body">${items}</div>
      </div>
    `;
  }).join('');

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
  const g = state.goals || {};
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

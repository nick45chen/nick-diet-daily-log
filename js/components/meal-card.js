// ===== MealCard Component =====
// (props) => htmlString — no DOM, no side effects.

import { MEAL_ICONS } from '../state.js';
import { getMealCost, formatCurrencyTWD } from '../logic/costs.js';

export function MealCard({ meal, getAssetURL, getImageAttrs, priorityImageCount = { value: 0 }, priorityLimit = 3 }) {
  const icon = MEAL_ICONS[meal.type] || '🍽️';
  const mealTitle = meal.displayName || `${icon} ${meal.type}`;
  const mealMeta = meal.displayName
    ? [icon + ' ' + meal.type, meal.time].filter(Boolean).join(' · ')
    : meal.time || '';
  const mealCost = getMealCost(meal);

  const seenPhotos = new Set();
  const photos = (meal.items || []).filter(i => i.image).reduce((acc, i) => {
    const imageUrl = getAssetURL(i.image);
    if (!seenPhotos.has(imageUrl)) {
      seenPhotos.add(imageUrl);
      const priority = priorityImageCount.value < priorityLimit ? 'high' : 'low';
      priorityImageCount.value += 1;
      acc += `<img src="${imageUrl}" alt="${i.name}" ${getImageAttrs({ width: 120, height: 90, priority })} onclick="openLightbox('${imageUrl}')">`;
    }
    return acc;
  }, '');

  const items = (meal.items || []).map(item => `
    <div class="meal-item">
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
}

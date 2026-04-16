// ===== Goals Tab =====
// Receives goals as a parameter — no global state dependency.

export function renderGoals(goals) {
  if (!goals) return;
  const g = goals;
  document.getElementById('goalsContent').innerHTML = `
    <div class="goal-item">
      <span class="goal-label"><span class="goal-dot" style="background:var(--color-calories)"></span>每日熱量</span>
      <span class="goal-value">${g.dailyCalories} <span class="goal-unit">kcal</span></span>
    </div>
    <div class="goal-item">
      <span class="goal-label"><span class="goal-dot" style="background:var(--color-protein)"></span>蛋白質</span>
      <span class="goal-value">${g.protein} <span class="goal-unit">g</span></span>
    </div>
    <div class="goal-item">
      <span class="goal-label"><span class="goal-dot" style="background:var(--color-fat)"></span>脂肪（上限）</span>
      <span class="goal-value">≤ ${g.fat} <span class="goal-unit">g</span></span>
    </div>
    <div class="goal-item">
      <span class="goal-label"><span class="goal-dot" style="background:var(--color-carbs)"></span>碳水化合物</span>
      <span class="goal-value">${g.carbs} <span class="goal-unit">g</span></span>
    </div>
    <div style="margin-top: 12px; padding: 12px; background: var(--md-surface-container-low); border-radius: var(--md-shape-sm); font-size: 13px; color: var(--md-on-surface-variant);">
      📝 ${g.note || ''}
    </div>

    <div class="goal-status-legend">
      <div class="goal-status-legend-title">🎨 顏色標示說明</div>

      <div class="goal-status-macro">
        <div class="goal-status-macro-name">
          <span style="background:var(--color-calories-container);color:var(--color-calories);width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;">🔥</span>
          熱量
        </div>
        <div class="goal-status-rules">
          <span class="goal-status-chip good">達標　1563 ~ 2100 kcal</span>
          <span class="goal-status-chip warning">偏低　&lt; 1563 kcal（低於基礎代謝）</span>
          <span class="goal-status-chip danger">超標　&gt; 2100 kcal</span>
        </div>
      </div>

      <div class="goal-status-macro">
        <div class="goal-status-macro-name">
          <span style="background:var(--color-protein-container);color:var(--color-protein);width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;">🥩</span>
          蛋白質
        </div>
        <div class="goal-status-rules">
          <span class="goal-status-chip good">達標　≥ ${g.protein}g</span>
          <span class="goal-status-chip danger">不足　&lt; ${g.protein}g</span>
        </div>
      </div>

      <div class="goal-status-macro">
        <div class="goal-status-macro-name">
          <span style="background:var(--color-fat-container);color:var(--color-fat);width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;">🧈</span>
          脂肪
        </div>
        <div class="goal-status-rules">
          <span class="goal-status-chip good">達標　≤ ${g.fat}g</span>
          <span class="goal-status-chip danger">超標　&gt; ${g.fat}g</span>
        </div>
      </div>

      <div class="goal-status-macro">
        <div class="goal-status-macro-name">
          <span style="background:var(--color-carbs-container);color:var(--color-carbs);width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;">🍚</span>
          碳水
        </div>
        <div class="goal-status-rules">
          <span class="goal-status-chip good">達標　${Math.round(g.carbs * 0.8)} ~ ${g.carbs}g（目標 80 ~ 100%）</span>
          <span class="goal-status-chip warning">偏低　&lt; ${Math.round(g.carbs * 0.8)}g</span>
          <span class="goal-status-chip danger">超標　&gt; ${g.carbs}g</span>
        </div>
      </div>
    </div>
  `;
}

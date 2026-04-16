// ===== InBody Tab =====

import { state } from '../state.js';
import { getAllInBodyData } from '../data/inbody-repo.js';
import { getAssetURL } from '../utils.js';
import { MetricCard } from '../components/metric-card.js';
import { DateBadge } from '../components/date-badge.js';

export async function renderInBody() {
  const container = document.getElementById('inbodyContent');
  const empty = document.getElementById('emptyInbody');

  if (!state.manifest || state.manifest.inbody.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const allData = await getAllInBodyData();

  if (allData.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  const latest = allData[0];
  if (latest.basalMetabolicRate) state.latestBmr = latest.basalMetabolicRate;
  let html = '';

  html += `
    <div class="inbody-latest">
      <div class="inbody-title">📊 最新 InBody 數據 — ${latest.date}</div>
      <div class="inbody-metrics">
        ${MetricCard({ label: '體重', value: latest.weight, unit: 'kg' })}
        ${MetricCard({ label: '體脂率', value: latest.bodyFatPercent, unit: '%' })}
        ${MetricCard({ label: '骨骼肌量', value: latest.muscleMass, unit: 'kg' })}
        ${MetricCard({ label: 'BMI', value: latest.bmi, unit: '' })}
        ${MetricCard({ label: '基礎代謝', value: latest.basalMetabolicRate, unit: 'kcal' })}
        ${MetricCard({ label: '內臟脂肪', value: latest.visceralFat, unit: '等級' })}
      </div>
      ${latest.image ? `
        <div class="inbody-photo-container">
          <img src="${getAssetURL(latest.image)}" alt="InBody 報告" loading="lazy" onclick="openLightbox('${getAssetURL(latest.image)}')" style="margin-top:16px; max-height:400px;">
        </div>
      ` : ''}
    </div>
  `;

  if (allData.length > 1) {
    html += renderTrendChart(allData.slice().reverse());
  }

  if (allData.length > 1) {
    html += '<div class="card"><div class="card-title">📋 歷史測量</div>';
    for (const item of [...allData].reverse()) {
      if (item.date === latest.date) continue;
      html += `
        <div class="inbody-history-item" onclick="${item.image ? `openLightbox('${getAssetURL(item.image)}')` : ''}">
          ${DateBadge({ dateStr: item.date })}
          <div class="history-info">
            <div class="h-date">${item.date}</div>
            <div class="h-summary">${item.weight}kg · 體脂 ${item.bodyFatPercent}% · 肌肉 ${item.muscleMass}kg</div>
          </div>
        </div>
      `;
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

function renderTrendChart(dataAsc) {
  const w = 700, h = 200, pad = { top: 30, right: 60, bottom: 40, left: 50 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const weights = dataAsc.map(d => d.weight);
  const bodyFats = dataAsc.map(d => d.bodyFatPercent);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);
  const minBF = Math.floor(Math.min(...bodyFats) - 2);
  const maxBF = Math.ceil(Math.max(...bodyFats) + 2);

  const xStep = dataAsc.length > 1 ? innerW / (dataAsc.length - 1) : innerW / 2;

  function yW(v) { return pad.top + innerH - ((v - minW) / (maxW - minW)) * innerH; }
  function yBF(v) { return pad.top + innerH - ((v - minBF) / (maxBF - minBF)) * innerH; }

  const weightPath = dataAsc.map((d, i) => `${i === 0 ? 'M' : 'L'}${pad.left + i * xStep},${yW(d.weight)}`).join(' ');
  const bfPath = dataAsc.map((d, i) => `${i === 0 ? 'M' : 'L'}${pad.left + i * xStep},${yBF(d.bodyFatPercent)}`).join(' ');

  const dots = dataAsc.map((d, i) => {
    const x = pad.left + i * xStep;
    return `
      <circle cx="${x}" cy="${yW(d.weight)}" r="4" fill="var(--chart-weight)" class="trend-dot"/>
      <text x="${x}" y="${yW(d.weight) - 8}" text-anchor="middle" class="trend-value-label" fill="var(--chart-weight)">${d.weight}</text>
      <circle cx="${x}" cy="${yBF(d.bodyFatPercent)}" r="4" fill="var(--chart-body-fat)" class="trend-dot"/>
      <text x="${x}" y="${yBF(d.bodyFatPercent) - 8}" text-anchor="middle" class="trend-value-label" fill="var(--chart-body-fat)">${d.bodyFatPercent}</text>
      <text x="${x}" y="${h - 8}" text-anchor="middle" class="trend-label">${d.date.slice(5)}</text>
    `;
  }).join('');

  return `
    <div class="inbody-chart-container">
      <div class="card-title">📈 趨勢變化</div>
      <svg class="trend-chart" viewBox="0 0 ${w} ${h}">
        <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + innerH}" stroke="var(--md-outline-variant)" stroke-width="1"/>
        <line x1="${pad.left}" y1="${pad.top + innerH}" x2="${pad.left + innerW}" y2="${pad.top + innerH}" stroke="var(--md-outline-variant)" stroke-width="1"/>
        <path d="${weightPath}" class="trend-line" stroke="var(--chart-weight)"/>
        <path d="${bfPath}" class="trend-line" stroke="var(--chart-body-fat)"/>
        ${dots}
        <circle cx="${pad.left}" cy="12" r="5" fill="var(--chart-weight)"/>
        <text x="${pad.left + 10}" y="16" class="trend-label" fill="var(--chart-weight)">體重 (kg)</text>
        <circle cx="${pad.left + 90}" cy="12" r="5" fill="var(--chart-body-fat)"/>
        <text x="${pad.left + 100}" y="16" class="trend-label" fill="var(--chart-body-fat)">體脂率 (%)</text>
      </svg>
    </div>
  `;
}

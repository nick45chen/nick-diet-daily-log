// ===== MetricCard Component =====
// (props) => htmlString — no DOM, no side effects.

export function MetricCard({ label, value, unit }) {
  return `
    <div class="inbody-metric">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value || '-'}</div>
      <div class="metric-unit">${unit}</div>
    </div>`;
}

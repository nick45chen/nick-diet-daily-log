// ===== EmptyState Component =====
// (props) => htmlString — no DOM, no side effects.

export function EmptyState({ icon, title, message }) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>`;
}

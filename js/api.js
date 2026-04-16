// ===== API & Network Utilities =====
// Pure functions — no DOM, no global state.

export const REQUEST_VERSION = Date.now().toString();

export function withCacheBust(url, version = REQUEST_VERSION) {
  const target = new URL(url, window.location.href);
  target.searchParams.set('v', version);
  return target.toString();
}

export function getGitHubRawURL(path) {
  if (!window.location.hostname.endsWith('.github.io') || !path.startsWith('data/')) return null;
  const owner = window.location.hostname.replace(/\.github\.io$/, '');
  const repo = window.location.pathname.split('/').filter(Boolean)[0];
  if (!owner || !repo) return null;
  return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/${path}`;
}

export async function fetchJSON(url) {
  const candidates = [withCacheBust(url)];
  const rawURL = getGitHubRawURL(url);
  if (rawURL) candidates.push(withCacheBust(rawURL));

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { cache: 'no-store' });
      if (!res.ok) continue;
      return await res.json();
    } catch {}
  }
  return null;
}

export async function fetchHTML(url) {
  try {
    const res = await fetch(withCacheBust(url), { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

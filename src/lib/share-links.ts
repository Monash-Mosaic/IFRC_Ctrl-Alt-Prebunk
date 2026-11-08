/**
 * Destinations used by the external sharing actions (Share page and progress sharing).
 * These are separate from the simulated in-feed post sharing during gameplay.
 */
export const GAME_URL = 'https://ctrl-alt-prebunk.wdr26.org/en';
export const WORLD_DISASTERS_REPORT_URL = 'https://wdr26.org/en';
export const SOLFERINO_ACADEMY_URL = 'https://solferinoacademy.com/';

export type ShareLinkResult = 'shared' | 'copied' | 'cancelled' | 'failed';

interface ShareLinkData {
  title: string;
  text: string;
  url: string;
}

/**
 * Shares a link with the device's native share sheet, falling back to copying
 * the URL to the clipboard where native sharing is unavailable or fails.
 */
export async function shareLink(data: ShareLinkData): Promise<ShareLinkResult> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    const canShare = typeof navigator.canShare !== 'function' || navigator.canShare(data);
    if (canShare) {
      try {
        await navigator.share(data);
        return 'shared';
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
        // Any other share failure falls through to the copy-link fallback.
      }
    }
  }

  return (await copyText(data.url)) ? 'copied' : 'failed';
}

/**
 * Copies text to the clipboard. Uses the async Clipboard API where available and
 * falls back to the legacy selection-based copy, which still works in browsers or
 * contexts (e.g. non-HTTPS previews, some in-app webviews) without the API.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or no user activation: try the legacy path below.
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

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

  try {
    await navigator.clipboard.writeText(data.url);
    return 'copied';
  } catch {
    return 'failed';
  }
}

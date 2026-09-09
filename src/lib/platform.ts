export const APP_SCHEME = "com.sub2sub.app";

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return !!(w.Capacitor && w.Capacitor.Plugins);
}

export async function openYouTubeOverlay(url: string): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const { YouTubeOverlay } = (window as any).Capacitor.Plugins;
    if (!YouTubeOverlay) return false;
    await YouTubeOverlay.openYouTubeOverlay({ url });
    return true;
  } catch (e) {
    console.error("[platform] native overlay failed", e);
    return false;
  }
}

export function openBrowser(url: string): void {
  if (typeof window === "undefined") return;
  window.location.href = url;
}

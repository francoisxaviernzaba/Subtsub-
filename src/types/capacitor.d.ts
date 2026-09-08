export interface YouTubeOverlayPlugin {
  openYouTubeOverlay(options: { url: string }): Promise<{ opened: boolean }>;
}

declare global {
  interface Window {
    Capacitor?: {
      Plugins: {
        YouTubeOverlay: YouTubeOverlayPlugin;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}

export interface YouTubeOverlayPlugin {
  openYouTubeOverlay(options: { url: string }): Promise<{ opened: boolean }>;
}

export declare namespace YouTubeOverlay {
  export interface PluginRegistry {
    YouTubeOverlay: YouTubeOverlayPlugin;
  }
}

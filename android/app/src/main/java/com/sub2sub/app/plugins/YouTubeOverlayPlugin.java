package com.sub2sub.app.plugins;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.sub2sub.app.R;

@CapacitorPlugin(name = "YouTubeOverlay")
public class YouTubeOverlayPlugin extends Plugin {
  private static final String TAG = "YouTubeOverlay";

  @PluginMethod
  public void openYouTubeOverlay(PluginCall call) {
    Activity activity = getActivity();
    if (activity == null) {
      call.reject("No activity");
      return;
    }

    String url = call.getString("url");
    if (url == null || url.isEmpty()) {
      call.reject("URL is required");
      return;
    }

    try {
      Intent intent = new Intent(activity, com.sub2sub.app.YouTubeOverlayActivity.class);
      intent.putExtra("target_url", url);
      activity.startActivityForResult(intent, 1001);
      call.resolve(new JSObject().put("opened", true));
    } catch (Exception e) {
      Log.e(TAG, "Failed to open overlay", e);
      call.reject("Failed to open overlay: " + e.getMessage());
    }
  }
}

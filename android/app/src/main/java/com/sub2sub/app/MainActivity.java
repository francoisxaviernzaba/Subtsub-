package com.sub2sub.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.sub2sub.app.plugins.YouTubeOverlayPlugin;

public class MainActivity extends BridgeActivity {
  private static final String CUSTOM_SCHEME = "com.sub2sub.app";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebView webView = getBridge().getWebView();

    // Enable cookie and DOM storage
    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.setAcceptCookie(true);
    cookieManager.setAcceptThirdPartyCookies(webView, true);
    webView.getSettings().setDomStorageEnabled(true);

    // Sync cookies
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
      cookieManager.flush();
    }

    registerPlugin(YouTubeOverlayPlugin.class);

    handleIntent(getIntent(), webView);
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handleIntent(intent, getBridge().getWebView());
  }

  private void handleIntent(Intent intent, WebView webView) {
    if (intent == null || intent.getData() == null) return;
    Uri data = intent.getData();
    String scheme = data.getScheme();
    if (CUSTOM_SCHEME.equals(scheme)) {
      final String fromFinal = data.getQueryParameter("from") == null ? "/s2s" : data.getQueryParameter("from");
      CookieManager cookieManager = CookieManager.getInstance();
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
        cookieManager.flush();
      }
      webView.post(() -> {
        String js = "window.location.href = '" + fromFinal + "';";
        webView.evaluateJavascript(js, null);
      });
    }
  }
}

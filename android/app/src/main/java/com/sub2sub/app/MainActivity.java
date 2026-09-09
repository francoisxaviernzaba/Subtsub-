package com.sub2sub.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.sub2sub.app.plugins.YouTubeOverlayPlugin;

public class MainActivity extends BridgeActivity {
  private static final String CUSTOM_SCHEME = "com.sub2sub.app";
  private WebView webView;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    webView = getBridge().getWebView();

    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.setAcceptCookie(true);
    cookieManager.setAcceptThirdPartyCookies(webView, true);
    webView.getSettings().setDomStorageEnabled(true);
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
      cookieManager.flush();
    }

    webView.setWebViewClient(new WebViewClient() {
      @Override
      public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        return handleShouldOverrideUrl(view, request.getUrl());
      }

      @Override
      public boolean shouldOverrideUrlLoading(WebView view, String url) {
        return handleShouldOverrideUrl(view, Uri.parse(url));
      }

      private boolean handleShouldOverrideUrl(WebView view, Uri uri) {
        if (uri == null) return false;
        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (CUSTOM_SCHEME.equals(scheme) && "oauth-callback".equals(host)) {
          return false;
        }

        if ("https".equals(scheme) && host != null && (
            host.equals("accounts.google.com") ||
            host.equals("consent.google.com") ||
            host.endsWith(".google.com") ||
            host.endsWith(".googleusercontent.com")
        )) {
          CookieManager cm = CookieManager.getInstance();
          if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            cm.flush();
          }
          Intent i = new Intent(Intent.ACTION_VIEW, uri);
          i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
          view.getContext().startActivity(i);
          return true;
        }

        return false;
      }
    });

    registerPlugin(YouTubeOverlayPlugin.class);
    handleIntent(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handleIntent(intent);
  }

  private void handleIntent(Intent intent) {
    if (intent == null || intent.getData() == null || webView == null) return;
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

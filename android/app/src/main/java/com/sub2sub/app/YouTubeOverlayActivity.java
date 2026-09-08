package com.sub2sub.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import androidx.appcompat.app.AppCompatActivity;

public class YouTubeOverlayActivity extends AppCompatActivity {
  private WebView webView;
  private FrameLayout container;
  private boolean completed;

  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    container = new FrameLayout(this);
    setContentView(container);

    String targetUrl = getIntent().getStringExtra("target_url");
    if (targetUrl == null || targetUrl.isEmpty()) {
      finish();
      return;
    }

    webView = new WebView(this);
    container.addView(webView);

    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowContentAccess(true);
    settings.setAllowFileAccessFromFileURLs(true);
    settings.setAllowUniversalAccessFromFileURLs(true);
    settings.setUserAgentString(settings.getUserAgentString() + " Sub2SubApp/1.0");

    webView.setWebViewClient(new WebViewClient() {
      @Override
      public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url.startsWith("https://www.youtube.com") || url.startsWith("https://m.youtube.com")) {
          return false;
        }
        if (url.startsWith("sub2sub://youtube/subscribed")) {
          if (!completed) {
            completed = true;
            setResult(RESULT_OK);
            finish();
          }
          return true;
        }
        try {
          Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
          startActivity(intent);
        } catch (Exception ignored) {}
        return true;
      }
    });

    webView.setWebChromeClient(new WebChromeClient());

    webView.loadUrl(targetUrl);

    webView.evaluateJavascript(
      "(function() {" +
      "  var checkInterval = setInterval(function() {" +
      "    var buttons = document.querySelectorAll('button, ytd-subscribe-button-renderer, tp-yt-paper-button');" +
      "    var subscribed = false;" +
      "    for (var i = 0; i < buttons.length; i++) {" +
      "      var text = (buttons[i].innerText || buttons[i].textContent || '').toLowerCase();" +
      "      var aria = (buttons[i].getAttribute('aria-label') || '').toLowerCase();" +
      "      if (text.includes('subscribed') || aria.includes('subscribed')) {" +
      "        subscribed = true;" +
      "        break;" +
      "      }" +
      "    }" +
      "    if (subscribed && !window.__sub2subCompleted) {" +
      "      window.__sub2subCompleted = true;" +
      "      clearInterval(checkInterval);" +
      "      window.location.href = 'sub2sub://youtube/subscribed';" +
      "    }" +
      "  }, 1500);" +
      "})();",
      null
    );
  }

  @Override
  public void onBackPressed() {
    if (webView != null && webView.canGoBack()) {
      webView.goBack();
      return;
    }
    setResult(RESULT_CANCELED);
    finish();
  }

  @Override
  protected void onDestroy() {
    if (webView != null) {
      container.removeView(webView);
      webView.destroy();
      webView = null;
    }
    super.onDestroy();
  }
}

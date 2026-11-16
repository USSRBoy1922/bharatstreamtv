import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');
const mainActivityPath = path.resolve('android/app/src/main/java/com/bharatstream/tv/MainActivity.java');

if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');

  // 1. Allow non-touchscreen Fire TV / Android TV devices and declare Leanback support
  if (!manifest.includes('android.hardware.touchscreen')) {
    manifest = manifest.replace(
      '<application',
      `    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n    <uses-feature android:name="android.software.leanback" android:required="false" />\n\n    <application`
    );
  }

  // 2. Allow HTTP IPTV streams and set TV banner
  if (!manifest.includes('android:usesCleartextTraffic')) {
    manifest = manifest.replace(
      '<application',
      '<application\n        android:usesCleartextTraffic="true"\n        android:banner="@mipmap/ic_launcher"'
    );
  }

  // 3. Force landscape orientation and full-screen NoTitleBar theme for Smart TVs
  if (!manifest.includes('android:screenOrientation')) {
    manifest = manifest.replace(
      'android:name=".MainActivity"',
      'android:name=".MainActivity"\n            android:screenOrientation="landscape"'
    );
  }

  // 4. Add LEANBACK_LAUNCHER so app appears in Fire TV Apps row
  if (!manifest.includes('android.intent.category.LEANBACK_LAUNCHER')) {
    manifest = manifest.replace(
      '<category android:name="android.intent.category.LAUNCHER" />',
      '<category android:name="android.intent.category.LAUNCHER" />\n                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />'
    );
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('Configured AndroidManifest.xml for Amazon Fire TV.');
}

if (fs.existsSync(mainActivityPath)) {
  const activityCode = `package com.bharatstream.tv;

import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        applyTvFullscreen();

        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
            webView.setInitialScale(0);

            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setTextZoom(100);
        }

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().evaluateJavascript(
                        "window.__handleFireTvBack ? window.__handleFireTvBack() : false",
                        result -> {
                            if (!"true".equals(result)) {
                                setEnabled(false);
                                getOnBackPressedDispatcher().onBackPressed();
                                setEnabled(true);
                            }
                        }
                    );
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                    setEnabled(true);
                }
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyTvFullscreen();
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN && this.bridge != null && this.bridge.getWebView() != null) {
            int code = event.getKeyCode();
            if (code == KeyEvent.KEYCODE_CHANNEL_UP) {
                this.bridge.getWebView().evaluateJavascript(
                    "window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));",
                    null
                );
                return true;
            } else if (code == KeyEvent.KEYCODE_CHANNEL_DOWN) {
                this.bridge.getWebView().evaluateJavascript(
                    "window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));",
                    null
                );
                return true;
            } else if (code == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE || code == KeyEvent.KEYCODE_MEDIA_PLAY || code == KeyEvent.KEYCODE_MEDIA_PAUSE) {
                this.bridge.getWebView().evaluateJavascript(
                    "window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));",
                    null
                );
                return true;
            } else if (code == KeyEvent.KEYCODE_MENU) {
                this.bridge.getWebView().evaluateJavascript(
                    "window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }));",
                    null
                );
                return true;
            } else if (code == KeyEvent.KEYCODE_SEARCH) {
                this.bridge.getWebView().evaluateJavascript(
                    "window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));",
                    null
                );
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    private void applyTvFullscreen() {
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }
}
`;
  fs.writeFileSync(mainActivityPath, activityCode, 'utf8');
  console.log('Configured MainActivity.java for fullscreen immersive Fire TV & remote hardware keys.');
}

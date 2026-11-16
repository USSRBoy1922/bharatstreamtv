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

  // 3. Force landscape orientation for 10-foot Smart TV UI
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
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        }
    }
}
`;
  fs.writeFileSync(mainActivityPath, activityCode, 'utf8');
  console.log('Configured MainActivity.java for instant Fire TV video playback.');
}

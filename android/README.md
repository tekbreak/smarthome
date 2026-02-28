# Home Dashboard Android App

WebView-based Android app using Kotlin and `@JavascriptInterface` for the JS bridge.

## Requirements

- Android Studio Ladybug (2024.2.1) or newer
- JDK 17+
- Android SDK 35

## Building

```bash
# Debug (signed, installable)
./gradlew assembleProdDebug

# Release (unsigned)
./gradlew assembleProdRelease

# Install on connected device
./gradlew installProdDebug
```

From project root:
```bash
npm run android:build    # Build debug APK
npm run android:install  # Build and install on device
npm run android:uninstall # Uninstall from device
```

## Configuration

- **Dashboard URL**: `https://home-dashboard.tekbreak.com/`
- **HTTP Auth**: `AUTH_USERNAME` and `AUTH_PASSWORD` in `.env` or `local.properties`

## JavaScript Bridge

Exposed as `window.hd_android`. Methods: `dim`, `say`, `play`, `call`, `camera`, `bluetooth`.

# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /Applications/Utilities/sdk/tools/proguard/proguard-android.txt
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep JsBridge for WebView JavaScript interface
-keepclassmembers class com.tekbreak.homedashboard.JsBridge {
    @android.webkit.JavascriptInterface <methods>;
}

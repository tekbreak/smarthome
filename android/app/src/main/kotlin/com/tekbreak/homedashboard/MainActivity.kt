package com.tekbreak.homedashboard

import android.annotation.SuppressLint
import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.View
import android.webkit.HttpAuthHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.util.Locale

private const val TAG = "HomeDashboard"
private const val LOAD_TIMEOUT_MS = 15_000L

class MainActivity : AppCompatActivity() {
    private var webView: WebView? = null
    private var progressBar: View? = null
    private var textToSpeech: TextToSpeech? = null
    private val bluetoothAdapter: BluetoothAdapter? by lazy {
        (getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter
    }
    private var pendingBluetoothState: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private var loadTimeoutRunnable: Runnable? = null

    private val bluetoothPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted && pendingBluetoothState != null) {
            handleBluetooth(pendingBluetoothState!!)
        }
        pendingBluetoothState = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (BuildConfig.DEBUG) {
            android.webkit.WebView.setWebContentsDebuggingEnabled(true)
        }
        textToSpeech = TextToSpeech(this) { status ->
            if (status == TextToSpeech.SUCCESS) {
                textToSpeech?.language = Locale("es", "ES")
            }
        }
        setImmersiveMode()
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.activity_main_webview)
        progressBar = findViewById(R.id.activity_main_progress)

        setupWebView()
        setupBackPress()
        loadDashboard()
    }

    private fun setImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = WindowInsetsControllerCompat(window, window.decorView)
            controller.hide(
                android.view.WindowInsets.Type.statusBars() or
                    android.view.WindowInsets.Type.navigationBars()
            )
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            )
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val wv = webView ?: return
        wv.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowContentAccess = true
            cacheMode = WebSettings.LOAD_DEFAULT
            useWideViewPort = true
            loadWithOverviewMode = true
            @Suppress("DEPRECATION")
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }
        @Suppress("DEPRECATION")
        wv.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        wv.addJavascriptInterface(JsBridge(this), "hd_android")
        wv.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                if (BuildConfig.DEBUG) Log.d(TAG, "onPageStarted: $url")
                progressBar?.visibility = View.VISIBLE
                cancelLoadTimeout()
                loadTimeoutRunnable = Runnable {
                    if (BuildConfig.DEBUG) Log.e(TAG, "Load timeout for $url")
                    progressBar?.visibility = View.GONE
                    view?.let { showTroubleshootPage(it, "Load timeout. Server not reachable.") }
                }.also { handler.postDelayed(it, LOAD_TIMEOUT_MS) }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                if (BuildConfig.DEBUG) Log.d(TAG, "onPageFinished: $url")
                cancelLoadTimeout()
                progressBar?.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                if (BuildConfig.DEBUG) Log.e(TAG, "WebView error: ${error?.description} for ${request?.url}")
                cancelLoadTimeout()
                progressBar?.visibility = View.GONE
                if (request?.isForMainFrame == true && view != null) {
                    showTroubleshootPage(view, "Error: ${error?.description}")
                }
            }

            @Deprecated("Deprecated in Java")
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                if (BuildConfig.DEBUG) Log.e(TAG, "WebView error (legacy): $errorCode $description for $failingUrl")
                cancelLoadTimeout()
                progressBar?.visibility = View.GONE
                view?.let { showTroubleshootPage(it, "Error $errorCode: $description") }
            }

            override fun onReceivedHttpAuthRequest(
                view: WebView?,
                handler: HttpAuthHandler?,
                host: String?,
                realm: String?
            ) {
                val user = BuildConfig.AUTH_USERNAME.ifEmpty { getString(R.string.username) }
                val pass = BuildConfig.AUTH_PASSWORD.ifEmpty { getString(R.string.password) }
                handler?.proceed(user, pass)
            }
        }
        wv.webChromeClient = WebChromeClient()
    }

    private fun setupBackPress() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView?.canGoBack() == true) {
                    webView?.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun cancelLoadTimeout() {
        loadTimeoutRunnable?.let { handler.removeCallbacks(it) }
        loadTimeoutRunnable = null
    }

    private fun loadDashboard() {
        val url = BuildConfig.DASHBOARD_URL
        val separator = if (url.contains("?")) "&" else "?"
        val fullUrl = "$url${separator}t=${System.currentTimeMillis()}"
        if (BuildConfig.DEBUG) Log.d(TAG, "Loading dashboard: $fullUrl")
        webView?.loadUrl(fullUrl)
    }

    private fun showTroubleshootPage(webView: WebView, reason: String) {
        val url = BuildConfig.DASHBOARD_URL
        val html = """
            <!DOCTYPE html><html><head><meta name='viewport' content='width=device-width'/>
            <style>body{font-family:sans-serif;padding:20px;background:#1a1a1a;color:#fff;}
            a{color:#4fc3f7;}code{background:#333;padding:2px 6px;}</style></head><body>
            <h2>Dashboard not loading</h2><p>$reason</p>
            <ol><li>Run <code>npm run start:android</code> in project terminal</li>
            <li>Phone and computer on same WiFi</li>
            <li>Try in phone browser: <a href='$url'>$url</a></li></ol>
            </body></html>
        """.trimIndent()
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
    }

    fun getTextToSpeech(): TextToSpeech? = textToSpeech

    fun handleBluetooth(state: String) {
        val adapter = bluetoothAdapter ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                pendingBluetoothState = state
                bluetoothPermissionLauncher.launch(Manifest.permission.BLUETOOTH_CONNECT)
                return
            }
        }
        @Suppress("DEPRECATION")
        if (state == "true") {
            adapter.enable()
        } else {
            adapter.disable()
        }
    }

    override fun onDestroy() {
        cancelLoadTimeout()
        textToSpeech?.shutdown()
        textToSpeech = null
        super.onDestroy()
    }
}

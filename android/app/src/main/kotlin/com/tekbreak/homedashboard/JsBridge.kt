package com.tekbreak.homedashboard

import android.content.Intent
import android.media.MediaPlayer
import android.net.Uri
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.util.Log
import android.webkit.JavascriptInterface
import java.lang.ref.WeakReference

/**
 * JavaScript bridge exposed as "hd_android" for web client compatibility.
 * Methods match the AndroidInterface expected by client/src/app/helpers/android.ts
 */
class JsBridge(activity: MainActivity) {
    private val activityRef = WeakReference(activity)

    private fun getActivity(): MainActivity? = activityRef.get()

    @JavascriptInterface
    fun dim(dimLevel: String?) {
        val activity = getActivity() ?: return
        val level = dimLevel?.toFloatOrNull() ?: 1f
        activity.runOnUiThread {
            try {
                val brightness = level.coerceIn(0.01f, 1f)
                val layout = activity.window.attributes
                layout.screenBrightness = brightness
                activity.window.attributes = layout
            } catch (e: NumberFormatException) {
                if (BuildConfig.DEBUG) Log.w(TAG, "Invalid dim level: $dimLevel")
            }
        }
    }

    @JavascriptInterface
    fun say(text: String?, volume: String?) {
        val activity = getActivity() ?: return
        val textStr = text ?: ""
        val volumeStr = volume ?: "1"
        activity.runOnUiThread {
            val tts = activity.getTextToSpeech()
            if (tts != null) {
                try {
                    val volFloat = volumeStr.toFloatOrNull() ?: 1f
                    val params = Bundle().apply {
                        putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, volFloat)
                    }
                    tts.speak(textStr, TextToSpeech.QUEUE_FLUSH, params, null)
                } catch (e: NumberFormatException) {
                    tts.speak(textStr, TextToSpeech.QUEUE_FLUSH, null, null)
                }
            }
        }
    }

    @JavascriptInterface
    fun play(sound: String?, volume: String?) {
        val activity = getActivity() ?: return
        val soundName = sound ?: ""
        if (soundName.isEmpty()) return
        val vol = volume?.toFloatOrNull() ?: 1f
        activity.runOnUiThread {
            val mp = MediaPlayer()
            try {
                val descriptor = activity.assets.openFd(soundName)
                mp.setDataSource(
                    descriptor.fileDescriptor,
                    descriptor.startOffset,
                    descriptor.length
                )
                descriptor.close()
                mp.prepare()
                mp.setVolume(vol, vol)
                mp.isLooping = false
                mp.setOnCompletionListener { it.release() }
                mp.start()
            } catch (e: Exception) {
                if (BuildConfig.DEBUG) Log.e(TAG, "Play error", e)
                mp.release()
            }
        }
    }

    @JavascriptInterface
    fun call(url: String?) {
        val activity = getActivity() ?: return
        val uri = url?.trim() ?: return
        if (uri.isEmpty()) return
        activity.runOnUiThread {
            val intent = Intent(Intent.ACTION_CALL).apply { data = Uri.parse(uri) }
            activity.startActivity(intent)
        }
    }

    @JavascriptInterface
    fun camera() {
        val activity = getActivity() ?: return
        activity.runOnUiThread {
            activity.startActivity(Intent(activity, CameraActivity::class.java))
        }
    }

    @JavascriptInterface
    fun bluetooth(state: String?) {
        val activity = getActivity() ?: return
        val stateStr = state ?: "false"
        activity.runOnUiThread {
            activity.handleBluetooth(stateStr)
        }
    }

    companion object {
        private const val TAG = "JsBridge"
    }
}

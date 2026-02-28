package com.tekbreak.homedashboard

import android.content.pm.ActivityInfo
import android.media.CamcorderProfile
import android.media.MediaRecorder
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.SurfaceHolder
import android.view.SurfaceView
import androidx.activity.ComponentActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.io.File

class CameraActivity : ComponentActivity(), SurfaceHolder.Callback {

    private var recorder: MediaRecorder? = null
    private var holder: SurfaceHolder? = null
    private var recording = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsControllerCompat(window, window.decorView).apply {
                hide(android.view.WindowInsets.Type.statusBars() or android.view.WindowInsets.Type.navigationBars())
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            )
        }
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        setContentView(R.layout.camera)

        val cameraView = findViewById<SurfaceView>(R.id.CameraView)
        holder = cameraView.holder
        holder?.addCallback(this)
        cameraView.isClickable = true
        cameraView.setOnClickListener { onCameraClick() }
    }

    private fun getOutputFile(): File {
        val dir = getExternalFilesDir(Environment.DIRECTORY_MOVIES) ?: filesDir
        return File(dir, "videocapture_${System.currentTimeMillis()}.mp4")
    }

    @Suppress("DEPRECATION")
    private fun initRecorder() {
        recorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.DEFAULT)
            setVideoSource(MediaRecorder.VideoSource.DEFAULT)
            val profile = CamcorderProfile.get(CamcorderProfile.QUALITY_HIGH)
            setProfile(profile)
            setOutputFile(getOutputFile().absolutePath)
            setMaxDuration(MAX_DURATION_MS)
            setMaxFileSize(MAX_FILE_SIZE_BYTES)
        }
    }

    private fun prepareRecorder() {
        try {
            recorder?.setPreviewDisplay(holder?.surface)
            recorder?.prepare()
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) Log.e(TAG, "Failed to prepare recorder", e)
            finish()
        }
    }

    private fun onCameraClick() {
        if (recording) {
            try {
                recorder?.stop()
            } catch (e: Exception) {
                if (BuildConfig.DEBUG) Log.e(TAG, "Stop failed", e)
            }
            recorder?.release()
            recorder = null
            recording = false
            initRecorder()
            prepareRecorder()
        } else {
            recording = true
            recorder?.start()
        }
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        initRecorder()
        prepareRecorder()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {}

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        if (recording) {
            try {
                recorder?.stop()
            } catch (e: Exception) {
                if (BuildConfig.DEBUG) Log.e(TAG, "Stop failed", e)
            }
            recording = false
        }
        recorder?.release()
        recorder = null
        finish()
    }

    companion object {
        private const val TAG = "Camera"
        private const val MAX_DURATION_MS = 50_000
        private const val MAX_FILE_SIZE_BYTES = 5_000_000L
    }
}

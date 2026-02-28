import java.util.Properties

plugins {
    id("com.android.application")
}

fun getLocalProperty(key: String, defaultValue: String = ""): String {
    val props = Properties()
    val file = rootProject.file("local.properties")
    if (file.exists()) {
        file.inputStream().use { props.load(it) }
        return props.getProperty(key, defaultValue)
    }
    return defaultValue
}

fun getAuthCredential(envKey: String, localKey: String, defaultValue: String = ""): String {
    val envFile = rootProject.file("../.env")
    if (envFile.exists()) {
        for (line in envFile.readLines()) {
            val trimmed = line.trim()
            if (trimmed.isNotEmpty() && !trimmed.startsWith("#")) {
                val idx = trimmed.indexOf('=')
                if (idx > 0) {
                    val k = trimmed.substring(0, idx).trim()
                    if (k == envKey) {
                        var v = trimmed.substring(idx + 1).trim()
                        if (v.startsWith("\"") && v.endsWith("\"")) v = v.drop(1).dropLast(1)
                        else if (v.startsWith("'") && v.endsWith("'")) v = v.drop(1).dropLast(1)
                        return v.ifEmpty { defaultValue }
                    }
                }
            }
        }
    }
    return getLocalProperty(localKey, defaultValue)
}

android {
    namespace = "com.tekbreak.homedashboard"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.tekbreak.homedashboard"
        minSdk = 24
        targetSdk = 35
        versionCode = 2
        versionName = "2.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    flavorDimensions += "environment"
    productFlavors {
        create("prod") {
            dimension = "environment"
            buildConfigField("String", "DASHBOARD_URL", "\"https://home-dashboard.tekbreak.com/\"")
            buildConfigField("boolean", "ALLOW_CLEARTEXT", "false")
            buildConfigField("String", "AUTH_USERNAME", "\"${getAuthCredential("AUTH_USERNAME", "auth.username", "")}\"")
            buildConfigField("String", "AUTH_PASSWORD", "\"${getAuthCredential("AUTH_PASSWORD", "auth.password", "")}\"")
            manifestPlaceholders["ALLOW_CLEARTEXT"] = "false"
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-ktx:1.15.0")
}

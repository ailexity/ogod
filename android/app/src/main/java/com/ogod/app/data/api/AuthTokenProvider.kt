package com.ogod.app.data.api

import android.content.Context

interface AuthTokenProvider {
    fun token(): String?
}

class SharedPreferencesAuthTokenProvider(context: Context) : AuthTokenProvider {
    private val preferences = context.applicationContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    override fun token(): String? = preferences.getString(KEY_TOKEN, null)

    fun save(token: String) {
        preferences.edit().putString(KEY_TOKEN, token).apply()
    }

    fun clear() {
        preferences.edit().remove(KEY_TOKEN).apply()
    }

    private companion object {
        const val PREFERENCES_NAME = "ogod_auth"
        const val KEY_TOKEN = "token"
    }
}

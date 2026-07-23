package com.ogod.app.data.api

import android.content.Context

interface AuthTokenProvider {
    fun token(): String?
}

class SharedPreferencesAuthTokenProvider(context: Context) : AuthTokenProvider {
    private val preferences = context.applicationContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    override fun token(): String? = preferences.getString(KEY_TOKEN, null)
    fun role(): String? =
    preferences.getString(KEY_ROLE, null)

fun mobile(): String? =
    preferences.getString(KEY_MOBILE, null)

fun name(): String? =
    preferences.getString(KEY_NAME, null)

    fun save(
    token: String,
    role: String,
    mobile: String,
    name: String
) {
    preferences.edit()
        .putString(KEY_TOKEN, token)
        .putString(KEY_ROLE, role)
        .putString(KEY_MOBILE, mobile)
        .putString(KEY_NAME, name)
        .apply()
}

   fun clear() {
    preferences.edit().clear().apply()
}

    private companion object {
    const val PREFERENCES_NAME = "ogod_auth"

    const val KEY_TOKEN = "jwt_token"
    const val KEY_ROLE = "user_role"
    const val KEY_MOBILE = "mobile"
    const val KEY_NAME = "name"
}
}

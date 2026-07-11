package com.ogod.app.data.api

import android.content.Context
import com.ogod.app.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object NetworkModule {
    fun createApi(
        context: Context,
        tokenProvider: AuthTokenProvider = SharedPreferencesAuthTokenProvider(context)
    ): OgodApiService {
        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val builder = chain.request().newBuilder()
                tokenProvider.token()?.takeIf { it.isNotBlank() }?.let { token ->
                    builder.addHeader("Authorization", "Bearer $token")
                }
                chain.proceed(builder.build())
            }
            .apply {
                if (BuildConfig.DEBUG) {
                    addInterceptor(
                        HttpLoggingInterceptor().apply {
                            level = HttpLoggingInterceptor.Level.BASIC
                        }
                    )
                }
            }
            .build()

        return Retrofit.Builder()
            .baseUrl(normalizedBaseUrl())
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(OgodApiService::class.java)
    }

    private fun normalizedBaseUrl(): String {
        return if (BuildConfig.API_BASE_URL.endsWith("/")) {
            BuildConfig.API_BASE_URL
        } else {
            "${BuildConfig.API_BASE_URL}/"
        }
    }
}

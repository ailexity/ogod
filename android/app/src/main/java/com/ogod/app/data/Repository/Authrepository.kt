package com.ogod.app.data.repository

import com.ogod.app.data.api.OgodApiService
import com.ogod.app.data.model.MeResponse
import com.ogod.app.data.model.RequestOtpRequest
import com.ogod.app.data.model.RequestOtpResponse
import com.ogod.app.data.model.VerifyOtpRequest
import com.ogod.app.data.model.VerifyOtpResponse

class AuthRepository(
    private val api: OgodApiService
) {

    suspend fun requestOtp(
        mobile: String
    ): Result<RequestOtpResponse> {

        return try {

            val response = api.requestOtp(
                RequestOtpRequest(mobile)
            )

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Failed to send OTP")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyOtp(
        mobile: String,
        code: String,
        name: String? = null,
        organizationName: String? = null
    ): Result<VerifyOtpResponse> {

        return try {

            val response = api.verifyOtp(
                VerifyOtpRequest(
                    mobile = mobile,
                    code = code,
                    name = name,
                    organizationName = organizationName
                )
            )

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "OTP verification failed")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCurrentUser(): Result<MeResponse> {

        return try {

            val response = api.me()

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to fetch user")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

```kotlin
package com.ogod.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ogod.app.data.api.AuthTokenProvider
import com.ogod.app.data.model.User
import com.ogod.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(
    private val repository: AuthRepository,
    private val tokenProvider: AuthTokenProvider
) : ViewModel() {

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _otpSent = MutableStateFlow(false)
    val otpSent: StateFlow<Boolean> = _otpSent

    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user

    private val _token = MutableStateFlow<String?>(null)
    val token: StateFlow<String?> = _token

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun requestOtp(mobile: String) {
        viewModelScope.launch {

            _loading.value = true
            _error.value = null

            repository.requestOtp(mobile)
                .onSuccess {
                    _otpSent.value = true
                    _error.value = null
                }
                .onFailure {
                    _error.value = it.message ?: "Failed to send OTP"
                }

            _loading.value = false
        }
    }

    fun verifyOtp(
        mobile: String,
        code: String,
        name: String? = null,
        organizationName: String? = null
    ) {
        viewModelScope.launch {

            _loading.value = true
            _error.value = null

            repository.verifyOtp(
                mobile = mobile,
                code = code,
                name = name,
                organizationName = organizationName
            ).onSuccess { response ->

                _token.value = response.token
                _user.value = response.user

                // Save login information permanently
                tokenProvider.let { provider ->

                    if (provider is com.ogod.app.data.api.SharedPreferencesAuthTokenProvider) {

                        provider.save(
                            token = response.token,
                            role = response.user.role,
                            mobile = response.user.mobile,
                            name = response.user.name
                        )
                    }
                }

                _error.value = null

            }.onFailure {
                _error.value = it.message ?: "OTP verification failed"
            }

            _loading.value = false
        }
    }

    fun loadCurrentUser() {

        viewModelScope.launch {

            _loading.value = true
            _error.value = null

            repository.getCurrentUser()
                .onSuccess {
                    _user.value = it.user
                }
                .onFailure {
                    _error.value = it.message ?: "Unable to fetch user"
                }

            _loading.value = false
        }
    }

    fun logout() {

        if (tokenProvider is com.ogod.app.data.api.SharedPreferencesAuthTokenProvider) {
            tokenProvider.clear()
        }

        _user.value = null
        _token.value = null
        _otpSent.value = false
        _error.value = null
    }

    fun clearError() {
        _error.value = null
    }
}
```

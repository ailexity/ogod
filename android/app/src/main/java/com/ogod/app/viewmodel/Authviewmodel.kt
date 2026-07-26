package com.ogod.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ogod.app.data.model.User
import com.ogod.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(
    private val repository: AuthRepository
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

            repository.requestOtp(mobile)
                .onSuccess {
                    _otpSent.value = true
                    _error.value = null
                }
                .onFailure {
                    _error.value = it.message
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

            repository.verifyOtp(
                mobile,
                code,
                name,
                organizationName
            ).onSuccess {

                _token.value = it.token
                _user.value = it.user
                _error.value = null

            }.onFailure {

                _error.value = it.message
            }

            _loading.value = false
        }
    }

    fun loadCurrentUser() {

        viewModelScope.launch {

            repository.getCurrentUser()
                .onSuccess {
                    _user.value = it.user
                }
                .onFailure {
                    _error.value = it.message
                }
        }
    }

    fun logout() {
        _user.value = null
        _token.value = null
    }

    fun clearError() {
        _error.value = null
    }
}

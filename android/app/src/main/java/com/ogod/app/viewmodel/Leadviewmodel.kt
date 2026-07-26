package com.ogod.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ogod.app.data.model.CreateLeadRequest
import com.ogod.app.data.model.Lead
import com.ogod.app.data.repository.LeadRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class LeadViewModel(
    private val repository: LeadRepository
) : ViewModel() {

    private val _leads = MutableStateFlow<List<Lead>>(emptyList())
    val leads: StateFlow<List<Lead>> = _leads

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    private val _leadSubmitted = MutableStateFlow(false)
    val leadSubmitted: StateFlow<Boolean> = _leadSubmitted

    fun submitLead(request: CreateLeadRequest) {

        viewModelScope.launch {

            _loading.value = true

            repository.createLead(request)
                .onSuccess {
                    _leadSubmitted.value = true
                    _error.value = null
                }
                .onFailure {
                    _error.value = it.message
                }

            _loading.value = false
        }
    }

    fun loadMyLeads() {

        viewModelScope.launch {

            _loading.value = true

            repository.getMyLeads()
                .onSuccess {
                    _leads.value = it
                    _error.value = null
                }
                .onFailure {
                    _error.value = it.message
                }

            _loading.value = false
        }
    }

    fun clearError() {
        _error.value = null
    }

    fun resetLeadStatus() {
        _leadSubmitted.value = false
    }
}

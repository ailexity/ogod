package com.ogod.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ogod.app.data.model.Trip
import com.ogod.app.data.model.TripDraft
import com.ogod.app.data.repository.TripRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class TripViewModel(
    private val repository: TripRepository
) : ViewModel() {

    private val _trips = MutableStateFlow<List<Trip>>(emptyList())
    val trips: StateFlow<List<Trip>> = _trips

    private val _selectedTrip = MutableStateFlow<Trip?>(null)
    val selectedTrip: StateFlow<Trip?> = _selectedTrip

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun loadTrips(
        query: String? = null,
        category: String? = null
    ) {
        viewModelScope.launch {
            _loading.value = true

            repository.getTrips(query, category)
                .onSuccess {
                    _trips.value = it
                    _error.value = null
                }
                .onFailure {
                    _error.value = it.message
                }

            _loading.value = false
        }
    }

    fun loadTrip(id: String) {
        viewModelScope.launch {
            _loading.value = true

            repository.getTrip(id)
                .onSuccess {
                    _selectedTrip.value = it.trip
                }
                .onFailure {
                    _error.value = it.message
                }

            _loading.value = false
        }
    }

    fun createTrip(draft: TripDraft) {
        viewModelScope.launch {
            _loading.value = true

            repository.createTrip(draft)
                .onSuccess {
                    loadTrips()
                }
                .onFailure {
                    _error.value = it.message
                }

            _loading.value = false
        }
    }

    fun deleteTrip(id: String) {
        viewModelScope.launch {

            repository.deleteTrip(id)
                .onSuccess {
                    loadTrips()
                }
                .onFailure {
                    _error.value = it.message
                }
        }
    }

    fun clearError() {
        _error.value = null
    }
}

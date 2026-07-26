package com.ogod.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ogod.app.data.model.Trip
import com.ogod.app.data.repository.TripRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SearchViewModel(
    private val repository: TripRepository
) : ViewModel() {

    private val _searchResults = MutableStateFlow<List<Trip>>(emptyList())
    val searchResults: StateFlow<List<Trip>> = _searchResults

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun searchTrips(
        query: String,
        category: String? = null
    ) {

        viewModelScope.launch {

            _loading.value = true

            repository.getTrips(query, category)
                .onSuccess {
                    _searchResults.value = it
                    _error.value = null
                }
                .onFailure {
                    _error.value = it.message
                }

            _loading.value = false
        }
    }

    fun clearResults() {
        _searchResults.value = emptyList()
    }

    fun clearError() {
        _error.value = null
    }
}

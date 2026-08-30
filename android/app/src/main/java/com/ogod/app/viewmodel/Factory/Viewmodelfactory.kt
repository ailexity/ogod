```kotlin
package com.ogod.app.viewmodel.factory

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.ogod.app.data.api.NetworkModule
import com.ogod.app.data.api.SharedPreferencesAuthTokenProvider
import com.ogod.app.data.repository.AuthRepository
import com.ogod.app.data.repository.LeadRepository
import com.ogod.app.data.repository.TripRepository
import com.ogod.app.viewmodel.AuthViewModel
import com.ogod.app.viewmodel.LeadViewModel
import com.ogod.app.viewmodel.SearchViewModel
import com.ogod.app.viewmodel.TripViewModel

class ViewModelFactory(
    context: Context
) : ViewModelProvider.Factory {

    private val appContext = context.applicationContext

    private val api = NetworkModule.createApi(appContext)

    private val tripRepository = TripRepository(api)
    private val authRepository = AuthRepository(api)
    private val leadRepository = LeadRepository(api)

    private val tokenProvider =
        SharedPreferencesAuthTokenProvider(appContext)

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(
        modelClass: Class<T>
    ): T {

        return when {

            modelClass.isAssignableFrom(TripViewModel::class.java) ->
                TripViewModel(tripRepository) as T

            modelClass.isAssignableFrom(SearchViewModel::class.java) ->
                SearchViewModel(tripRepository) as T

            modelClass.isAssignableFrom(AuthViewModel::class.java) ->
                AuthViewModel(
                    authRepository,
                    tokenProvider
                ) as T

            modelClass.isAssignableFrom(LeadViewModel::class.java) ->
                LeadViewModel(leadRepository) as T

            else ->
                throw IllegalArgumentException(
                    "Unknown ViewModel: ${modelClass.name}"
                )
        }
    }
}
```

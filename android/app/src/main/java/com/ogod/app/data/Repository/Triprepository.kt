package com.ogod.app.data.repository

import com.ogod.app.data.api.OgodApiService
import com.ogod.app.data.model.Trip
import com.ogod.app.data.model.TripDraft
import com.ogod.app.data.model.TripResponse

class TripRepository(
    private val api: OgodApiService
) {

    suspend fun getTrips(
        query: String? = null,
        category: String? = null
    ): Result<List<Trip>> {

        return try {
            val response = api.trips(
                query = query,
                category = category
            )

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to load trips")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTrip(id: String): Result<TripResponse> {

        return try {
            val response = api.trip(id)

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Trip not found")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createTrip(
        draft: TripDraft
    ): Result<TripResponse> {

        return try {

            val response = api.createTrip(draft)

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to create trip")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateTrip(
        id: String,
        updates: Map<String, Any?>
    ): Result<TripResponse> {

        return try {

            val response = api.updateTrip(id, updates)

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to update trip")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun pauseTrip(id: String): Result<TripResponse> {

        return try {

            val response = api.pauseTrip(id)

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to pause trip")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun resumeTrip(id: String): Result<TripResponse> {

        return try {

            val response = api.resumeTrip(id)

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to resume trip")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteTrip(id: String): Result<Boolean> {

        return try {

            val response = api.deleteTrip(id)

            if (response.success) {
                Result.success(true)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to delete trip")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

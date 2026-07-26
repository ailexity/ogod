package com.ogod.app.data.repository

import com.ogod.app.data.api.OgodApiService
import com.ogod.app.data.model.CreateLeadRequest
import com.ogod.app.data.model.CreateLeadResponse
import com.ogod.app.data.model.Lead

class LeadRepository(
    private val api: OgodApiService
) {

    suspend fun createLead(
        request: CreateLeadRequest
    ): Result<CreateLeadResponse> {

        return try {

            val response = api.createLead(request)

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to create lead")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMyLeads(): Result<List<Lead>> {

        return try {

            val response = api.myLeads()

            if (response.success && response.data != null) {
                Result.success(response.data.leads)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to load leads")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getLeads(
        from: String? = null,
        to: String? = null,
        destination: String? = null,
        category: String? = null,
        tripId: String? = null,
        posterId: String? = null,
        page: Int? = null,
        limit: Int? = null
    ): Result<List<Lead>> {

        return try {

            val response = api.leads(
                from = from,
                to = to,
                destination = destination,
                category = category,
                tripId = tripId,
                posterId = posterId,
                page = page,
                limit = limit
            )

            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(
                    Exception(response.error?.message ?: "Unable to fetch leads")
                )
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

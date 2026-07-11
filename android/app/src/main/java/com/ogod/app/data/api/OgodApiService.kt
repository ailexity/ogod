package com.ogod.app.data.api

import com.ogod.app.data.model.ApiEnvelope
import com.ogod.app.data.model.CategoriesResponse
import com.ogod.app.data.model.CreateLeadRequest
import com.ogod.app.data.model.CreateLeadResponse
import com.ogod.app.data.model.Lead
import com.ogod.app.data.model.LeadsResponse
import com.ogod.app.data.model.MeResponse
import com.ogod.app.data.model.RequestOtpRequest
import com.ogod.app.data.model.RequestOtpResponse
import com.ogod.app.data.model.ShelvesResponse
import com.ogod.app.data.model.Trip
import com.ogod.app.data.model.TripDraft
import com.ogod.app.data.model.TripResponse
import com.ogod.app.data.model.VerifyOtpRequest
import com.ogod.app.data.model.VerifyOtpResponse
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface OgodApiService {
    @POST("auth/request-otp")
    suspend fun requestOtp(@Body request: RequestOtpRequest): ApiEnvelope<RequestOtpResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): ApiEnvelope<VerifyOtpResponse>

    @GET("auth/me")
    suspend fun me(): ApiEnvelope<MeResponse>

    @GET("trips")
    suspend fun trips(
        @Query("q") query: String? = null,
        @Query("category") category: String? = null,
        @Query("status") status: String? = null,
        @Query("posterId") posterId: String? = null,
        @Query("near") near: String? = null,
        @Query("radiusKm") radiusKm: Double? = null,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("sort") sort: String? = null
    ): ApiEnvelope<List<Trip>>

    @GET("trips/shelves")
    suspend fun shelves(): ApiEnvelope<ShelvesResponse>

    @GET("trips/mine")
    suspend fun myListings(): ApiEnvelope<Map<String, List<Trip>>>

    @GET("trips/{id}")
    suspend fun trip(@Path("id") id: String): ApiEnvelope<TripResponse>

    @POST("trips")
    suspend fun createTrip(@Body trip: TripDraft): ApiEnvelope<TripResponse>

    @PATCH("trips/{id}")
    suspend fun updateTrip(
        @Path("id") id: String,
        @Body updates: Map<String, @JvmSuppressWildcards Any?>
    ): ApiEnvelope<TripResponse>

    @POST("trips/{id}/pause")
    suspend fun pauseTrip(@Path("id") id: String): ApiEnvelope<TripResponse>

    @POST("trips/{id}/resume")
    suspend fun resumeTrip(@Path("id") id: String): ApiEnvelope<TripResponse>

    @DELETE("trips/{id}")
    suspend fun deleteTrip(@Path("id") id: String): ApiEnvelope<Map<String, String>>

    @POST("leads")
    suspend fun createLead(@Body request: CreateLeadRequest): ApiEnvelope<CreateLeadResponse>

    @GET("leads/mine")
    suspend fun myLeads(): ApiEnvelope<LeadsResponse>

    @GET("leads")
    suspend fun leads(
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
        @Query("destination") destination: String? = null,
        @Query("category") category: String? = null,
        @Query("tripId") tripId: String? = null,
        @Query("posterId") posterId: String? = null,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): ApiEnvelope<List<Lead>>

    @GET("categories")
    suspend fun categories(@Query("all") all: Boolean? = null): ApiEnvelope<CategoriesResponse>
}

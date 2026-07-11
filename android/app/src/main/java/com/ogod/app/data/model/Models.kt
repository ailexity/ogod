package com.ogod.app.data.model

data class ApiEnvelope<T>(
    val success: Boolean,
    val data: T? = null,
    val meta: Meta? = null,
    val error: ApiError? = null
)

data class ApiError(
    val message: String? = null,
    val details: List<Any>? = null
)

data class Meta(
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int
)

data class User(
    val _id: String,
    val name: String,
    val mobile: String,
    val organizationName: String? = null,
    val role: String,
    val isVerified: Boolean? = null,
    val createdAt: String? = null
)

data class Category(
    val _id: String,
    val slug: String,
    val label: String,
    val imageUrl: String? = null,
    val sortOrder: Int? = null,
    val active: Boolean? = null
)

data class GeoPoint(
    val type: String = "Point",
    val coordinates: List<Double>
)

data class Destination(
    val name: String,
    val geo: GeoPoint? = null
)

data class ItineraryDay(
    val day: Int,
    val title: String? = null,
    val locations: List<String> = emptyList(),
    val timings: String? = null,
    val inclusions: List<String> = emptyList(),
    val packingList: List<String> = emptyList()
)

data class Trip(
    val _id: String,
    val posterId: Any? = null,
    val title: String,
    val category: String,
    val destination: Destination,
    val startDate: String,
    val endDate: String,
    val durationDays: Int? = null,
    val pricePerPerson: Double,
    val totalSeats: Int,
    val seatsRemaining: Int? = null,
    val description: String? = null,
    val itinerary: List<ItineraryDay> = emptyList(),
    val coverPhotoUrl: String,
    val galleryUrls: List<String> = emptyList(),
    val status: String,
    val createdAt: String? = null
)

data class TripDraft(
    val title: String,
    val category: String,
    val destination: Destination,
    val startDate: String,
    val endDate: String,
    val durationDays: Int? = null,
    val pricePerPerson: Double,
    val totalSeats: Int,
    val seatsRemaining: Int? = null,
    val description: String? = null,
    val itinerary: List<ItineraryDay> = emptyList(),
    val coverPhotoUrl: String,
    val galleryUrls: List<String> = emptyList()
)

data class Lead(
    val _id: String,
    val tripId: Any? = null,
    val posterId: Any? = null,
    val tripTitle: String? = null,
    val travelerName: String,
    val travelerMobile: String,
    val destinationInterest: String? = null,
    val requirements: String? = null,
    val createdAt: String
)

data class Shelf(
    val key: String,
    val title: String,
    val trips: List<Trip>
)

data class RequestOtpRequest(val mobile: String)

data class RequestOtpResponse(
    val mobile: String,
    val expiresInSeconds: Int,
    val devCode: String? = null,
    val message: String? = null
)

data class VerifyOtpRequest(
    val mobile: String,
    val code: String,
    val name: String? = null,
    val organizationName: String? = null
)

data class VerifyOtpResponse(
    val token: String,
    val user: User,
    val isNewUser: Boolean
)

data class MeResponse(val user: User)

data class TripResponse(val trip: Trip)

data class ShelvesResponse(val shelves: List<Shelf>)

data class CategoriesResponse(val categories: List<Category>)

data class LeadsResponse(val leads: List<Lead>)

data class CreateLeadRequest(
    val tripId: String,
    val travelerName: String,
    val travelerMobile: String,
    val destinationInterest: String? = null,
    val requirements: String? = null
)

data class ContactLinks(
    val whatsapp: String? = null,
    val call: String? = null,
    val posterName: String? = null
)

data class CreateLeadResponse(
    val lead: Lead,
    val contact: ContactLinks
)

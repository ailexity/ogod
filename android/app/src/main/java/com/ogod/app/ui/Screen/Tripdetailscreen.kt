```kotlin
package com.ogod.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ogod.app.data.model.Trip
import com.ogod.app.ui.theme.OgodColors
import com.ogod.app.viewmodel.TripViewModel

@Composable
fun TripDetailScreen(
    tripId: String,
    viewModel: TripViewModel
) {

    val trip by viewModel.selectedTrip.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(tripId) {
        viewModel.loadTrip(tripId)
    }

    when {

        loading -> {

            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                CircularProgressIndicator()
            }
        }

        error != null -> {

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = error ?: "Unable to load trip",
                    color = OgodColors.TextPrimary
                )
            }
        }

        trip != null -> {

            TripDetailsContent(
                trip = trip!!
            )
        }

        else -> {

            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Trip not found",
                    color = OgodColors.TextSecondary
                )
            }
        }
    }
}


@Composable
private fun TripDetailsContent(
    trip: Trip
) {

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {

        Text(
            text = trip.title,
            color = OgodColors.TextPrimary,
            fontSize = 28.sp
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Text(
            text = "Destination: ${trip.destination.name}",
            color = OgodColors.TextPrimary
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

        Text(
            text = "Category: ${trip.category}",
            color = OgodColors.TextSecondary
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

        Text(
            text = "Start date: ${trip.startDate}",
            color = OgodColors.TextSecondary
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

        Text(
            text = "End date: ${trip.endDate}",
            color = OgodColors.TextSecondary
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

        Text(
            text = "Price per person: ₹${trip.pricePerPerson}",
            color = OgodColors.TextPrimary
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

        Text(
            text = "Total seats: ${trip.totalSeats}",
            color = OgodColors.TextPrimary
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

        Text(
            text = "Seats remaining: ${trip.seatsRemaining ?: trip.totalSeats}",
            color = OgodColors.TextSecondary
        )

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        if (!trip.description.isNullOrBlank()) {

            Text(
                text = "Description",
                color = OgodColors.TextPrimary,
                fontSize = 20.sp
            )

            Spacer(
                modifier = Modifier.height(8.dp)
            )

            Text(
                text = trip.description,
                color = OgodColors.TextSecondary
            )

            Spacer(
                modifier = Modifier.height(16.dp)
            )
        }

        if (trip.itinerary.isNotEmpty()) {

            Text(
                text = "Itinerary",
                color = OgodColors.TextPrimary,
                fontSize = 20.sp
            )

            Spacer(
                modifier = Modifier.height(8.dp)
            )

            trip.itinerary.forEach { day ->

                Text(
                    text = "Day ${day.day}: ${day.title ?: ""}",
                    color = OgodColors.TextPrimary
                )

                if (day.locations.isNotEmpty()) {

                    Text(
                        text = "Locations: ${day.locations.joinToString(", ")}",
                        color = OgodColors.TextSecondary
                    )
                }

                if (!day.timings.isNullOrBlank()) {

                    Text(
                        text = "Timing: ${day.timings}",
                        color = OgodColors.TextSecondary
                    )
                }

                Spacer(
                    modifier = Modifier.height(12.dp)
                )
            }
        }
    }
}
```


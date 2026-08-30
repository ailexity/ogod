package com.ogod.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ogod.app.data.model.Trip
import com.ogod.app.viewmodel.TripViewModel

@Composable
fun HomeScreen(
    tripViewModel: TripViewModel,
    onTripClick: (String) -> Unit
)
    val trips by tripViewModel.trips.collectAsState()
    val loading by tripViewModel.loading.collectAsState()
    val error by tripViewModel.error.collectAsState()

    LaunchedEffect(Unit) {
        tripViewModel.loadTrips()
    }

    when {

        loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }

        error != null -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                Text(error!!)
            }
        }

        else -> {

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp)
            ) {

                items(trips) { trip ->
    TripCard(
        trip = trip,
        onClick = {
            onTripClick(trip._id)
        }
    )
}

            }
        }
    }

}

@Composable
@Composable
fun TripCard(
    trip: Trip,
    onClick: () -> Unit
) {

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp),
        elevation = CardDefaults.cardElevation(5.dp)
    ) {

        Column(
            modifier = Modifier.padding(16.dp)
        ) {

            Text(
                text = trip.title,
                style = MaterialTheme.typography.titleMedium
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = trip.destination.name
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "₹${trip.pricePerPerson}"
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "${trip.totalSeats} Seats"
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = trip.startDate
            )

        }

    }

}

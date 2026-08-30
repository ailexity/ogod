```kotlin
package com.ogod.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ogod.app.data.model.Trip
import com.ogod.app.ui.theme.OgodColors
import com.ogod.app.viewmodel.SearchViewModel

@Composable
fun SearchScreen(
    viewModel: SearchViewModel
) {

    var query by remember {
        mutableStateOf("")
    }

    var selectedCategory by remember {
        mutableStateOf<String?>(null)
    }

    val searchResults by viewModel.searchResults.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(
                start = 20.dp,
                end = 20.dp,
                top = 24.dp,
                bottom = 16.dp
            )
    ) {

        Text(
            text = "Search Trips",
            color = OgodColors.TextPrimary,
            fontSize = 28.sp
        )

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        OutlinedTextField(
            value = query,
            onValueChange = {
                query = it
            },
            modifier = Modifier.fillMaxWidth(),
            label = {
                Text("Destination or trip")
            },
            singleLine = true
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {

            CategoryButton(
                text = "All",
                selected = selectedCategory == null,
                onClick = {
                    selectedCategory = null
                }
            )

            CategoryButton(
                text = "Trek",
                selected = selectedCategory == "Trek",
                onClick = {
                    selectedCategory = "Trek"
                }
            )

            CategoryButton(
                text = "Family",
                selected = selectedCategory == "Family",
                onClick = {
                    selectedCategory = "Family"
                }
            )
        }

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Button(
            onClick = {

                viewModel.searchTrips(
                    query = query.ifBlank {
                        ""
                    },
                    category = selectedCategory
                )
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = OgodColors.Accent,
                contentColor = OgodColors.Background
            )
        ) {
            Text("Search")
        }

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        when {

            loading -> {

                CircularProgressIndicator()
            }

            error != null -> {

                Text(
                    text = error ?: "Something went wrong",
                    color = OgodColors.TextPrimary
                )
            }

            searchResults.isEmpty() -> {

                Text(
                    text = "No trips found.",
                    color = OgodColors.TextSecondary
                )
            }

            else -> {

                LazyColumn(
                    modifier = Modifier.fillMaxSize()
                ) {

                    items(searchResults) { trip ->

                        TripSearchCard(
                            trip = trip
                        )

                        Spacer(
                            modifier = Modifier.height(12.dp)
                        )
                    }
                }
            }
        }
    }
}


@Composable
private fun CategoryButton(
    text: String,
    selected: Boolean,
    onClick: () -> Unit
) {

    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selected) {
                OgodColors.Accent
            } else {
                OgodColors.SurfaceElevated
            },
            contentColor = if (selected) {
                OgodColors.Background
            } else {
                OgodColors.TextPrimary
            }
        )
    ) {

        Text(
            text = text
        )
    }
}


@Composable
private fun TripSearchCard(
    trip: Trip
) {

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(14.dp)
    ) {

        Text(
            text = trip.title,
            color = OgodColors.TextPrimary,
            fontSize = 18.sp
        )

        Spacer(
            modifier = Modifier.height(6.dp)
        )

        Text(
            text = trip.category,
            color = OgodColors.TextSecondary,
            fontSize = 14.sp
        )

        Spacer(
            modifier = Modifier.height(6.dp)
        )

        Text(
            text = trip.destination.name,
            color = OgodColors.TextSecondary,
            fontSize = 14.sp
        )

        Spacer(
            modifier = Modifier.height(6.dp)
        )

        Text(
            text = "₹${trip.pricePerPerson}",
            color = OgodColors.TextPrimary,
            fontSize = 14.sp
        )
    }
}
```

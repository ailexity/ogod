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
import com.ogod.app.data.model.Destination
import com.ogod.app.data.model.TripDraft
import com.ogod.app.ui.theme.OgodColors
import com.ogod.app.viewmodel.TripViewModel

@Composable
fun PostTripScreen(
    viewModel: TripViewModel
) {

    var title by remember {
        mutableStateOf("")
    }

    var category by remember {
        mutableStateOf("")
    }

    var destination by remember {
        mutableStateOf("")
    }

    var startDate by remember {
        mutableStateOf("")
    }

    var endDate by remember {
        mutableStateOf("")
    }

    var price by remember {
        mutableStateOf("")
    }

    var totalSeats by remember {
        mutableStateOf("")
    }

    var description by remember {
        mutableStateOf("")
    }

    var coverPhotoUrl by remember {
        mutableStateOf("")
    }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(
                start = 20.dp,
                end = 20.dp,
                top = 24.dp,
                bottom = 24.dp
            ),
        verticalArrangement = Arrangement.Top
    ) {

        Text(
            text = "Post Trip",
            color = OgodColors.TextPrimary,
            fontSize = 28.sp
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        TripInput(
            value = title,
            onValueChange = {
                title = it
            },
            label = "Trip title"
        )

        TripInput(
            value = category,
            onValueChange = {
                category = it
            },
            label = "Category"
        )

        TripInput(
            value = destination,
            onValueChange = {
                destination = it
            },
            label = "Destination"
        )

        TripInput(
            value = startDate,
            onValueChange = {
                startDate = it
            },
            label = "Start date (YYYY-MM-DD)"
        )

        TripInput(
            value = endDate,
            onValueChange = {
                endDate = it
            },
            label = "End date (YYYY-MM-DD)"
        )

        TripInput(
            value = price,
            onValueChange = {
                price = it
            },
            label = "Price per person"
        )

        TripInput(
            value = totalSeats,
            onValueChange = {
                totalSeats = it
            },
            label = "Total seats"
        )

        TripInput(
            value = description,
            onValueChange = {
                description = it
            },
            label = "Description",
            singleLine = false
        )

        TripInput(
            value = coverPhotoUrl,
            onValueChange = {
                coverPhotoUrl = it
            },
            label = "Cover photo URL"
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        if (loading) {

            CircularProgressIndicator()

        } else {

            Button(
                onClick = {

                    val priceValue = price.toDoubleOrNull()
                    val seatsValue = totalSeats.toIntOrNull()

                    if (
                        title.isNotBlank() &&
                        category.isNotBlank() &&
                        destination.isNotBlank() &&
                        startDate.isNotBlank() &&
                        endDate.isNotBlank() &&
                        priceValue != null &&
                        seatsValue != null &&
                        coverPhotoUrl.isNotBlank()
                    ) {

                        val draft = TripDraft(
                            title = title,
                            category = category,
                            destination = Destination(
                                name = destination
                            ),
                            startDate = startDate,
                            endDate = endDate,
                            pricePerPerson = priceValue,
                            totalSeats = seatsValue,
                            description = description.ifBlank {
                                null
                            },
                            coverPhotoUrl = coverPhotoUrl
                        )

                        viewModel.createTrip(draft)
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = OgodColors.Accent,
                    contentColor = OgodColors.Background
                )
            ) {
                Text("Post Trip")
            }
        }

        if (error != null) {

            Spacer(
                modifier = Modifier.height(12.dp)
            )

            Text(
                text = error ?: "Something went wrong",
                color = OgodColors.TextPrimary,
                fontSize = 14.sp
            )
        }
    }
}


@Composable
private fun TripInput(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    singleLine: Boolean = true
) {

    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp),
        label = {
            Text(label)
        },
        singleLine = singleLine
    )
}
```


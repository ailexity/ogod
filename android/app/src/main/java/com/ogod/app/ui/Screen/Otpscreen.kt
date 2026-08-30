```kotlin
package com.ogod.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ogod.app.viewmodel.AuthViewModel

@Composable
fun OtpScreen(
    mobile: String,
    viewModel: AuthViewModel,
    onVerified: () -> Unit
) {
    var code by remember {
        mutableStateOf("")
    }

    var name by remember {
        mutableStateOf("")
    }

    var organizationName by remember {
        mutableStateOf("")
    }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val user by viewModel.user.collectAsState()

    LaunchedEffect(user) {
        if (user != null) {
            onVerified()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        Text(
            text = "Verify OTP",
            fontSize = 28.sp
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Text(
            text = "OTP sent to $mobile"
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        OutlinedTextField(
            value = code,
            onValueChange = {
                code = it
            },
            modifier = Modifier.fillMaxWidth(),
            label = {
                Text("OTP")
            },
            singleLine = true
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        OutlinedTextField(
            value = name,
            onValueChange = {
                name = it
            },
            modifier = Modifier.fillMaxWidth(),
            label = {
                Text("Name (optional)")
            },
            singleLine = true
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        OutlinedTextField(
            value = organizationName,
            onValueChange = {
                organizationName = it
            },
            modifier = Modifier.fillMaxWidth(),
            label = {
                Text("Organization name (optional)")
            },
            singleLine = true
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        if (loading) {

            CircularProgressIndicator()

        } else {

            Button(
                onClick = {

                    if (code.isNotBlank()) {

                        viewModel.verifyOtp(
                            mobile = mobile,
                            code = code,
                            name = name.ifBlank {
                                null
                            },
                            organizationName = organizationName.ifBlank {
                                null
                            }
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Verify OTP")
            }
        }

        if (error != null) {

            Spacer(
                modifier = Modifier.height(12.dp)
            )

            Text(
                text = error ?: "OTP verification failed"
            )
        }
    }
}
```


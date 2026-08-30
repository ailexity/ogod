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
fun LoginScreen(
    viewModel: AuthViewModel,
    onOtpSent: (String) -> Unit
) {
    var mobile by remember {
        mutableStateOf("")
    }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val otpSent by viewModel.otpSent.collectAsState()

    LaunchedEffect(otpSent) {
        if (otpSent && mobile.isNotBlank()) {
            onOtpSent(mobile)
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
            text = "Welcome to OGOD",
            fontSize = 28.sp
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Text(
            text = "Enter your mobile number"
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        OutlinedTextField(
            value = mobile,
            onValueChange = {
                mobile = it
            },
            modifier = Modifier.fillMaxWidth(),
            label = {
                Text("Mobile number")
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
                    if (mobile.isNotBlank()) {
                        viewModel.requestOtp(mobile)
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Send OTP")
            }
        }

        if (error != null) {

            Spacer(
                modifier = Modifier.height(12.dp)
            )

            Text(
                text = error ?: "Something went wrong"
            )
        }
    }
}
```


```kotlin
package com.ogod.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
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
import com.ogod.app.viewmodel.AuthViewModel

@Composable
fun ProfileScreen(
    viewModel: AuthViewModel,
    onLogout: () -> Unit
) {

    val user by viewModel.user.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(Unit) {
        if (user == null) {
            viewModel.loadCurrentUser()
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
            text = "Profile",
            fontSize = 28.sp
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        if (loading) {

            CircularProgressIndicator()

        } else if (user != null) {

            Text(
                text = "Name: ${user!!.name}",
                fontSize = 18.sp
            )

            Spacer(
                modifier = Modifier.height(8.dp)
            )

            Text(
                text = "Mobile: ${user!!.mobile}"
            )

            Spacer(
                modifier = Modifier.height(8.dp)
            )

            Text(
                text = "Role: ${user!!.role}"
            )

            if (!user!!.organizationName.isNullOrBlank()) {

                Spacer(
                    modifier = Modifier.height(8.dp)
                )

                Text(
                    text = "Organization: ${user!!.organizationName}"
                )
            }

            Spacer(
                modifier = Modifier.height(24.dp)
            )

            Button(
                onClick = {
                    viewModel.logout()
                    onLogout()
                }
            ) {
                Text("Logout")
            }

        } else {

            Text(
                text = error ?: "You are not logged in"
            )

            Spacer(
                modifier = Modifier.height(20.dp)
            )

            Button(
                onClick = onLogout
            ) {
                Text("Login")
            }
        }
    }
}
```

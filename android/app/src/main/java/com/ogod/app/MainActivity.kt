package com.ogod.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AddCircle
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ogod.app.ui.theme.OgodColors
import com.ogod.app.ui.theme.OgodTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            OgodTheme {
                OgodApp()
            }
        }
    }
}

private data class NavItem(
    val label: String,
    val icon: ImageVector
)

private val navItems = listOf(
    NavItem("Home", Icons.Outlined.Home),
    NavItem("Search", Icons.Outlined.Search),
    NavItem("Post Trip", Icons.Outlined.AddCircle),
    NavItem("Profile", Icons.Outlined.Person)
)

@Composable
private fun OgodApp() {
    var selectedIndex by rememberSaveable { mutableIntStateOf(0) }

    Scaffold(
        containerColor = OgodColors.Background,
        bottomBar = {
            NavigationBar(
                containerColor = OgodColors.Surface,
                tonalElevation = 0.dp
            ) {
                navItems.forEachIndexed { index, item ->
                    NavigationBarItem(
                        selected = selectedIndex == index,
                        onClick = { selectedIndex = index },
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = OgodColors.Background,
                            selectedTextColor = OgodColors.Accent,
                            indicatorColor = OgodColors.Accent,
                            unselectedIconColor = OgodColors.TextSecondary,
                            unselectedTextColor = OgodColors.TextSecondary
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        when (selectedIndex) {
            0 -> HomeScreen(innerPadding)
            1 -> SearchScreen(innerPadding)
            2 -> PostTripScreen(innerPadding)
            else -> ProfileScreen(innerPadding)
        }
    }
}

@Composable
private fun ScreenContainer(
    paddingValues: PaddingValues,
    title: String,
    content: @Composable () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OgodColors.Background)
            .verticalScroll(rememberScrollState())
            .padding(paddingValues)
            .padding(horizontal = 20.dp, vertical = 24.dp)
    ) {
        Text(
            text = title,
            color = OgodColors.TextPrimary,
            fontSize = 28.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Spacer(modifier = Modifier.height(18.dp))
        content()
    }
}

@Composable
private fun HomeScreen(paddingValues: PaddingValues) {
    ScreenContainer(paddingValues, "Home") {
        ShelfHeader("Departing soon")
        TripPreview("Kedarnath Group Trek", "Pilgrimage", "Starts 18 Jul", "12 seats")
        TripPreview("Goa Weekend Escape", "Weekend Getaway", "Starts 26 Jul", "8 seats")
    }
}

@Composable
private fun SearchScreen(paddingValues: PaddingValues) {
    var query by remember { mutableStateOf("") }
    ScreenContainer(paddingValues, "Search") {
        TextField(
            value = query,
            onValueChange = { query = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Destination or trip") },
            singleLine = true,
            colors = TextFieldDefaults.colors(
                focusedContainerColor = OgodColors.Surface,
                unfocusedContainerColor = OgodColors.Surface,
                focusedIndicatorColor = OgodColors.Accent,
                unfocusedIndicatorColor = OgodColors.Divider,
                focusedTextColor = OgodColors.TextPrimary,
                unfocusedTextColor = OgodColors.TextPrimary,
                focusedPlaceholderColor = OgodColors.TextSecondary,
                unfocusedPlaceholderColor = OgodColors.TextSecondary
            )
        )
        Spacer(modifier = Modifier.height(18.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Chip("All")
            Chip("Trek")
            Chip("Family")
        }
    }
}

@Composable
private fun PostTripScreen(paddingValues: PaddingValues) {
    ScreenContainer(paddingValues, "Post Trip") {
        TextFieldLine("Trip title")
        TextFieldLine("Destination")
        TextFieldLine("Category")
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {},
            colors = ButtonDefaults.buttonColors(
                containerColor = OgodColors.Accent,
                contentColor = OgodColors.Background
            )
        ) {
            Text("Save Draft", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun ProfileScreen(paddingValues: PaddingValues) {
    ScreenContainer(paddingValues, "Profile") {
        InfoPanel("Signed out", "Sign in to manage trips and inquiries.")
    }
}

@Composable
private fun ShelfHeader(title: String) {
    Text(
        text = title,
        color = OgodColors.TextPrimary,
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold
    )
    Spacer(modifier = Modifier.height(12.dp))
}

@Composable
private fun TripPreview(title: String, category: String, date: String, seats: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = OgodColors.Surface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(title, color = OgodColors.TextPrimary, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Text("$category - $date - $seats", color = OgodColors.TextSecondary, fontSize = 13.sp)
        }
    }
}

@Composable
private fun Chip(label: String) {
    Button(
        onClick = {},
        colors = ButtonDefaults.buttonColors(
            containerColor = if (label == "All") OgodColors.Accent else OgodColors.SurfaceElevated,
            contentColor = if (label == "All") OgodColors.Background else OgodColors.TextPrimary
        )
    ) {
        Text(label, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun TextFieldLine(placeholder: String) {
    var value by remember { mutableStateOf("") }
    TextField(
        value = value,
        onValueChange = { value = it },
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp),
        placeholder = { Text(placeholder) },
        singleLine = true,
        colors = TextFieldDefaults.colors(
            focusedContainerColor = OgodColors.Surface,
            unfocusedContainerColor = OgodColors.Surface,
            focusedIndicatorColor = OgodColors.Accent,
            unfocusedIndicatorColor = OgodColors.Divider,
            focusedTextColor = OgodColors.TextPrimary,
            unfocusedTextColor = OgodColors.TextPrimary,
            focusedPlaceholderColor = OgodColors.TextSecondary,
            unfocusedPlaceholderColor = OgodColors.TextSecondary
        )
    )
}

@Composable
private fun InfoPanel(title: String, body: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = OgodColors.Surface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(title, color = OgodColors.TextPrimary, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            Text(body, color = OgodColors.TextSecondary, fontSize = 13.sp)
        }
    }
}

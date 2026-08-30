```kotlin
package com.ogod.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AddCircle
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.ogod.app.ui.screens.HomeScreen
import com.ogod.app.ui.screens.PostTripScreen
import com.ogod.app.ui.screens.ProfileScreen
import com.ogod.app.ui.screens.SearchScreen
import com.ogod.app.ui.screens.TripDetailScreen
import com.ogod.app.ui.theme.OgodColors
import com.ogod.app.ui.theme.OgodTheme
import com.ogod.app.viewmodel.SearchViewModel
import com.ogod.app.viewmodel.TripViewModel
import com.ogod.app.viewmodel.factory.ViewModelFactory

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
    val icon: ImageVector,
    val route: String
)

private val navItems = listOf(
    NavItem(
        label = "Home",
        icon = Icons.Outlined.Home,
        route = "home"
    ),
    NavItem(
        label = "Search",
        icon = Icons.Outlined.Search,
        route = "search"
    ),
    NavItem(
        label = "Post Trip",
        icon = Icons.Outlined.AddCircle,
        route = "post_trip"
    ),
    NavItem(
        label = "Profile",
        icon = Icons.Outlined.Person,
        route = "profile"
    )
)

@Composable
private fun OgodApp() {

    val navController = rememberNavController()

    val context = LocalContext.current

    val tripViewModel: TripViewModel = viewModel(
        factory = ViewModelFactory(context)
    )

    val searchViewModel: SearchViewModel = viewModel(
        factory = ViewModelFactory(context)
    )

    var selectedIndex by rememberSaveable {
        mutableIntStateOf(0)
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = OgodColors.Background,

        bottomBar = {

            NavigationBar(
                containerColor = OgodColors.Surface,
                tonalElevation = 0.dp
            ) {

                navItems.forEachIndexed { index, item ->

                    NavigationBarItem(

                        selected = selectedIndex == index,

                        onClick = {

                            selectedIndex = index

                            navController.navigate(item.route) {
                                launchSingleTop = true
                            }
                        },

                        icon = {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.label
                            )
                        },

                        label = {
                            Text(text = item.label)
                        },

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

        NavHost(
            navController = navController,
            startDestination = "home"
        ) {

            composable("home") {

                HomeScreen(
                    tripViewModel = tripViewModel,
                    onTripClick = { tripId ->
                        navController.navigate("trip_detail/$tripId")
                    }
                )
            }

            composable("search") {

                SearchScreen(
                    viewModel = searchViewModel
                )
            }

            composable("post_trip") {

                PostTripScreen(
                    viewModel = tripViewModel
                )
            }

            composable("profile") {

                ProfileScreen(
                    paddingValues = innerPadding
                )
            }

            composable(
                route = "trip_detail/{tripId}",
                arguments = listOf(
                    navArgument("tripId") {
                        type = NavType.StringType
                    }
                )
            ) { backStackEntry ->

                val tripId =
                    backStackEntry.arguments?.getString("tripId")

                if (tripId != null) {

                    TripDetailScreen(
                        tripId = tripId,
                        viewModel = tripViewModel
                    )
                }
            }
        }
    }
}
```

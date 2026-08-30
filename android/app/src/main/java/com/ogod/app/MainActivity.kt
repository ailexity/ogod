```kotlin
package com.ogod.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ogod.app.ui.screens.HomeScreen
import com.ogod.app.ui.screens.SearchScreen
import com.ogod.app.ui.theme.OgodColors
import com.ogod.app.ui.theme.OgodTheme
import com.ogod.app.viewmodel.TripViewModel
import com.ogod.app.viewmodel.SearchViewModel
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
    val icon: ImageVector
)


private val navItems = listOf(
    NavItem(
        label = "Home",
        icon = Icons.Outlined.Home
    ),
    NavItem(
        label = "Search",
        icon = Icons.Outlined.Search
    ),
    NavItem(
        label = "Post Trip",
        icon = Icons.Outlined.AddCircle
    ),
    NavItem(
        label = "Profile",
        icon = Icons.Outlined.Person
    )
)


@Composable
private fun OgodApp() {

    var selectedIndex by rememberSaveable {
        mutableIntStateOf(0)
    }

    val context = LocalContext.current

    val tripViewModel: TripViewModel = viewModel(
    factory = ViewModelFactory(context)
)

val searchViewModel: SearchViewModel = viewModel(
    factory = ViewModelFactory(context)
)
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

        when (selectedIndex) {

            0 -> {
                HomeScreen(tripViewModel)
            }

            1 -> {
        SearchScreen(
            viewModel = searchViewModel
        )
    }


            2 -> {
                PlaceholderScreen(
                    title = "Post Trip"
                )
            }

            3 -> {
                PlaceholderScreen(
                    title = "Profile"
                )
            }
        }
    }
}


@Composable
private fun PlaceholderScreen(
    title: String
) {

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {

        Text(
            text = title,
            color = OgodColors.TextPrimary
        )
    }
}
```


package com.ogod.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val OgodColorScheme = darkColorScheme(
    primary = OgodColors.Accent,
    onPrimary = OgodColors.Background,
    background = OgodColors.Background,
    onBackground = OgodColors.TextPrimary,
    surface = OgodColors.Surface,
    onSurface = OgodColors.TextPrimary,
    surfaceVariant = OgodColors.SurfaceElevated,
    onSurfaceVariant = OgodColors.TextSecondary,
    error = OgodColors.Error,
    onError = OgodColors.TextPrimary
)

@Composable
fun OgodTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = OgodColorScheme,
       typography = OgodTypography,
        content = content
    )
}

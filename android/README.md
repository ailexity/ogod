# Ogod Android

Kotlin Android app scaffold for the Ogod marketplace.

## Run

Open this `android/` folder in Android Studio, let Gradle sync, then run the `app` configuration.

The API base URL defaults to the emulator loopback address:

```properties
API_BASE_URL=http://10.0.2.2:5000/api/
```

Override it in `local.properties` for a physical device or deployed backend. Keep the trailing
slash so Retrofit can resolve relative endpoint paths.

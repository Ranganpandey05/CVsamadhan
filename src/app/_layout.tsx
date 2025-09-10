
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Adjust path if needed

// Keep the native splash screen visible until we've figured out the auth state.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('Navigation effect triggered:', { loading, session: !!session, segments });
    
    if (loading) {
      return; // Don't do anything until the session is loaded.
    }

    // Hide the splash screen now that we have the auth information.
    SplashScreen.hideAsync();

    const inAppGroup = segments[0] === '(home)';
    const inAuthGroup = segments[0] === '(auth)';

    if (session && !inAppGroup) {
      // User is signed in but is not in the main app group.
      // Redirect them to the home screen.
      console.log('User signed in, redirecting to home screen');
      router.replace('/(home)');
    } else if (!session && inAppGroup) {
      // User is not signed in and is trying to access protected home screens.
      // Redirect them to the welcome screen.
      console.log('User not signed in, redirecting to welcome screen');
      router.replace('/');
    }
    // Note: We don't redirect away from auth screens - let users access login/signup
  }, [session, loading, segments]);

  // Show a minimal loading screen while determining auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack>
      {/* The new welcome screen is now the root entry point */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* The auth group contains citizen and worker login/signup */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* The main app content for logged-in users */}
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}

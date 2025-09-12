
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Keep the native splash screen visible until we've figured out the auth state.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { session, loading, profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isNavigating, setIsNavigating] = useState(false);

  // Clear navigation flag when segments actually change to welcome screen
  useEffect(() => {
    const currentPath = segments.join('/');
    if (currentPath === '' || currentPath === 'index') {
      // We're at the welcome screen, clear the navigation flag
      setIsNavigating(false);
    }
  }, [segments]);

  useEffect(() => {
    if (loading) {
      return; // Don't do anything until auth is loaded
    }

    // Hide the splash screen now that we have the auth information
    SplashScreen.hideAsync();

    const inWorkerGroup = segments[0] === '(worker)';
    const inCitizenGroup = segments[0] === '(citizen)';
    const inAuthGroup = segments[0] === '(auth)';
    const inTaskNavigation = segments[0] === 'task-navigation';

    console.log('Navigation check:', { 
      isAuthenticated, 
      hasProfile: !!profile,
      profileRole: profile?.role,
      segments: segments.join('/'), 
      inWorkerGroup,
      inCitizenGroup,
      inAuthGroup,
      inTaskNavigation
    });

    // Prevent infinite navigation loops
    const currentPath = segments.join('/');
    
    // IMMEDIATE CHECK: If user is not authenticated and in protected area, navigate immediately
    if (!isAuthenticated && (inWorkerGroup || inCitizenGroup || inTaskNavigation)) {
      console.log('Navigation: User logged out, forcing immediate redirect from:', segments.join('/'));
      
      if (!isNavigating) {
        setIsNavigating(true);
        
        // Different navigation strategy for citizen tabs vs other areas
        if (inCitizenGroup) {
          console.log('Navigation: Escaping citizen tabs layout');
          // More aggressive navigation for tabs
          router.dismissAll();
          router.replace('/');
          
          // Extra fallback for stubborn tabs
          setTimeout(() => {
            router.dismissAll();
            router.navigate('/');
          }, 50);
          
          setTimeout(() => {
            router.push('/');
          }, 100);
          
        } else {
          // Standard navigation for other areas
          router.replace('/');
        }
        
        // Reset navigation state quickly
        setTimeout(() => {
          setIsNavigating(false);
        }, 200);
        
        return;
      }
    }
    
    // Skip additional navigation logic if we already handled logout above
    if (!isAuthenticated && (inWorkerGroup || inCitizenGroup || inTaskNavigation)) {
      // Already handled by immediate check above
      return;
    } else if (isAuthenticated && !profile) {
      // Authenticated but no profile - go to auth
      if (!inAuthGroup) {
        console.log('Navigation: Redirecting to auth for profile setup');
        if (!isNavigating) {
          setIsNavigating(true);
          router.replace('/(auth)/worker');
        }
      }
    } else if (isAuthenticated && profile) {
      // Check if worker needs approval
      if (profile.role === 'worker' && profile.approval_status === 'pending') {
        console.log('Navigation: Worker pending approval, showing waiting screen');
        if (!inAuthGroup) {
          if (!isNavigating) {
            setIsNavigating(true);
            router.replace('/(auth)/worker');
          }
        }
        return;
      }
      
      // Check if worker is rejected
      if (profile.role === 'worker' && profile.approval_status === 'rejected') {
        console.log('Navigation: Worker application rejected, redirecting to auth');
        if (!inAuthGroup) {
          if (!isNavigating) {
            setIsNavigating(true);
            router.replace('/(auth)/worker');
          }
        }
        return;
      }
      
      // Authenticated with profile - allow task navigation for workers
      if (inTaskNavigation && profile.role !== 'worker') {
        console.log('Navigation: Non-worker accessing task navigation, redirecting');
        router.replace('/(auth)');
        return;
      }
      
      // Don't redirect if user is in task navigation and is a worker
      if (inTaskNavigation && profile.role === 'worker') {
        console.log('Navigation: Worker in task navigation, allowing');
        return;
      }
      
      // Authenticated with profile - go to correct area (only if approved)
      const shouldBeInWorker = profile.role === 'worker' && profile.approval_status === 'approved' && !inWorkerGroup && !inTaskNavigation;
      const shouldBeInCitizen = profile.role === 'citizen' && !inCitizenGroup;
      
      if (shouldBeInWorker) {
        console.log('Navigation: Redirecting approved worker to dashboard');
        if (!isNavigating) {
          setIsNavigating(true);
          router.replace('/(worker)/dashboard');
        }
      } else if (shouldBeInCitizen) {
        console.log('Navigation: Redirecting citizen to home');
        if (!isNavigating) {
          setIsNavigating(true);
          router.replace('/(citizen)');
        }
      }
    }
  }, [isAuthenticated, profile, loading, segments, router, isNavigating]);

  // Show loading screen while determining auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(worker)" options={{ headerShown: false }} />
      <Stack.Screen name="(citizen)" options={{ headerShown: false }} />
      <Stack.Screen name="task-navigation" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <InitialLayout />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

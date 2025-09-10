import React from 'react';
import { Stack } from 'expo-router';

// This layout file defines the navigation stack for the authentication group.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header for all screens in this stack
      }}
    >
      <Stack.Screen name="citizen" />
      <Stack.Screen name="worker" />
      {/* We can add a pending screen for workers later */}
    </Stack>
  );
}

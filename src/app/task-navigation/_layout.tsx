import { Stack } from 'expo-router';

export default function TaskNavigationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="[taskId]" />
    </Stack>
  );
}
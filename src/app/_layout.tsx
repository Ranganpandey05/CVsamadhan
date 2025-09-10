// import { Stack } from 'expo-router'

// export default function RootLayout (){
//     return(
//         <Stack>
//             <Stack.Screen name='(home)'
//             options={{headerShown:false, title: 'CiviSamadhan'}} 
//             >
//             </Stack.Screen>
//             {/*------ not needed from here-------  */}
//             <Stack.Screen name='report'
//             options={{headerShown:true, title: 'Home'}} 
//             >
//             </Stack.Screen>
//             <Stack.Screen name='inbox'
//             options={{headerShown:true, title: 'inbox'}} 
//             >
//             </Stack.Screen>
//            <Stack.Screen name='profile'
//             options={{headerShown:true, title: 'profile'}} 
//             >
//             </Stack.Screen>
//             {/* --------Till here ------- */}
//             <Stack.Screen name='auth'
//             options={{headerShown:true}} 
//             >
//             </Stack.Screen>
//         </Stack>

//     );
// }

// import React, { useEffect } from 'react';
// import { Stack, useRouter, useSegments } from 'expo-router';
// import { AuthProvider, useAuth } from '../context/AuthContext'; // Adjust path if needed

// const InitialLayout = () => {
//   const { session, loading } = useAuth();
//   const router = useRouter();
//   const segments = useSegments();

//   useEffect(() => {
//     if (loading) return;

//     const inAuthGroup = segments[0] === '(auth)';

//     if (session && !inAuthGroup) {
//       // User is signed in and not in the auth group.
//       // Redirect to the home screen.
//       router.replace('/(home)');
//     } else if (!session) {
//       // User is not signed in.
//       // Redirect to the auth screen.
//       router.replace('/auth');
//     }
//   }, [session, loading, segments]);

//   return (
//     <Stack>
//       <Stack.Screen name="auth" options={{ headerShown: false }} />
//       <Stack.Screen name="(home)" options={{ headerShown: false }} />
//     </Stack>
//   );
// };

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <InitialLayout />
//     </AuthProvider>
//   );
// }

import React, { useEffect } from 'react';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Adjust path if needed

// Keep the native splash screen visible until we've figured out the auth state.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return; // Don't do anything until the session is loaded.
    }

    // Hide the splash screen now that we have the auth information.
    SplashScreen.hideAsync();

    const inAppGroup = segments[0] === '(home)';

    if (session && !inAppGroup) {
      // User is signed in but is not in the main app group.
      // This can happen if they are on the welcome/login screen.
      // Redirect them to the home screen.
      router.replace('/(home)');
    } else if (!session && inAppGroup) {
      // User is not signed in and is trying to access a protected screen.
      // Redirect them to the main welcome screen.
      router.replace('/');
    }
  }, [session, loading, segments]);

  // This simple return prevents any UI from showing while we determine the auth state.
  if (loading) {
    return null;
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

// import { Tabs } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StyleSheet } from 'react-native';
// import {FontAwesome} from '@expo/vector-icons'

// function TabBarIcon(props:{
//     name: React.ComponentProps<typeof FontAwesome>['name'];
//     color: string;
// }) {
//     return <FontAwesome size={24} {...props}  />;
// }

// const TabsLayout = () => {
//     return(
//         <SafeAreaView edges={['top']} style={styles.safeArea}>
//           <Tabs
//           screenOptions={{
//             tabBarActiveTintColor: '#1BC464',
//             tabBarInactiveTintColor: 'gray',
//             tabBarLabelStyle:{ fontSize : 16},
//             tabBarStyle:{
//                 borderTopLeftRadius: 20,
//                 borderTopRightRadius: 20,
//                 paddingTop:10,
//                 paddingBottom:20,
//             },
//             headerShown: false,
//           }}
//           >
//              <Tabs.Screen name='index' 
//              options={{ 
//                 title: 'Home',
//                  tabBarIcon(props){
//                     return <TabBarIcon {...props} name='home' />;
//                  },
//              }}
//              />
//              <Tabs.Screen name='report' options={{
//                 title: 'Report',
//                 tabBarIcon(props){
//                     return <TabBarIcon {...props} name='plus' />;
//                 },
//              }} />
//              <Tabs.Screen name='inbox' options={{
//                 title: 'Inbox',
//                 tabBarIcon(props){
//                     return <TabBarIcon {...props} name='bell' />;
//                 },
//              }} />
//              <Tabs.Screen name='profile' options={{
//                 title: 'Profile',
//                 tabBarIcon(props){
//                     return <TabBarIcon {...props} name='user' />;
//                 },
//              }} />
//           </Tabs>
//         </SafeAreaView>

//     );
// }

// export default TabsLayout;

// const styles =StyleSheet.create({
//     safeArea: {
//         flex : 1,
//     }
// });
import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

// Component for Citizen's Tab Bar - THIS IS THE UI THAT SHOULD SHOW FOR CITIZENS
const CitizenTabs = () => (
  <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#3b82f6', // Citizen Blue
      headerShown: false,
    }}>
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
      }}
    />
    <Tabs.Screen
      name="report"
      options={{
        title: 'Report',
        tabBarIcon: ({ color }) => <TabBarIcon name="plus-square" color={color} />,
      }}
    />
    <Tabs.Screen
      name="inbox"
      options={{
        title: 'Notifications',
        tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
      }}
    />
    {/* These lines HIDE the worker screens from the citizen's view */}
    <Tabs.Screen name="dashboard" options={{ href: null }} />
    <Tabs.Screen name="community" options={{ href: null }} />
  </Tabs>
);

// Component for Worker's Tab Bar - THIS IS THE UI THAT SHOULD SHOW FOR WORKERS
const WorkerTabs = () => (
  <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#64748b', // Worker Gray
      headerShown: false,
    }}>
    <Tabs.Screen
      name="dashboard"
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
      }}
    />
    <Tabs.Screen
      name="community"
      options={{
        title: 'Community',
        tabBarIcon: ({ color }) => <TabBarIcon name="group" color={color} />,
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
      }}
    />
    {/* These lines HIDE the citizen screens from the worker's view */}
    <Tabs.Screen name="index" options={{ href: null }} />
    <Tabs.Screen name="report" options={{ href: null }} />
    <Tabs.Screen name="inbox" options={{ href: null }} />
  </Tabs>
);

// This is the main component that DECIDES which set of tabs to show
export default function HomeLayout() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only proceed if we have a user or session
    if (!user && !session) {
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const currentUser = user || session?.user;
        if (!currentUser) {
          setUserRole('citizen');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          // Try to get role from user metadata as fallback
          const roleFromMetadata = currentUser.user_metadata?.role || 'citizen';
          setUserRole(roleFromMetadata);
        } else {
          setUserRole(data?.role || 'citizen');
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole('citizen'); // Default on any error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, session]);

  // Don't render anything if no user/session - let root layout handle redirect
  if (!user && !session) {
    return null;
  }

  // Show loading only while fetching profile
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Render the correct Tab Navigator based on the fetched role
  return userRole === 'worker' ? <WorkerTabs /> : <CitizenTabs />;
}

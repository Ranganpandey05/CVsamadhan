import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import FloatingNotifications from '../../components/FloatingNotifications';

// Translations for Worker Dashboard
const translations = {
  en: {
    workerDashboard: 'Worker Dashboard',
    assignedTasks: 'Assigned Tasks',
    pendingTasks: 'Pending Tasks',
    inProgress: 'In Progress',
    completed: 'Completed',
    startTask: 'Start Task',
    navigate: 'Navigate',
    viewDetails: 'View Details',
    markComplete: 'Mark Complete',
    noTasks: 'No tasks assigned',
    noTasksDesc: 'Check back later for new assignments',
    priority: 'Priority',
    reportedBy: 'Reported by',
    location: 'Location',
    description: 'Description',
    category: 'Category',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    notifications: 'Notifications',
    taskAssigned: 'New task assigned',
    welcomeBack: 'Welcome back',
    taskOverview: 'Task Overview',
    showMap: 'Show Map',
    hideMap: 'Hide Map',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    tasksNearby: 'Tasks Nearby',
    yourLocation: 'Your Location',
    taskLocations: 'Task Locations',
    distance: 'Distance',
    away: 'away',
    viewOnMap: 'View on Map',
    refreshTasks: 'Pull to refresh',
    taskStarted: 'Task Started',
    taskCompleted: 'Task Completed',
    taskCompletedMsg: 'Task has been marked as completed',
    taskStartedMsg: 'Task has been marked as in progress',
    confirmStart: 'Are you sure you want to start this task?',
    confirmComplete: 'Mark this task as completed?',
    cancel: 'Cancel',
    start: 'Start',
    complete: 'Complete',
    error: 'Error',
    success: 'Success',
    taskStatusUpdated: 'Task status updated successfully',
    failedToUpdateTask: 'Failed to update task status',
    failedToLoadTasks: 'Failed to load tasks',
    permissionDenied: 'Permission Denied',
    locationPermissionRequired: 'Location permission is required to show your position on the map',
    loadingTasks: 'Loading tasks...',
    recentlyCompleted: 'Recently Completed',
    taskDetails: 'Task Details',
    department: 'Department',
    speciality: 'Speciality'
  },
  hi: {
    workerDashboard: 'कार्यकर्ता डैशबोर्ड',
    assignedTasks: 'सौंपे गए कार्य',
    pendingTasks: 'लंबित कार्य',
    inProgress: 'प्रगति में',
    completed: 'पूर्ण',
    startTask: 'कार्य प्रारंभ करें',
    navigate: 'नेविगेट करें',
    viewDetails: 'विवरण देखें',
    markComplete: 'पूर्ण के रूप में चिह्नित करें',
    noTasks: 'कोई कार्य नहीं सौंपा गया',
    noTasksDesc: 'नए असाइनमेंट के लिए बाद में जांचें',
    priority: 'प्राथमिकता',
    reportedBy: 'द्वारा रिपोर्ट किया गया',
    location: 'स्थान',
    description: 'विवरण',
    category: 'श्रेणी',
    urgent: 'तत्काल',
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'कम',
    notifications: 'सूचनाएं',
    taskAssigned: 'नया कार्य सौंपा गया',
    welcomeBack: 'वापसी पर स्वागत',
    taskOverview: 'कार्य अवलोकन',
    showMap: 'मानचित्र दिखाएं',
    hideMap: 'मानचित्र छुपाएं',
    morning: 'सुबह',
    afternoon: 'दोपहर',
    evening: 'शाम',
    tasksNearby: 'पास के कार्य',
    yourLocation: 'आपका स्थान',
    taskLocations: 'कार्य स्थान',
    distance: 'दूरी',
    away: 'दूर',
    viewOnMap: 'मानचित्र पर देखें',
    refreshTasks: 'रीफ्रेश करने के लिए खींचें',
    taskStarted: 'कार्य प्रारंभ',
    taskCompleted: 'कार्य पूर्ण',
    taskCompletedMsg: 'कार्य को पूर्ण के रूप में चिह्नित किया गया है',
    taskStartedMsg: 'कार्य को प्रगति में चिह्नित किया गया है',
    confirmStart: 'क्या आप वाकई इस कार्य को शुरू करना चाहते हैं?',
    confirmComplete: 'इस कार्य को पूर्ण के रूप में चिह्नित करें?',
    cancel: 'रद्द करें',
    start: 'प्रारंभ',
    complete: 'पूर्ण',
    error: 'त्रुटि',
    success: 'सफलता',
    taskStatusUpdated: 'कार्य स्थिति सफलतापूर्वक अपडेट की गई',
    failedToUpdateTask: 'कार्य स्थिति अपडेट करने में विफल',
    failedToLoadTasks: 'कार्य लोड करने में विफल',
    permissionDenied: 'अनुमति अस्वीकृत',
    locationPermissionRequired: 'मानचित्र पर आपकी स्थिति दिखाने के लिए स्थान अनुमति आवश्यक है',
    loadingTasks: 'कार्य लोड हो रहे हैं...',
    recentlyCompleted: 'हाल ही में पूर्ण',
    taskDetails: 'कार्य विवरण',
    department: 'विभाग',
    speciality: 'विशेषता'
  },
  bn: {
    workerDashboard: 'কর্মী ড্যাশবোর্ড',
    assignedTasks: 'অর্পিত কাজ',
    pendingTasks: 'অপেক্ষমাণ কাজ',
    inProgress: 'চলমান',
    completed: 'সমাপ্ত',
    startTask: 'কাজ শুরু করুন',
    navigate: 'নেভিগেট করুন',
    viewDetails: 'বিস্তারিত দেখুন',
    markComplete: 'সম্পূর্ণ হিসেবে চিহ্নিত করুন',
    noTasks: 'কোনো কাজ বরাদ্দ নেই',
    noTasksDesc: 'নতুন অ্যাসাইনমেন্টের জন্য পরে চেক করুন',
    priority: 'অগ্রাধিকার',
    reportedBy: 'রিপোর্টকারী',
    location: 'অবস্থান',
    description: 'বিবরণ',
    category: 'বিভাগ',
    urgent: 'জরুরি',
    high: 'উচ্চ',
    medium: 'মাঝারি',
    low: 'কম',
    notifications: 'বিজ্ঞপ্তি',
    taskAssigned: 'নতুন কাজ বরাদ্দ',
    welcomeBack: 'ফিরে আসায় স্বাগতম',
    taskOverview: 'কাজের সংক্ষিপ্ত বিবরণ',
    showMap: 'মানচিত্র দেখান',
    hideMap: 'মানচিত্র লুকান',
    morning: 'সকাল',
    afternoon: 'দুপুর',
    evening: 'সন্ধ্যা',
    tasksNearby: 'কাছাকাছি কাজ',
    yourLocation: 'আপনার অবস্থান',
    taskLocations: 'কাজের অবস্থান',
    distance: 'দূরত্ব',
    away: 'দূরে',
    viewOnMap: 'মানচিত্রে দেখুন',
    refreshTasks: 'রিফ্রেশ করতে টানুন',
    taskStarted: 'কাজ শুরু',
    taskCompleted: 'কাজ সমাপ্ত',
    taskCompletedMsg: 'কাজটি সমাপ্ত হিসেবে চিহ্নিত করা হয়েছে',
    taskStartedMsg: 'কাজটি চলমান হিসেবে চিহ্নিত করা হয়েছে',
    confirmStart: 'আপনি কি সত্যিই এই কাজটি শুরু করতে চান?',
    confirmComplete: 'এই কাজটি সমাপ্ত হিসেবে চিহ্নিত করবেন?',
    cancel: 'বাতিল',
    start: 'শুরু',
    complete: 'সমাপ্ত',
    error: 'ত্রুটি',
    success: 'সফল',
    taskStatusUpdated: 'কাজের স্থিতি সফলভাবে আপডেট করা হয়েছে',
    failedToUpdateTask: 'কাজের স্থিতি আপডেট করতে ব্যর্থ',
    failedToLoadTasks: 'কাজ লোড করতে ব্যর্থ',
    permissionDenied: 'অনুমতি প্রত্যাখ্যাত',
    locationPermissionRequired: 'মানচিত্রে আপনার অবস্থান দেখানোর জন্য অবস্থানের অনুমতি প্রয়োজন',
    loadingTasks: 'কাজ লোড হচ্ছে...',
    recentlyCompleted: 'সম্প্রতি সমাপ্ত',
    taskDetails: 'কাজের বিবরণ',
    department: 'বিভাগ',
    speciality: 'বিশেষত্ব'
  }
};

const { width } = Dimensions.get('window');

// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  location: string;
  latitude: number;
  longitude: number;
  distance: number;
  reported_by: string;
  assigned_at?: string;
}

const WorkerDashboard = () => {
  const { user, session } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [workerLocation, setWorkerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationTracking, setLocationTracking] = useState<Location.LocationSubscription | null>(null);
  const [mapRegion, setMapRegion] = useState<any>({
    latitude: 22.5743,
    longitude: 88.4348,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Task Assigned',
      message: 'A new water supply issue has been assigned to you in Salt Lake Sector V.',
      type: 'task' as const,
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      title: 'Task Reminder',
      message: 'Please complete the pending task in Bidhannagar by end of day.',
      type: 'system' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
  ]);
  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const pendingTasksRef = useRef<View>(null);
  const inProgressTasksRef = useRef<View>(null);
  const completedTasksRef = useRef<View>(null);
  const floatingAnim = useRef(new Animated.Value(0)).current;

  // Uber-like map style
  const uberMapStyle = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#f5f5f5'
        }
      ]
    },
    {
      elementType: 'labels.icon',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#616161'
        }
      ]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#f5f5f5'
        }
      ]
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#bdbdbd'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        {
          color: '#eeeeee'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#757575'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [
        {
          color: '#e5e5e5'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#9e9e9e'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#ffffff'
        }
      ]
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#757575'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#dadada'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#616161'
        }
      ]
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#9e9e9e'
        }
      ]
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [
        {
          color: '#e5e5e5'
        }
      ]
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [
        {
          color: '#eeeeee'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#c9c9c9'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#9e9e9e'
        }
      ]
    }
  ];

  // Stop location tracking function
  const stopLocationTracking = () => {
    if (locationTracking) {
      locationTracking.remove();
      setLocationTracking(null);
    }
  };

  // Translation helper
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key];
  };

  // Notification handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Scroll to section functionality
  const scrollToSection = (sectionRef: React.RefObject<View | null>) => {
    if (sectionRef.current && scrollViewRef.current) {
      sectionRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 20, // Offset for better visibility
            animated: true,
          });
        },
        () => {}
      );
    }
  };

  useEffect(() => {
    fetchUserProfile();
    
    // First get current location, then fetch tasks based on that location
    const initializeData = async () => {
      await startRealTimeLocationTracking();
      await fetchTasks();
    };
    
    initializeData();
    
    // Animate floating notifications
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cleanup location tracking on unmount
    return () => {
      if (locationTracking) {
        locationTracking.remove();
      }
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.log('Profiles table not accessible, using user metadata:', error.message);
        setUserProfile({
          id: user?.id,
          full_name: user?.user_metadata?.full_name || 'Worker',
          role: 'worker',
          department: 'General',
          speciality: 'Maintenance'
        });
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserProfile({
        id: user?.id,
        full_name: user?.user_metadata?.full_name || 'Worker',
        role: 'worker',
        department: 'General',
        speciality: 'Maintenance'
      });
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Use Kolkata Salt Lake Sector V coordinates as base location
      const currentLat = workerLocation?.latitude || 22.5743;
      const currentLng = workerLocation?.longitude || 88.4348;
      
      console.log('Dashboard: Loading Kolkata demo tasks for worker');
      
      // Use comprehensive Kolkata demo data - fully functional for demonstration
      const mockTasks: Task[] = [
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          title: 'Fix Street Light near DLF IT Park',
          description: 'Street light pole #45 on Action Area II is not working. IT employees facing difficulty during late night return.',
          category: 'Street Lighting',
          status: 'pending',
          priority: 'high',
          created_at: new Date().toISOString(),
          location: 'Action Area II, Salt Lake Sector V, Kolkata',
          latitude: 22.5760,
          longitude: 88.4348,
          distance: 0.8,
          reported_by: 'Arjun Mukherjee',
          assigned_at: new Date().toISOString()
        },
        {
          id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          title: 'Water Pipeline Leakage near ISKCON',
          description: 'Major water leakage near ISKCON Temple causing waterlogging. Devotees and residents facing issues.',
          category: 'Water Supply',
          status: 'pending',
          priority: 'urgent',
          created_at: new Date().toISOString(),
          location: 'Near ISKCON Temple, Sector V, Kolkata',
          latitude: 22.5720,
          longitude: 88.4370,
          distance: 1.2,
          reported_by: 'Sita Devi',
          assigned_at: new Date().toISOString()
        },
        {
          id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
          title: 'Garbage Collection Issue at TCS Campus',
          description: 'Garbage has not been collected for 3 days near TCS office complex. Bad smell affecting office environment.',
          category: 'Waste Management',
          status: 'pending',
          priority: 'medium',
          created_at: new Date().toISOString(),
          location: 'TCS Campus, Action Area III, Sector V',
          latitude: 22.5695,
          longitude: 88.4280,
          distance: 1.8,
          reported_by: 'Rajesh Agarwal',
          assigned_at: new Date().toISOString()
        },
        {
          id: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
          title: 'Central Park Maintenance',
          description: 'Regular maintenance and cleaning of the Central Park area near City Centre Mall.',
          category: 'Sanitation',
          status: 'in_progress',
          priority: 'low',
          created_at: new Date().toISOString(),
          location: 'Central Park, Action Area I, Sector V',
          latitude: 22.5785,
          longitude: 88.4320,
          distance: 1.0,
          reported_by: 'KMC Office Sector V',
          assigned_at: new Date().toISOString()
        },
        {
          id: '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
          title: 'Drainage Cleaning near Webel Bhawan',
          description: 'Blocked drainage causing waterlogging during monsoon. Needs immediate attention.',
          category: 'Drainage',
          status: 'completed',
          priority: 'high',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          location: 'Webel Bhawan, Sector V, Kolkata',
          latitude: 22.5740,
          longitude: 88.4310,
          distance: 0.6,
          reported_by: 'Deepak Chatterjee',
          assigned_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setTasks(mockTasks);
      
      // Set map region based on tasks
      if (mockTasks.length > 0) {
        const lats = mockTasks.map(task => task.latitude || currentLat);
        const lngs = mockTasks.map(task => task.longitude || currentLng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        setMapRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(maxLat - minLat, 0.02) * 1.5,
          longitudeDelta: Math.max(maxLng - minLng, 0.02) * 1.5,
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert(t('error'), t('failedToLoadTasks'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionDenied'), t('locationPermissionRequired'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setWorkerLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Set default location to Kolkata Sector V if unable to get current location
      setWorkerLocation({
        latitude: 22.5743,
        longitude: 88.4348,
      });
    }
  };

  // Real-time location tracking like Uber
  const startRealTimeLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        setWorkerLocation({
          latitude: 22.5743,
          longitude: 88.4348,
        });
        return;
      }

      console.log('Dashboard: Starting real-time location tracking');

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setWorkerLocation({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
      });

      // Start watching location changes (like Uber)
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          console.log('Dashboard: Location updated:', location.coords.latitude, location.coords.longitude);
          
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          setWorkerLocation(newLocation);

          // Update map region smoothly
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              ...newLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }

          // Update task distances in real-time
          setTasks(prevTasks => 
            prevTasks.map(task => ({
              ...task,
              distance: calculateDistance(
                newLocation.latitude,
                newLocation.longitude,
                task.latitude,
                task.longitude
              )
            }))
          );
        }
      );

      setLocationTracking(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      // Fallback to Kolkata default
      setWorkerLocation({
        latitude: 22.5743,
        longitude: 88.4348,
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      const statusMessage = newStatus === 'in_progress' ? t('taskStartedMsg') : t('taskCompletedMsg');
      Alert.alert(t('success'), statusMessage);
    } catch (error) {
      Alert.alert(t('error'), t('failedToUpdateTask'));
    }
  };

  const startTask = (task: Task) => {
    Alert.alert(
      t('startTask'),
      t('confirmStart'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('start'), 
          onPress: () => {
            // Update task status to in_progress
            updateTaskStatus(task.id, 'in_progress');
            // Navigate to task navigation screen
            router.push(`/task-navigation/${task.id}`);
          }
        }
      ]
    );
  };

  const completeTask = (task: Task) => {
    Alert.alert(
      t('markComplete'),
      t('confirmComplete'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('complete'), 
          onPress: () => updateTaskStatus(task.id, 'completed')
        }
      ]
    );
  };

  const navigateToTask = (task: Task) => {
    router.push(`/task-navigation/${task.id}`);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#1565C0';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return t('urgent');
      case 'high': return t('high');
      case 'medium': return t('medium');
      case 'low': return t('low');
      default: return priority;
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Real-time greeting function with continuous updates
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute for real-time

    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('morning');
    if (hour < 17) return t('afternoon');
    return t('evening');
  };

  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Floating notification animation
  const floatingTransform = {
    transform: [
      {
        translateY: floatingAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  };

  if (loading || (!user && !session)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FontAwesome name="spinner" size={32} color="#1565C0" />
          <Text style={styles.loadingText}>{t('loadingTasks')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{getTimeOfDay()}</Text>
              <Text style={styles.timeDisplay}>{getFormattedTime()}</Text>
            </View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {userProfile?.full_name || 'Worker'}!</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Notification Bell with Count */}
            <TouchableOpacity style={styles.notificationBell}>
              <FontAwesome name="bell" size={20} color="white" />
              {notifications.filter(n => !n.read).length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>
                    {notifications.filter(n => !n.read).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mapToggle, showMap && styles.mapToggleActive]} 
              onPress={() => setShowMap(!showMap)}
            >
              <FontAwesome name={showMap ? "list" : "map"} size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
            title={t('refreshTasks')}
          />
        }
      >
        {/* Task Summary Cards */}
        <View style={styles.summaryContainer}>
          <TouchableOpacity 
            style={[styles.summaryCard, styles.pendingSummary]}
            onPress={() => scrollToSection(pendingTasksRef)}
            activeOpacity={0.7}
          >
            <FontAwesome name="clock-o" size={24} color="#f97316" />
            <Text style={styles.summaryNumber}>{pendingTasks.length}</Text>
            <Text style={styles.summaryLabel}>{t('pendingTasks')}</Text>
            <Text style={styles.tapHint}>Tap to view</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.summaryCard, styles.progressSummary]}
            onPress={() => scrollToSection(inProgressTasksRef)}
            activeOpacity={0.7}
          >
            <FontAwesome name="cog" size={24} color="#2563eb" />
            <Text style={styles.summaryNumber}>{inProgressTasks.length}</Text>
            <Text style={styles.summaryLabel}>{t('inProgress')}</Text>
            <Text style={styles.tapHint}>Tap to view</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.summaryCard, styles.completedSummary]}
            onPress={() => scrollToSection(completedTasksRef)}
            activeOpacity={0.7}
          >
            <FontAwesome name="check-circle" size={24} color="#059669" />
            <Text style={styles.summaryNumber}>{completedTasks.length}</Text>
            <Text style={styles.summaryLabel}>{t('completed')}</Text>
            <Text style={styles.tapHint}>Tap to view</Text>
          </TouchableOpacity>
        </View>

        {/* Map View */}
        {showMap && (
          <View style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <Text style={styles.sectionTitle}>{t('taskLocations')}</Text>
              <View style={styles.mapControls}>
                <TouchableOpacity 
                  style={styles.mapControlButton}
                  onPress={() => {
                    if (workerLocation && mapRef.current) {
                      mapRef.current.animateToRegion({
                        ...workerLocation,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }, 1000);
                    }
                  }}
                >
                  <FontAwesome name="location-arrow" size={16} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.mapControlButton, locationTracking && styles.trackingActive]}
                  onPress={() => {
                    if (locationTracking) {
                      stopLocationTracking();
                    } else {
                      startRealTimeLocationTracking();
                    }
                  }}
                >
                  <FontAwesome name="crosshairs" size={16} color={locationTracking ? "white" : "#2563eb"} />
                </TouchableOpacity>
              </View>
            </View>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              showsUserLocation={false}
              showsMyLocationButton={false}
              mapType="standard"
              customMapStyle={uberMapStyle}
              showsTraffic={true}
              showsBuildings={true}
              toolbarEnabled={false}
              rotateEnabled={true}
              pitchEnabled={true}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              {/* Task markers with custom styling */}
              {tasks.map((task) => (
                <Marker
                  key={task.id}
                  coordinate={{
                    latitude: task.latitude,
                    longitude: task.longitude,
                  }}
                  title={task.title}
                  description={`${task.category} - ${task.distance.toFixed(1)}km ${t('away')}`}
                  onPress={() => setSelectedTask(task)}
                >
                  <View style={[styles.customMarker, { backgroundColor: getPriorityColor(task.priority) }]}>
                    <FontAwesome name="wrench" size={12} color="white" />
                  </View>
                </Marker>
              ))}
              
              {/* Enhanced Worker location marker */}
              {workerLocation && (
                <Marker
                  coordinate={workerLocation}
                  title={t('yourLocation')}
                  description="You are here"
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.workerMarker}>
                    <View style={styles.workerMarkerInner}>
                      <FontAwesome name="user" size={12} color="white" />
                    </View>
                    <View style={styles.workerMarkerPulse} />
                  </View>
                </Marker>
              )}
            </MapView>
            
            {/* Real-time tracking status */}
            {locationTracking && (
              <View style={styles.trackingIndicator}>
                <View style={styles.trackingDot} />
                <Text style={styles.trackingText}>Live tracking active</Text>
              </View>
            )}
            
            {/* Selected Task Panel */}
            {selectedTask && (
              <View style={styles.selectedTaskPanel}>
                <View style={styles.selectedTaskHeader}>
                  <Text style={styles.selectedTaskTitle}>{selectedTask.title}</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setSelectedTask(null)}
                  >
                    <FontAwesome name="times" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.selectedTaskCategory}>{selectedTask.category}</Text>
                <Text style={styles.selectedTaskDistance}>{selectedTask.distance.toFixed(1)}km away</Text>
                <TouchableOpacity 
                  style={styles.navigateButton}
                  onPress={() => navigateToTask(selectedTask)}
                >
                  <FontAwesome name="compass" size={14} color="white" />
                  <Text style={styles.navigateButtonText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <View ref={pendingTasksRef} style={styles.section}>
            <Text style={styles.sectionTitle}>{t('pendingTasks')}</Text>
            {pendingTasks.map(task => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                    <Text style={styles.priorityText}>{getPriorityText(task.priority).toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskMetaText}>
                    <FontAwesome name="map-marker" size={12} color="#6b7280" /> {task.location}
                  </Text>
                  <Text style={styles.taskMetaText}>
                    <FontAwesome name="user" size={12} color="#6b7280" /> {task.reported_by}
                  </Text>
                  <Text style={styles.taskMetaText}>
                    <FontAwesome name="road" size={12} color="#6b7280" /> {task.distance.toFixed(1)}km {t('away')}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => startTask(task)}
                >
                  <FontAwesome name="play" size={14} color="white" />
                  <Text style={styles.actionButtonText}>{t('startTask')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <View ref={inProgressTasksRef} style={styles.section}>
            <Text style={styles.sectionTitle}>{t('inProgress')}</Text>
            {inProgressTasks.map(task => (
              <View key={task.id} style={[styles.taskCard, styles.inProgressCard]}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.statusText}>{t('inProgress').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskMetaText}>
                    <FontAwesome name="map-marker" size={12} color="#6b7280" /> {task.location}
                  </Text>
                  <Text style={styles.taskMetaText}>
                    <FontAwesome name="user" size={12} color="#6b7280" /> {task.reported_by}
                  </Text>
                </View>
                <View style={styles.taskActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.navigateButton]}
                    onPress={() => navigateToTask(task)}
                  >
                    <FontAwesome name="location-arrow" size={14} color="white" />
                    <Text style={styles.actionButtonText}>{t('navigate')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => completeTask(task)}
                  >
                    <FontAwesome name="check" size={14} color="white" />
                    <Text style={styles.actionButtonText}>{t('markComplete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View ref={completedTasksRef} style={styles.section}>
            <Text style={styles.sectionTitle}>{t('recentlyCompleted')}</Text>
            {completedTasks.map(task => (
              <View key={task.id} style={[styles.taskCard, styles.completedCard]}>
                <View style={styles.taskHeader}>
                  <Text style={[styles.taskTitle, styles.completedText]}>{task.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <FontAwesome name="check-circle" size={12} color="white" />
                    <Text style={styles.statusText}>{t('completed').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={[styles.taskDescription, styles.completedText]}>{task.description}</Text>
                <Text style={[styles.taskMeta, styles.completedText]}>
                  <FontAwesome name="map-marker" size={12} color="#9ca3af" /> {task.location}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* No tasks message */}
        {tasks.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <FontAwesome name="clipboard" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>{t('noTasks')}</Text>
            <Text style={styles.emptyDescription}>{t('noTasksDesc')}</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc', // Softer background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2563eb', // Modern blue
    fontWeight: '500',
  },
  floatingCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Header Styles
  header: {
    backgroundColor: '#2563eb', // Modern government blue
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeDisplay: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0f2fe', // Softer accent
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mapToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapToggleActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  department: {
    fontSize: 14,
    color: '#bbdefb',
    fontWeight: '500',
  },
  // Content Styles
  content: {
    flex: 1,
    padding: 16,
  },
  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  pendingSummary: {
    borderLeftWidth: 4,
    borderLeftColor: '#f97316', // Indian saffron inspired
  },
  progressSummary: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb', // Updated blue
  },
  completedSummary: {
    borderLeftWidth: 4,
    borderLeftColor: '#059669', // Indian green inspired
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '400',
    textAlign: 'center',
  },
  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  // Task Card Styles
  taskCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  inProgressCard: {
    borderLeftColor: '#1565C0',
    backgroundColor: '#f8f9ff',
  },
  completedCard: {
    opacity: 0.7,
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  completedText: {
    color: '#64748b',
  },
  taskDescription: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 22,
  },
  taskMeta: {
    marginBottom: 16,
    gap: 8,
  },
  taskMetaText: {
    fontSize: 13,
    color: '#6b7280',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Badge Styles
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  // Action Button Styles
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  startButton: {
    backgroundColor: '#1565C0',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  navigateButton: {
    backgroundColor: '#1565C0',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Map Styles
  mapContainer: {
    marginBottom: 24,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapControls: {
    flexDirection: 'row',
    gap: 8,
  },
  mapControlButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingActive: {
    backgroundColor: '#2563eb',
  },
  map: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  workerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerMarkerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    zIndex: 1,
  },
  workerMarkerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    opacity: 0.7,
  },
  trackingIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  trackingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedTaskPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  selectedTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTaskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  selectedTaskCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedTaskDistance: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  navigateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});

export default WorkerDashboard;
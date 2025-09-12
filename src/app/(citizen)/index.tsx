import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

// Translations for Citizen Home Screen
const translations = {
  en: {
    home: 'CiviSamadhan',
    localProblems: 'Local Problems',
    nearbyIssues: 'Nearby Issues',
    upvote: 'Upvote',
    downvote: 'Downvote',
    reportNew: 'Report New Issue',
    viewOnMap: 'View on Map',
    votes: 'votes',
    reported: 'Reported',
    ago: 'ago',
    loading: 'Loading nearby issues...',
    noIssues: 'No issues found nearby',
    refreshing: 'Refreshing...',
    heatmap: 'Problem Heatmap',
    listView: 'List View',
    mapView: 'Map View',
    priority: {
      low: 'Low',
      medium: 'Medium', 
      high: 'High',
      urgent: 'Urgent'
    }
  },
  hi: {
    home: 'सिविसमाधान',
    localProblems: 'स्थानीय समस्याएं',
    nearbyIssues: 'आसपास की समस्याएं',
    upvote: 'समर्थन',
    downvote: 'विरोध',
    reportNew: 'नई समस्या रिपोर्ट करें',
    viewOnMap: 'नक्शे पर देखें',
    votes: 'वोट',
    reported: 'रिपोर्ट किया गया',
    ago: 'पहले',
    loading: 'आसपास की समस्याएं लोड हो रही हैं...',
    noIssues: 'आसपास कोई समस्या नहीं मिली',
    refreshing: 'रीफ्रेश हो रहा है...',
    heatmap: 'समस्या हीटमैप',
    listView: 'सूची दृश्य',
    mapView: 'नक्शा दृश्य',
    priority: {
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च', 
      urgent: 'तत्काल'
    }
  }
};

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
  citizen_name: string;
  created_at: string;
  votes: number;
  user_vote: number | null; // -1, 0, 1
}

export default function CitizenHome() {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    loadLocation();
    loadNearbyIssues();
  }, []);

  const loadLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadNearbyIssues = async () => {
    try {
      // Load demo issues for now - replace with real Supabase query later
      const demoIssues: Issue[] = [
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          title: 'Street Light Not Working',
          description: 'Street light near DLF IT Park has been broken for 2 days',
          category: 'Street Lighting',
          priority: 'high',
          status: 'pending',
          latitude: 22.5760,
          longitude: 88.4348,
          address: 'Action Area II, Salt Lake Sector V',
          citizen_name: 'Arjun M.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          votes: 15,
          user_vote: null
        },
        {
          id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          title: 'Water Leakage',
          description: 'Major water pipeline leakage causing road flooding',
          category: 'Water Supply',
          priority: 'urgent',
          status: 'pending',
          latitude: 22.5720,
          longitude: 88.4370,
          address: 'Near ISKCON Temple, Sector V',
          citizen_name: 'Sita D.',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          votes: 23,
          user_vote: 1
        },
        {
          id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
          title: 'Garbage Collection Issue',
          description: 'Garbage not collected for 3 days in TCS Campus area',
          category: 'Waste Management',
          priority: 'medium',
          status: 'pending',
          latitude: 22.5695,
          longitude: 88.4280,
          address: 'TCS Campus, Action Area III',
          citizen_name: 'Rajesh A.',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          votes: 8,
          user_vote: null
        }
      ];

      setIssues(demoIssues);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVote = (issueId: string, voteType: number) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => {
        if (issue.id === issueId) {
          const oldVote = issue.user_vote || 0;
          const newVote = issue.user_vote === voteType ? 0 : voteType;
          const voteChange = newVote - oldVote;
          
          return {
            ...issue,
            votes: issue.votes + voteChange,
            user_vote: newVote
          };
        }
        return issue;
      })
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNearbyIssues();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ${t.ago}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ${t.ago}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ${t.ago}`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFAA00';
      case 'low': return '#00AA00';
      default: return '#666666';
    }
  };

  const renderIssueCard = (issue: Issue) => (
    <View key={issue.id} style={styles.issueCard}>
      <View style={styles.issueHeader}>
        <View style={styles.issueInfo}>
          <Text style={styles.issueTitle}>{issue.title}</Text>
          <Text style={styles.issueLocation}>{issue.address}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
          <Text style={styles.priorityText}>{t.priority[issue.priority as keyof typeof t.priority]}</Text>
        </View>
      </View>
      
      <Text style={styles.issueDescription} numberOfLines={2}>
        {issue.description}
      </Text>
      
      <View style={styles.issueFooter}>
        <Text style={styles.issueDate}>
          {formatTimeAgo(issue.created_at)} • {issue.citizen_name}
        </Text>
        
        <View style={styles.voteContainer}>
          <TouchableOpacity 
            style={[styles.voteButton, issue.user_vote === 1 && styles.voteButtonActive]}
            onPress={() => handleVote(issue.id, 1)}
          >
            <Ionicons name="arrow-up" size={16} color={issue.user_vote === 1 ? 'white' : theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.voteCount}>{issue.votes}</Text>
          
          <TouchableOpacity 
            style={[styles.voteButton, issue.user_vote === -1 && styles.voteButtonActive]}
            onPress={() => handleVote(issue.id, -1)}
          >
            <Ionicons name="arrow-down" size={16} color={issue.user_vote === -1 ? 'white' : theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation?.coords.latitude || 22.5726,
          longitude: currentLocation?.coords.longitude || 88.3639,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {issues.map(issue => (
          <Marker
            key={issue.id}
            coordinate={{
              latitude: issue.latitude,
              longitude: issue.longitude,
            }}
            title={issue.title}
            description={issue.description}
            pinColor={getPriorityColor(issue.priority)}
          />
        ))}
      </MapView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.home}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? 'white' : theme.colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'map' && styles.viewToggleActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons name="map" size={20} color={viewMode === 'map' ? 'white' : theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'list' ? (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.nearbyIssues}</Text>
            {issues.length > 0 ? (
              issues.map(renderIssueCard)
            ) : (
              <Text style={styles.noIssuesText}>{t.noIssues}</Text>
            )}
          </View>
        </ScrollView>
      ) : (
        renderMapView()
      )}

      {/* Floating Action Button for Reporting New Issue */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/(citizen)/report')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewToggleActive: {
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  issueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueInfo: {
    flex: 1,
    marginRight: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  issueLocation: {
    fontSize: 12,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  issueDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueDate: {
    fontSize: 12,
    color: '#666',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteButton: {
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    minWidth: 32,
    alignItems: 'center',
  },
  voteButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  noIssuesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
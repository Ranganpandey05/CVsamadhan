import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  location: string;
  category: string;
}

const CitizenHomeScreen = () => {
  const { user, session } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Don't redirect here, let the root layout handle it

  useEffect(() => {
    fetchUserProfile();
    fetchReports();
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
        // Fallback to user metadata
        setUserProfile({
          id: user?.id,
          full_name: user?.user_metadata?.full_name || 'Citizen',
          role: 'citizen'
        });
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to user metadata
      setUserProfile({
        id: user?.id,
        full_name: user?.user_metadata?.full_name || 'Citizen',
        role: 'citizen'
      });
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      // For now, we'll create mock reports. In a real app, these would come from your database
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Broken Street Light',
          description: 'Street light on Main Street is not working, making it unsafe at night',
          status: 'in_progress',
          priority: 'high',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Main Street, Block A',
          category: 'Infrastructure'
        },
        {
          id: '2',
          title: 'Garbage Collection Issue',
          description: 'Garbage has not been collected for 3 days in our area',
          status: 'pending',
          priority: 'medium',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Residential Block B',
          category: 'Sanitation'
        },
        {
          id: '3',
          title: 'Water Leakage',
          description: 'Water is leaking from the main pipeline near the park',
          status: 'resolved',
          priority: 'high',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Central Park Area',
          category: 'Utilities'
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const pendingReports = reports.filter(report => report.status === 'pending');
  const inProgressReports = reports.filter(report => report.status === 'in_progress');
  const resolvedReports = reports.filter(report => report.status === 'resolved');

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  if (loading || (!user && !session)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading your reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.title}>Welcome Home</Text>
            <Text style={styles.subtitle}>Hello, {userProfile?.full_name || 'Citizen'}!</Text>
          </View>
          <View style={styles.headerIcon}>
            <FontAwesome name="home" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
        <Text style={styles.description}>Track your reports and stay updated on community issues</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingReports.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{inProgressReports.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{resolvedReports.length}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="plus" size={20} color="#3b82f6" />
              <Text style={styles.actionButtonText}>New Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="bell" size={20} color="#3b82f6" />
              <Text style={styles.actionButtonText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="group" size={20} color="#3b82f6" />
              <Text style={styles.actionButtonText}>Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Recent Reports</Text>
          {reports.slice(0, 3).map(report => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                  <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.reportDescription}>{report.description}</Text>
              <View style={styles.reportFooter}>
                <Text style={styles.reportLocation}>
                  <FontAwesome name="map-marker" size={12} color="#6b7280" /> {report.location}
                </Text>
                <Text style={styles.reportCategory}>{report.category}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Community Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Updates</Text>
          <View style={styles.updateCard}>
            <FontAwesome name="info-circle" size={20} color="#3b82f6" />
            <View style={styles.updateContent}>
              <Text style={styles.updateTitle}>Street Cleaning Scheduled</Text>
              <Text style={styles.updateDescription}>Main Street will be cleaned tomorrow from 8 AM to 12 PM</Text>
            </View>
          </View>
          <View style={styles.updateCard}>
            <FontAwesome name="check-circle" size={20} color="#10b981" />
            <View style={styles.updateContent}>
              <Text style={styles.updateTitle}>Water Issue Resolved</Text>
              <Text style={styles.updateDescription}>The water leakage near Central Park has been fixed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#c7d2fe',
    lineHeight: 20,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  reportCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportLocation: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  reportCategory: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  updateCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateContent: {
    flex: 1,
    marginLeft: 12,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  updateDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
});

export default CitizenHomeScreen;
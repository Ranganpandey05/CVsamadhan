import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  location: string;
}

const WorkerDashboard = () => {
  const { user, session } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Don't redirect here, let the root layout handle it

  useEffect(() => {
    fetchUserProfile();
    fetchTasks();
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
      // Fallback to user metadata
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
      // For now, we'll create mock tasks. In a real app, these would come from your database
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Fix Street Light on Main St',
          description: 'Street light is not working properly, needs immediate attention',
          status: 'pending',
          priority: 'high',
          created_at: new Date().toISOString(),
          location: 'Main Street, Block A'
        },
        {
          id: '2',
          title: 'Clean Public Park',
          description: 'Regular maintenance and cleaning of the community park',
          status: 'in_progress',
          priority: 'medium',
          created_at: new Date().toISOString(),
          location: 'Central Park'
        },
        {
          id: '3',
          title: 'Repair Water Pipeline',
          description: 'Water leakage reported in residential area',
          status: 'pending',
          priority: 'high',
          created_at: new Date().toISOString(),
          location: 'Residential Block B'
        }
      ];
      
      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      // In a real app, this would update the database
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      Alert.alert('Success', 'Task status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

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
          <Text>Loading tasks...</Text>
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
            <Text style={styles.title}>Worker Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {userProfile?.full_name || 'Worker'}!</Text>
          </View>
          <View style={styles.headerIcon}>
            <FontAwesome name="wrench" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
        <Text style={styles.department}>{userProfile?.department} - {userProfile?.speciality}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Task Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{pendingTasks.length}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{inProgressTasks.length}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{completedTasks.length}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        {/* Pending Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Tasks</Text>
          {pendingTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskLocation}>
                <FontAwesome name="map-marker" size={12} color="#6b7280" /> {task.location}
              </Text>
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => updateTaskStatus(task.id, 'in_progress')}
              >
                <Text style={styles.statusButtonText}>Start Task</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* In Progress Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In Progress</Text>
          {inProgressTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskLocation}>
                <FontAwesome name="map-marker" size={12} color="#6b7280" /> {task.location}
              </Text>
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: '#10b981' }]}
                onPress={() => updateTaskStatus(task.id, 'completed')}
              >
                <Text style={styles.statusButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Completed Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Completed</Text>
          {completedTasks.map(task => (
            <View key={task.id} style={[styles.taskCard, styles.completedCard]}>
              <View style={styles.taskHeader}>
                <Text style={[styles.taskTitle, styles.completedText]}>{task.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.statusText}>COMPLETED</Text>
                </View>
              </View>
              <Text style={[styles.taskDescription, styles.completedText]}>{task.description}</Text>
              <Text style={[styles.taskLocation, styles.completedText]}>
                <FontAwesome name="map-marker" size={12} color="#6b7280" /> {task.location}
              </Text>
            </View>
          ))}
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
    backgroundColor: '#64748b',
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
    color: '#e2e8f0',
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
  department: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
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
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  taskCard: {
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
  completedCard: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    color: '#64748b',
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  taskLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
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
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default WorkerDashboard;
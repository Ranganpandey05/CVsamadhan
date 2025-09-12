import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from './src/context/AuthContext';

export default function DebugStatusScreen() {
  const { profile, refreshProfile, forceRefreshProfile } = useAuth();

  const handleRefreshProfile = async () => {
    try {
      console.log('🔄 Starting refresh profile...');
      await refreshProfile();
      Alert.alert('Success', 'Profile refreshed (normal)');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      Alert.alert('Error', 'Failed to refresh profile');
    }
  };

  const handleForceRefreshProfile = async () => {
    try {
      console.log('🔄 Starting FORCE refresh profile...');
      await forceRefreshProfile();
      Alert.alert('Success', 'Profile force refreshed');
    } catch (error) {
      console.error('Error force refreshing profile:', error);
      Alert.alert('Error', 'Failed to force refresh profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Worker Status</Text>
      
      <View style={styles.profileInfo}>
        <Text style={styles.label}>Current Profile Data:</Text>
        <Text style={styles.text}>Role: {profile?.role || 'N/A'}</Text>
        <Text style={styles.text}>Approval Status: {profile?.approval_status || 'N/A'}</Text>
        <Text style={styles.text}>Email: {profile?.email || 'N/A'}</Text>
        <Text style={styles.text}>Full Name: {profile?.full_name || 'N/A'}</Text>
        <Text style={styles.text}>ID: {profile?.id || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRefreshProfile}>
        <Text style={styles.buttonText}>Refresh Profile (Normal)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.forceButton]} onPress={handleForceRefreshProfile}>
        <Text style={styles.buttonText}>Force Refresh Profile</Text>
      </TouchableOpacity>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Debug Instructions:</Text>
        <Text style={styles.instructionText}>1. First run FIX_WORKER_APPROVAL.sql in Supabase</Text>
        <Text style={styles.instructionText}>2. Use "Force Refresh Profile" to bypass cache</Text>
        <Text style={styles.instructionText}>3. Check console logs for detailed status info</Text>
        <Text style={styles.instructionText}>4. If still showing 'pending', there's a database issue</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  forceButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 5,
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { supabase, signOut } from '../../../lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ProfileScreen = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Try to fetch from profiles table first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.log('Profiles table not accessible, using user metadata:', error.message);
        // Fallback to user metadata if profiles table is not accessible
        setUserProfile({
          id: user?.id,
          full_name: user?.user_metadata?.full_name || 'User',
          username: user?.user_metadata?.username || 'Not provided',
          phone_number: user?.user_metadata?.phone_number || 'Not provided',
          role: 'citizen', // Default role
          department: null,
          speciality: null,
          status: 'approved'
        });
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to user metadata
      setUserProfile({
        id: user?.id,
        full_name: user?.user_metadata?.full_name || 'User',
        username: user?.user_metadata?.username || 'Not provided',
        phone_number: user?.user_metadata?.phone_number || 'Not provided',
        role: 'citizen', // Default role
        department: null,
        speciality: null,
        status: 'approved'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting sign out process...');
              const { error } = await signOut();
              if (error) {
                console.error('Sign out error:', error);
                Alert.alert('Error', 'Failed to sign out. Please try again.');
              } else {
                console.log('Sign out successful, should redirect to login');
                // The AuthContext should handle the redirect automatically
              }
            } catch (error) {
              console.error('Sign out exception:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'worker': return '#64748b';
      case 'citizen': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Government App Header */}
        <View style={[styles.header, { backgroundColor: getRoleColor(userProfile?.role || 'citizen') }]}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <FontAwesome name="user" size={32} color="white" />
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile?.full_name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <FontAwesome name={userProfile?.role === 'worker' ? 'wrench' : 'user'} size={12} color="white" />
                <Text style={styles.roleText}>{userProfile?.role?.toUpperCase() || 'CITIZEN'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <FontAwesome name="user" size={16} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{userProfile?.full_name || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <FontAwesome name="at" size={16} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{userProfile?.username || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <FontAwesome name="phone" size={16} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{userProfile?.phone_number || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <FontAwesome name="calendar" size={16} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Worker Specific Information */}
        {userProfile?.role === 'worker' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <FontAwesome name="building" size={16} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>{userProfile?.department || 'Not assigned'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <FontAwesome name="wrench" size={16} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Speciality</Text>
                  <Text style={styles.infoValue}>{userProfile?.speciality || 'Not specified'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <FontAwesome name="check-circle" size={16} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(userProfile?.status) }]}>
                    <Text style={styles.statusText}>{userProfile?.status?.toUpperCase() || 'PENDING'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="edit" size={16} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
            <FontAwesome name="chevron-right" size={14} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="cog" size={16} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Settings</Text>
            <FontAwesome name="chevron-right" size={14} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="question-circle" size={16} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
            <FontAwesome name="chevron-right" size={14} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={16} color="white" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
    fontWeight: '500',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  actionButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
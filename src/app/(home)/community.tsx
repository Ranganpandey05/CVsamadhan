import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
  department?: string;
}

const CommunityScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchMessages();
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
          full_name: user?.user_metadata?.full_name || 'User',
          role: 'citizen',
          department: null
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
        role: 'citizen',
        department: null
      });
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // For now, we'll create mock messages. In a real app, these would come from your database
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Good morning team! Ready for another productive day.',
          sender_name: 'John Smith',
          sender_role: 'worker',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          department: 'Sanitation'
        },
        {
          id: '2',
          content: 'The street cleaning on Main St is complete. Moving to Park Avenue next.',
          sender_name: 'Sarah Johnson',
          sender_role: 'worker',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          department: 'Sanitation'
        },
        {
          id: '3',
          content: 'Anyone available to help with the water pipeline repair? Need extra hands.',
          sender_name: 'Mike Wilson',
          sender_role: 'worker',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          department: 'Utilities'
        },
        {
          id: '4',
          content: 'Great work on the park maintenance yesterday! The community is very happy.',
          sender_name: 'Lisa Brown',
          sender_role: 'citizen',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        }
      ];
      
      setMessages(mockMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_name: userProfile?.full_name || 'Anonymous',
        sender_role: userProfile?.role || 'citizen',
        created_at: new Date().toISOString(),
        department: userProfile?.department
      };

      setMessages(prev => [message, ...prev]);
      setNewMessage('');
      
      // In a real app, this would save to the database
      Alert.alert('Success', 'Message sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'worker': return '#64748b';
      case 'citizen': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'worker': return 'wrench';
      case 'citizen': return 'user';
      default: return 'user';
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading community messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Connect with fellow workers and citizens</Text>
          </View>
          <View style={styles.headerIcon}>
            <FontAwesome name="group" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View key={message.id} style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={styles.senderInfo}>
                <View style={[styles.roleIcon, { backgroundColor: getRoleColor(message.sender_role) }]}>
                  <FontAwesome name={getRoleIcon(message.sender_role)} size={12} color="white" />
                </View>
                <View>
                  <Text style={styles.senderName}>{message.sender_name}</Text>
                  <View style={styles.senderDetails}>
                    <Text style={[styles.roleText, { color: getRoleColor(message.sender_role) }]}>
                      {message.sender_role.toUpperCase()}
                    </Text>
                    {message.department && (
                      <>
                        <Text style={styles.separator}>•</Text>
                        <Text style={styles.departmentText}>{message.department}</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
              <Text style={styles.timestamp}>{formatTime(message.created_at)}</Text>
            </View>
            <Text style={styles.messageContent}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <FontAwesome name="send" size={16} color="white" />
        </TouchableOpacity>
      </View>
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
  },
  welcomeSection: {
    flex: 1,
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
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
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
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  senderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    fontSize: 11,
    color: '#94a3b8',
    marginHorizontal: 4,
  },
  departmentText: {
    fontSize: 11,
    color: '#64748b',
  },
  timestamp: {
    fontSize: 11,
    color: '#94a3b8',
  },
  messageContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#64748b',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityScreen;
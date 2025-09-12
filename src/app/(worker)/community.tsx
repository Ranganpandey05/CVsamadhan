import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string;
  created_at: string;
  type: 'message' | 'help_request' | 'progress_report' | 'system';
  is_urgent?: boolean;
}

const WorkerCommunityScreen = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const translations = {
    en: {
      community: 'Worker Community',
      connectMessage: 'Real-time communication with fellow workers',
      typeMessage: 'Type your message...',
      send: 'Send',
      messagesSent: 'Message sent successfully',
      teamUpdates: 'Team Chat',
      quickActions: 'Quick Actions',
      requestHelp: 'Request Help',
      reportProgress: 'Report Progress',
      onlineWorkers: 'Online Workers',
      urgent: 'URGENT',
      helpRequest: 'HELP REQUEST',
      progressReport: 'PROGRESS',
      systemMessage: 'SYSTEM',
      justNow: 'Just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      pullToRefresh: 'Pull to refresh'
    },
    hi: {
      community: 'कार्यकर्ता समुदाय',
      connectMessage: 'साथी कार्यकर्ताओं के साथ वास्तविक समय संचार',
      typeMessage: 'अपना संदेश टाइप करें...',
      send: 'भेजें',
      messagesSent: 'संदेश सफलतापूर्वक भेजा गया',
      teamUpdates: 'टीम चैट',
      quickActions: 'त्वरित कार्य',
      requestHelp: 'सहायता का अनुरोध',
      reportProgress: 'प्रगति रिपोर्ट',
      onlineWorkers: 'ऑनलाइन कार्यकर्ता',
      urgent: 'तत्काल',
      helpRequest: 'सहायता अनुरोध',
      progressReport: 'प्रगति',
      systemMessage: 'सिस्टम',
      justNow: 'अभी',
      minutesAgo: 'मिनट पहले',
      hoursAgo: 'घंटे पहले',
      pullToRefresh: 'रीफ्रेश करने के लिए खींचें'
    },
    bn: {
      community: 'কর্মী কমিউনিটি',
      connectMessage: 'সহকর্মীদের সাথে রিয়েল-টাইম যোগাযোগ',
      typeMessage: 'আপনার বার্তা টাইপ করুন...',
      send: 'পাঠান',
      messagesSent: 'বার্তা সফলভাবে পাঠানো হয়েছে',
      teamUpdates: 'টিম চ্যাট',
      quickActions: 'দ্রুত কার্যক্রম',
      requestHelp: 'সাহায্যের অনুরোধ',
      reportProgress: 'অগ্রগতি রিপোর্ট',
      onlineWorkers: 'অনলাইন কর্মীরা',
      urgent: 'জরুরি',
      helpRequest: 'সাহায্যের অনুরোধ',
      progressReport: 'অগ্রগতি',
      systemMessage: 'সিস্টেম',
      justNow: 'এখনই',
      minutesAgo: 'মিনিট আগে',
      hoursAgo: 'ঘন্টা আগে',
      pullToRefresh: 'রিফ্রেশ করতে টানুন'
    }
  };

  // Translation helper
  const t = (key: keyof typeof translations.en): string => {
    try {
      return translations[language as keyof typeof translations]?.[key] || translations.en[key];
    } catch (error) {
      return translations.en[key] || key;
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    const cleanup = setupRealtimeSubscription();
    updateUserOnlineStatus(true);

    // Update online status every minute
    const onlineStatusInterval = setInterval(() => {
      updateUserOnlineStatus(true);
    }, 60000);

    // Fetch online users every 30 seconds
    const onlineUsersInterval = setInterval(() => {
      fetchOnlineUsers();
    }, 30000);

    return () => {
      updateUserOnlineStatus(false);
      cleanup();
      clearInterval(onlineStatusInterval);
      clearInterval(onlineUsersInterval);
    };
  }, []);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('community_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_presence' },
        (payload) => {
          fetchOnlineUsers();
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_presence' },
        (payload) => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles:sender_id (
            full_name
          )
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data) {
        const formattedMessages = data.map((msg: any) => ({
          ...msg,
          sender_name: msg.profiles?.full_name || 'Unknown Worker'
        }));
        setMessages(formattedMessages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, profiles:user_id(full_name)')
        .eq('is_online', true)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutes

      if (!error && data) {
        const userNames = data.map((item: any) => item.profiles?.full_name || 'Unknown').filter(name => name !== 'Unknown');
        setOnlineUsers(userNames);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const updateUserOnlineStatus = async (isOnline: boolean) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const sendMessage = async (messageType: 'message' | 'help_request' | 'progress_report' = 'message') => {
    if (!newMessage.trim() && messageType === 'message') return;
    if (!user?.id) return;

    try {
      let content = newMessage.trim();
      
      if (messageType === 'help_request') {
        content = `🚨 HELP REQUEST: ${content || 'Need immediate assistance with current task'}`;
      } else if (messageType === 'progress_report') {
        content = `✅ PROGRESS UPDATE: ${content || 'Task completed successfully'}`;
      }

      const { error } = await supabase
        .from('community_messages')
        .insert({
          content,
          sender_id: user.id,
          type: messageType,
          is_urgent: messageType === 'help_request',
          created_at: new Date().toISOString()
        });

      if (!error) {
        setNewMessage('');
        if (messageType !== 'message') {
          Alert.alert('Success', t('messagesSent'));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const formatTime = (timestamp: string): string => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return t('justNow');
    if (diffMinutes < 60) return `${diffMinutes} ${t('minutesAgo')}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    
    return messageTime.toLocaleDateString();
  };

  const getMessageTypeColor = (type: string, isUrgent?: boolean) => {
    if (isUrgent) return '#dc2626';
    switch (type) {
      case 'help_request': return '#ef4444';
      case 'progress_report': return '#22c55e';
      case 'system': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'help_request': return 'exclamation-triangle';
      case 'progress_report': return 'check-circle';
      case 'system': return 'info-circle';
      default: return 'comment';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    await fetchOnlineUsers();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{t('community')}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{onlineUsers.length} online</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{t('connectMessage')}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => {
              Alert.prompt(
                t('requestHelp'),
                'Describe what help you need:',
                (text) => sendMessage('help_request')
              );
            }}
          >
            <FontAwesome name="hand-paper-o" size={16} color="white" />
            <Text style={styles.quickActionText}>{t('requestHelp')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#22c55e' }]}
            onPress={() => {
              Alert.prompt(
                t('reportProgress'),
                'Describe your progress:',
                (text) => sendMessage('progress_report')
              );
            }}
          >
            <FontAwesome name="check-circle" size={16} color="white" />
            <Text style={styles.quickActionText}>{t('reportProgress')}</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((message) => (
            <View key={message.id} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={styles.messageTypeContainer}>
                  <FontAwesome 
                    name={getMessageTypeIcon(message.type)} 
                    size={14} 
                    color={getMessageTypeColor(message.type, message.is_urgent)} 
                  />
                  {message.is_urgent && (
                    <Text style={[styles.urgentBadge]}>{t('urgent')}</Text>
                  )}
                </View>
                <Text style={styles.messageTime}>{formatTime(message.created_at)}</Text>
              </View>
              
              <Text style={[
                styles.messageContent,
                message.is_urgent && styles.urgentMessage
              ]}>
                {message.content}
              </Text>
              
              <View style={styles.messageSender}>
                <FontAwesome name="user" size={10} color="#666" />
                <Text style={styles.senderName}>{message.sender_name}</Text>
                {message.sender_id === user?.id && (
                  <Text style={styles.youLabel}> (You)</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={t('typeMessage')}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!newMessage.trim()}
          >
            <FontAwesome name="send" size={16} color={newMessage.trim() ? "white" : "#999"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1565C0',
    padding: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 5,
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  urgentMessage: {
    color: '#dc2626',
    fontWeight: '500',
  },
  messageSender: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderName: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  youLabel: {
    fontSize: 11,
    color: '#1565C0',
    fontWeight: 'bold',
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 10,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#1565C0',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});

export default WorkerCommunityScreen;
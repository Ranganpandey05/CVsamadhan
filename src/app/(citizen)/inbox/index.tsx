import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Translations for Citizen Inbox Screen
const translations = {
  en: {
    inbox: 'Notifications',
    subtitle: 'Stay updated with your reports and community news',
    loadingNotifications: 'Loading notifications...',
    noNotifications: 'No notifications yet',
    noNotificationsDesc: 'Your notifications will appear here',
    markAllRead: 'Mark All Read',
    reportUpdate: 'Report Update',
    systemNotification: 'System Notification',
    communityUpdate: 'Community Update',
    taskAssigned: 'Task Assigned',
    reportResolved: 'Report Resolved',
    reportInProgress: 'Report In Progress',
    reportReceived: 'Report Received',
    newMessage: 'New Message',
    emergency: 'Emergency Alert',
    maintenance: 'Maintenance Notice',
    general: 'General Notice',
    justNow: 'Just now',
    minute: 'minute',
    minutes: 'minutes',
    hour: 'hour',
    hours: 'hours',
    day: 'day',
    days: 'days',
    ago: 'ago',
    pullToRefresh: 'Pull to refresh',
    refreshing: 'Refreshing...',
    unread: 'unread',
    read: 'read'
  },
  hi: {
    inbox: 'सूचनाएं',
    subtitle: 'अपनी रिपोर्ट और समुदायिक समाचारों से अपडेट रहें',
    loadingNotifications: 'सूचनाएं लोड हो रही हैं...',
    noNotifications: 'अभी तक कोई सूचना नहीं',
    noNotificationsDesc: 'आपकी सूचनाएं यहां दिखाई देंगी',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    reportUpdate: 'रिपोर्ट अपडेट',
    systemNotification: 'सिस्टम सूचना',
    communityUpdate: 'समुदायिक अपडेट',
    taskAssigned: 'कार्य सौंपा गया',
    reportResolved: 'रिपोर्ट हल हो गई',
    reportInProgress: 'रिपोर्ट प्रगति में',
    reportReceived: 'रिपोर्ट प्राप्त',
    newMessage: 'नया संदेश',
    emergency: 'आपातकालीन चेतावनी',
    maintenance: 'रखरखाव सूचना',
    general: 'सामान्य सूचना',
    justNow: 'अभी',
    minute: 'मिनट',
    minutes: 'मिनट',
    hour: 'घंटा',
    hours: 'घंटे',
    day: 'दिन',
    days: 'दिन',
    ago: 'पहले',
    pullToRefresh: 'रिफ्रेश करने के लिए खींचें',
    refreshing: 'रिफ्रेश हो रहा है...',
    unread: 'अपठित',
    read: 'पढ़ा हुआ'
  },
  bn: {
    inbox: 'বিজ্ঞপ্তি',
    subtitle: 'আপনার রিপোর্ট এবং কমিউনিটি সংবাদ নিয়ে আপডেট থাকুন',
    loadingNotifications: 'বিজ্ঞপ্তি লোড হচ্ছে...',
    noNotifications: 'এখনো কোন বিজ্ঞপ্তি নেই',
    noNotificationsDesc: 'আপনার বিজ্ঞপ্তি এখানে দেখা যাবে',
    markAllRead: 'সব পড়া হিসেবে চিহ্নিত করুন',
    reportUpdate: 'রিপোর্ট আপডেট',
    systemNotification: 'সিস্টেম বিজ্ঞপ্তি',
    communityUpdate: 'কমিউনিটি আপডেট',
    taskAssigned: 'কাজ বরাদ্দ',
    reportResolved: 'রিপোর্ট সমাধান',
    reportInProgress: 'রিপোর্ট চলমান',
    reportReceived: 'রিপোর্ট প্রাপ্ত',
    newMessage: 'নতুন বার্তা',
    emergency: 'জরুরি সতর্কতা',
    maintenance: 'রক্ষণাবেক্ষণ বিজ্ঞপ্তি',
    general: 'সাধারণ বিজ্ঞপ্তি',
    justNow: 'এখনই',
    minute: 'মিনিট',
    minutes: 'মিনিট',
    hour: 'ঘন্টা',
    hours: 'ঘন্টা',
    day: 'দিন',
    days: 'দিন',
    ago: 'আগে',
    pullToRefresh: 'রিফ্রেশ করতে টানুন',
    refreshing: 'রিফ্রেশ হচ্ছে...',
    unread: 'অপঠিত',
    read: 'পঠিত'
  }
};

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'report_update' | 'system' | 'community' | 'task' | 'emergency' | 'maintenance' | 'general';
  created_at: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_required?: boolean;
  related_id?: string;
}

const CitizenInboxScreen = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Translation helper
  const t = (key: keyof typeof translations.en): string => {
    return translations[language as keyof typeof translations]?.[key] || translations.en[key];
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock notifications for citizen
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Report Status Update',
          content: 'Your street lighting report has been assigned to our maintenance team. Expected resolution: 2-3 days.',
          type: 'report_update',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          action_required: false,
          related_id: 'report_123'
        },
        {
          id: '2',
          title: 'Water Supply Maintenance',
          content: 'Scheduled water supply maintenance in your area tomorrow from 10 AM to 2 PM. Please store water accordingly.',
          type: 'maintenance',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'high',
          action_required: true
        },
        {
          id: '3',
          title: 'Community Achievement',
          content: 'Great news! Our community has achieved 90% waste segregation compliance this month. Thank you for your participation!',
          type: 'community',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low'
        },
        {
          id: '4',
          title: 'Report Resolved',
          content: 'Your pothole report on Park Avenue has been successfully resolved. Thank you for helping improve our community!',
          type: 'report_update',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          related_id: 'report_98'
        },
        {
          id: '5',
          title: 'Emergency Alert',
          content: 'Heavy rainfall expected in the next 2 hours. Please avoid low-lying areas and waterlogged roads.',
          type: 'emergency',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'urgent',
          action_required: true
        },
        {
          id: '6',
          title: 'New Community Initiative',
          content: 'Join our new tree plantation drive this Sunday at 8 AM. Location: Central Park. Refreshments provided!',
          type: 'community',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'low'
        }
      ];
      
      const sortedNotifications = mockNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('justNow');
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? t('minute') : t('minutes')} ${t('ago')}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? t('hour') : t('hours')} ${t('ago')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? t('day') : t('days')} ${t('ago')}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_update': return 'clipboard';
      case 'system': return 'cog';
      case 'community': return 'users';
      case 'task': return 'tasks';
      case 'emergency': return 'exclamation-triangle';
      case 'maintenance': return 'wrench';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return '#dc2626';
    if (priority === 'high') return '#ea580c';
    
    switch (type) {
      case 'report_update': return '#3b82f6';
      case 'system': return '#6b7280';
      case 'community': return '#059669';
      case 'task': return '#7c3aed';
      case 'emergency': return '#dc2626';
      case 'maintenance': return '#d97706';
      default: return '#64748b';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: { [key: string]: string } = {
      urgent: '#dc2626',
      high: '#ea580c',
      medium: '#3b82f6',
      low: '#6b7280'
    };
    
    return (
      <View style={[styles.priorityBadge, { backgroundColor: colors[priority] || '#6b7280' }]}>
        <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FontAwesome name="bell" size={32} color="#94a3b8" />
          <Text style={styles.loadingText}>{t('loadingNotifications')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('inbox')}</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle}>{t('subtitle')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <FontAwesome name="check" size={16} color={unreadCount > 0 ? "white" : "#94a3b8"} />
          </TouchableOpacity>
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="bell-slash" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
          <Text style={styles.emptyDesc}>{t('noNotificationsDesc')}</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.notificationsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1565C0']}
              tintColor="#1565C0"
            />
          }
        >
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}
              onPress={() => markAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationHeader}>
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationColor(notification.type, notification.priority) }
                ]}>
                  <FontAwesome 
                    name={getNotificationIcon(notification.type)} 
                    size={16} 
                    color="white" 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadTitle
                    ]}>
                      {notification.title}
                    </Text>
                    {notification.priority !== 'low' && getPriorityBadge(notification.priority)}
                  </View>
                  <Text style={styles.notificationText}>{notification.content}</Text>
                  <View style={styles.notificationFooter}>
                    <Text style={styles.timestamp}>{formatTime(notification.created_at)}</Text>
                    {notification.action_required && (
                      <Text style={styles.actionRequired}>Action Required</Text>
                    )}
                    {!notification.read && (
                      <View style={styles.unreadIndicator} />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#1565C0',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationsContainer: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    flex: 1,
  },
  unreadTitle: {
    color: '#0f172a',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  notificationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionRequired: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
});

export default CitizenInboxScreen;
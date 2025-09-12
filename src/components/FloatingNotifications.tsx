import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'system' | 'urgent';
  timestamp: string;
  read: boolean;
}

interface FloatingNotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

const translations = {
  en: {
    notifications: 'Notifications',
    noNotifications: 'No new notifications',
    markAllRead: 'Mark all as read',
    clearAll: 'Clear all',
    newTask: 'New Task Assigned',
    urgent: 'Urgent',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
  },
  hi: {
    notifications: 'सूचनाएं',
    noNotifications: 'कोई नई सूचना नहीं',
    markAllRead: 'सभी को पढ़ा गया चिह्नित करें',
    clearAll: 'सभी साफ़ करें',
    newTask: 'नया कार्य सौंपा गया',
    urgent: 'तत्काल',
    justNow: 'अभी',
    minutesAgo: 'मिनट पहले',
    hoursAgo: 'घंटे पहले',
    daysAgo: 'दिन पहले',
  },
  bn: {
    notifications: 'বিজ্ঞপ্তি',
    noNotifications: 'কোনো নতুন বিজ্ঞপ্তি নেই',
    markAllRead: 'সব পড়া হয়েছে চিহ্নিত করুন',
    clearAll: 'সব পরিষ্কার করুন',
    newTask: 'নতুন কাজ বরাদ্দ',
    urgent: 'জরুরি',
    justNow: 'এখনই',
    minutesAgo: 'মিনিট আগে',
    hoursAgo: 'ঘন্টা আগে',
    daysAgo: 'দিন আগে',
  },
};

const FloatingNotifications: React.FC<FloatingNotificationsProps> = ({
  notifications,
  onMarkRead,
  onClearAll,
}) => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key];
  };

  const toggleNotifications = () => {
    if (isVisible) {
      // Hide
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    } else {
      // Show
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return 'tasks';
      case 'urgent':
        return 'exclamation-triangle';
      case 'system':
        return 'info-circle';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task':
        return '#2563eb';
      case 'urgent':
        return '#ef4444';
      case 'system':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  // Close notification panel when clicking outside
  const handleOverlayPress = () => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('justNow');
    if (diffInMinutes < 60) return `${diffInMinutes} ${t('minutesAgo')}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ${t('hoursAgo')}`;
    return `${Math.floor(diffInMinutes / 1440)} ${t('daysAgo')}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell Button */}
      <TouchableOpacity style={styles.bellButton} onPress={toggleNotifications}>
        <FontAwesome name="bell" size={20} color="white" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Floating Notification Panel */}
      {isVisible && (
        <>
          {/* Background Overlay - Fixed positioning */}
          <TouchableOpacity
            style={styles.overlay}
            onPress={handleOverlayPress}
            activeOpacity={0.5}
          />

          {/* Notification Panel - Fixed positioning */}
          <Animated.View
            style={[
              styles.notificationPanel,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <FontAwesome name="bell" size={18} color="#2563eb" />
                <Text style={styles.headerTitle}>{t('notifications')}</Text>
              </View>
              <View style={styles.headerActions}>
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>{t('clearAll')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={toggleNotifications} style={styles.closeButton}>
                  <FontAwesome name="times" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome name="bell-slash" size={40} color="#d1d5db" />
                  <Text style={styles.emptyText}>{t('noNotifications')}</Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification,
                    ]}
                    onPress={() => onMarkRead(notification.id)}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <FontAwesome
                          name={getNotificationIcon(notification.type)}
                          size={16}
                          color={getNotificationColor(notification.type)}
                        />
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.timestamp)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 999,
  },
  notificationPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.85,
    height: '100%',
    backgroundColor: 'white',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1565C0',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default FloatingNotifications;
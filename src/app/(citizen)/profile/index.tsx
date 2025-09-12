import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image, 
  Animated,
  TextInput,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../context/LanguageContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FloatingNotifications from '../../../components/FloatingNotifications';

const translations = {
  en: {
    profile: 'Profile',
    personalInformation: 'Personal Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    preferences: 'Preferences',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    appSettings: 'App Settings',
    help: 'Help & Support',
    aboutUs: 'About Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    rateApp: 'Rate App',
    shareApp: 'Share App',
    logout: 'Logout',
    version: 'Version',
    contactSupport: 'Contact Support',
    reportIssue: 'Report an Issue',
    faq: 'Frequently Asked Questions',
    userData: 'Your Data',
    deleteAccount: 'Delete Account',
    confirmLogout: 'Are you sure you want to logout?',
    confirmDelete: 'Are you sure you want to delete your account? This action cannot be undone.',
    role: 'Role',
    department: 'Department',
    status: 'Status',
    worker: 'Worker',
    citizen: 'Citizen',
    approved: 'Approved',
    pending: 'Pending',
  },
  hi: {
    profile: 'प्रोफ़ाइल',
    personalInformation: 'व्यक्तिगत जानकारी',
    name: 'नाम',
    email: 'ईमेल',
    phone: 'फोन',
    address: 'पता',
    edit: 'संपादित करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    preferences: 'प्राथमिकताएं',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    privacy: 'गोपनीयता',
    appSettings: 'ऐप सेटिंग्स',
    help: 'सहायता और समर्थन',
    aboutUs: 'हमारे बारे में',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    rateApp: 'ऐप को रेट करें',
    shareApp: 'ऐप साझा करें',
    logout: 'लॉगआउट',
    version: 'संस्करण',
    contactSupport: 'समर्थन से संपर्क करें',
    reportIssue: 'समस्या की रिपोर्ट करें',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    userData: 'आपका डेटा',
    deleteAccount: 'खाता हटाएं',
    confirmLogout: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
    confirmDelete: 'क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    role: 'भूमिका',
    department: 'विभाग',
    status: 'स्थिति',
    worker: 'कार्यकर्ता',
    citizen: 'नागरिक',
    approved: 'अनुमोदित',
    pending: 'लंबित',
  },
  bn: {
    profile: 'প্রোফাইল',
    personalInformation: 'ব্যক্তিগত তথ্য',
    name: 'নাম',
    email: 'ইমেইল',
    phone: 'ফোন',
    address: 'ঠিকানা',
    edit: 'সম্পাদনা',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    preferences: 'পছন্দসমূহ',
    language: 'ভাষা',
    notifications: 'বিজ্ঞপ্তি',
    privacy: 'গোপনীয়তা',
    appSettings: 'অ্যাপ সেটিংস',
    help: 'সাহায্য ও সহায়তা',
    aboutUs: 'আমাদের সম্পর্কে',
    privacyPolicy: 'গোপনীয়তা নীতি',
    termsOfService: 'সেবার শর্তাবলী',
    rateApp: 'অ্যাপ রেট করুন',
    shareApp: 'অ্যাপ শেয়ার করুন',
    logout: 'লগআউট',
    version: 'সংস্করণ',
    contactSupport: 'সহায়তার সাথে যোগাযোগ',
    reportIssue: 'সমস্যা রিপোর্ট করুন',
    faq: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
    userData: 'আপনার ডেটা',
    deleteAccount: 'অ্যাকাউন্ট মুছুন',
    confirmLogout: 'আপনি কি সত্যিই লগআউট করতে চান?',
    confirmDelete: 'আপনি কি সত্যিই আপনার অ্যাকাউন্ট মুছতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
    role: 'ভূমিকা',
    department: 'বিভাগ',
    status: 'অবস্থা',
    worker: 'কর্মী',
    citizen: 'নাগরিক',
    approved: 'অনুমোদিত',
    pending: 'মুলতুবি',
  },
};

const ProfileScreen = () => {
  const { user, session, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      type: 'system' as const,
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      title: 'Security Alert',
      message: 'New login detected from a different device.',
      type: 'urgent' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
  ]);

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key];
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const currentUser = user || session?.user;
      if (!currentUser) {
        console.log('No user or session available');
        setLoading(false);
        return;
      }

      // Try to fetch from profiles table first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) {
        console.log('Profiles table not accessible, using user metadata:', error.message);
        // Fallback to user metadata if profiles table is not accessible
        setUserProfile({
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || 'User',
          username: currentUser.user_metadata?.username || 'Not provided',
          phone_number: currentUser.user_metadata?.phone_number || 'Not provided',
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
      const currentUser = user || session?.user;
      setUserProfile({
        id: currentUser?.id,
        full_name: currentUser?.user_metadata?.full_name || 'User',
        username: currentUser?.user_metadata?.username || 'Not provided',
        phone_number: currentUser?.user_metadata?.phone_number || 'Not provided',
        role: 'citizen', // Default role
        department: null,
        speciality: null,
        status: 'approved'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const currentUser = user || session?.user;
      if (!currentUser) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          ...editedProfile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setUserProfile({ ...userProfile, ...editedProfile });
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('confirmLogout'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('logout'), 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('Profile: Starting logout process');
              
              // Sign out from Supabase - let the layout handle navigation
              await signOut();
              console.log('Profile: Logout completed - layout will handle navigation');
              
            } catch (error) {
              console.error('Profile: Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      t('confirmDelete'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('deleteAccount'), style: 'destructive', onPress: () => console.log('Delete Account') },
      ]
    );
  };

  const handleRateApp = () => {
    const url = 'https://play.google.com/store/apps/details?id=com.your.app';
    Linking.openURL(url);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing app: CiviSamadhan - Your Digital Governance Assistant',
        url: 'https://play.google.com/store/apps/details?id=com.your.app',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleContactSupport = () => {
    const email = 'support@civisamadhan.com';
    const subject = 'Support Request';
    const body = 'Hi, I need help with...';
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

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

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const MenuItem = ({ 
    icon, 
    title, 
    onPress, 
    showArrow = true, 
    color = '#1f2937' 
  }: { 
    icon: any; 
    title: string; 
    onPress: () => void; 
    showArrow?: boolean; 
    color?: string; 
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <FontAwesome name={icon} size={20} color={color} />
        <Text style={[styles.menuItemText, { color }]}>{title}</Text>
      </View>
      {showArrow && <FontAwesome name="chevron-right" size={16} color="#9ca3af" />}
    </TouchableOpacity>
  );

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

  if (loading || (!user && !session)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <FloatingNotifications 
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onClearAll={handleClearAllNotifications}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Section title={t('personalInformation')}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={40} color="white" />
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('name')}</Text>
                {editMode ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedProfile.full_name || userProfile?.full_name || ''}
                    onChangeText={(text) => setEditedProfile((prev: any) => ({ ...prev, full_name: text }))}
                  />
                ) : (
                  <Text style={styles.infoText}>{userProfile?.full_name || 'Not provided'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('email')}</Text>
                <Text style={styles.infoText}>{user?.email || 'Not provided'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('phone')}</Text>
                {editMode ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedProfile.phone_number || userProfile?.phone_number || ''}
                    onChangeText={(text) => setEditedProfile((prev: any) => ({ ...prev, phone_number: text }))}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoText}>{userProfile?.phone_number || 'Not provided'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('role')}</Text>
                <Text style={[styles.infoText, { color: userProfile?.role === 'worker' ? '#2563eb' : '#059669', fontWeight: 'bold' }]}>
                  {t(userProfile?.role || 'citizen')}
                </Text>
              </View>

              {userProfile?.role === 'worker' && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('department')}</Text>
                    <Text style={styles.infoText}>{userProfile?.department || 'Not assigned'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('status')}</Text>
                    <Text style={[styles.infoText, { 
                      color: userProfile?.status === 'approved' ? '#059669' : '#f59e0b',
                      fontWeight: 'bold'
                    }]}>
                      {t(userProfile?.status || 'pending')}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.editButtons}>
              {editMode ? (
                <View style={styles.editButtonsRow}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={() => {
                      setEditMode(false);
                      setEditedProfile({});
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]} 
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>{t('save')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.button, styles.editButton]} 
                  onPress={() => {
                    setEditMode(true);
                    setEditedProfile({
                      full_name: userProfile?.full_name || '',
                      phone_number: userProfile?.phone_number || '',
                    });
                  }}
                >
                  <FontAwesome name="edit" size={16} color="white" />
                  <Text style={styles.editButtonText}>{t('edit')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Section>

        <Section title={t('preferences')}>
          <MenuItem 
            icon="language" 
            title={`${t('language')} (${language.toUpperCase()})`} 
            onPress={() => {
              const languages = ['en', 'hi', 'bn'];
              const currentIndex = languages.indexOf(language);
              const nextIndex = (currentIndex + 1) % languages.length;
              setLanguage(languages[nextIndex] as 'en' | 'hi' | 'bn');
            }}
          />
          <MenuItem icon="bell" title={t('notifications')} onPress={() => console.log('Notifications')} />
          <MenuItem icon="shield" title={t('privacy')} onPress={() => console.log('Privacy')} />
        </Section>

        <Section title={t('help')}>
          <MenuItem icon="phone" title={t('contactSupport')} onPress={handleContactSupport} />
          <MenuItem icon="bug" title={t('reportIssue')} onPress={() => console.log('Report Issue')} />
          <MenuItem 
            icon="question-circle" 
            title={t('faq')} 
            onPress={() => router.push('/(citizen)/faq')} 
          />
          <MenuItem icon="info-circle" title={t('aboutUs')} onPress={() => console.log('About Us')} />
        </Section>

        <Section title={t('appSettings')}>
          <MenuItem icon="file-text" title={t('privacyPolicy')} onPress={() => console.log('Privacy Policy')} />
          <MenuItem icon="file-text" title={t('termsOfService')} onPress={() => console.log('Terms')} />
          <MenuItem icon="star" title={t('rateApp')} onPress={handleRateApp} />
          <MenuItem icon="share" title={t('shareApp')} onPress={handleShareApp} />
        </Section>

        <Section title={t('userData')}>
          <MenuItem 
            icon="trash" 
            title={t('deleteAccount')} 
            onPress={handleDeleteAccount}
            color="#ef4444"
          />
        </Section>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={20} color="white" />
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>{t('version')} 1.0.0</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2563eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  infoInput: {
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  editButtons: {
    marginTop: 10,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutSection: {
    marginVertical: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default ProfileScreen;
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../context/LanguageContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const WorkerProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const faqData = [
    {
      question: "How do I update my task status?",
      answer: "Go to Dashboard, select your task, and use the status update button to change from 'In Progress' to 'Completed'."
    },
    {
      question: "How do I request help from other workers?",
      answer: "Use the Community tab to send help requests or use quick action buttons to notify your team."
    },
    {
      question: "How does the navigation system work?",
      answer: "The app provides GPS navigation to task locations. Follow the route, complete the task, and upload verification photos."
    },
    {
      question: "How do I change my profile information?",
      answer: "Tap 'Edit Profile' in the Profile tab to update your name, phone, department, and specialty."
    }
  ];

  const translations = {
    en: {
      profile: 'Profile',
      personalInfo: 'Personal Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      department: 'Department',
      speciality: 'Speciality',
      role: 'Role',
      worker: 'Worker',
      editProfile: 'Edit Profile',
      changeLanguage: 'Change Language',
      reportIssue: 'Report Issue',
      contactUs: 'Contact Us',
      faq: 'FAQ & Help',
      logout: 'Logout',
      confirmLogout: 'Are you sure you want to logout?',
      cancel: 'Cancel',
      submit: 'Submit',
      close: 'Close',
      reportPlaceholder: 'Describe the issue you\'re facing...',
      contactPlaceholder: 'Your message to support team...',
      reportSubmitted: 'Report submitted successfully',
      contactSubmitted: 'Message sent to support team',
      selectLanguage: 'Select Language'
    },
    hi: {
      profile: 'प्रोफ़ाइल',
      personalInfo: 'व्यक्तिगत जानकारी',
      name: 'नाम',
      email: 'ईमेल',
      phone: 'फोन',
      department: 'विभाग',
      speciality: 'विशेषता',
      role: 'भूमिका',
      worker: 'कार्यकर्ता',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      changeLanguage: 'भाषा बदलें',
      reportIssue: 'समस्या रिपोर्ट करें',
      contactUs: 'संपर्क करें',
      faq: 'FAQ और सहायता',
      logout: 'लॉगआउट',
      confirmLogout: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
      cancel: 'रद्द करें',
      submit: 'जमा करें',
      close: 'बंद करें',
      reportPlaceholder: 'आपकी समस्या का वर्णन करें...',
      contactPlaceholder: 'सपोर्ट टीम को आपका संदेश...',
      reportSubmitted: 'रिपोर्ट सफलतापूर्वक जमा की गई',
      contactSubmitted: 'सपोर्ट टीम को संदेश भेजा गया',
      selectLanguage: 'भाषा चुनें'
    },
    bn: {
      profile: 'প্রোফাইল',
      personalInfo: 'ব্যক্তিগত তথ্য',
      name: 'নাম',
      email: 'ইমেইল',
      phone: 'ফোন',
      department: 'বিভাগ',
      speciality: 'বিশেষত্ব',
      role: 'ভূমিকা',
      worker: 'কর্মী',
      editProfile: 'প্রোফাইল সম্পাদনা',
      changeLanguage: 'ভাষা পরিবর্তন',
      reportIssue: 'সমস্যার রিপোর্ট',
      contactUs: 'যোগাযোগ করুন',
      faq: 'FAQ ও সাহায্য',
      logout: 'লগআউট',
      confirmLogout: 'আপনি কি সত্যিই লগআউট করতে চান?',
      cancel: 'বাতিল',
      submit: 'জমা দিন',
      close: 'বন্ধ',
      reportPlaceholder: 'আপনার সমস্যার বর্ণনা দিন...',
      contactPlaceholder: 'সাপোর্ট টিমের জন্য আপনার বার্তা...',
      reportSubmitted: 'রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে',
      contactSubmitted: 'সাপোর্ট টিমে বার্তা পাঠানো হয়েছে',
      selectLanguage: 'ভাষা নির্বাচন করুন'
    }
  };

  // Translation helper
  const getTranslation = (key: keyof typeof translations.en): string => {
    try {
      return translations[language as keyof typeof translations]?.[key] || translations.en[key];
    } catch (error) {
      return translations.en[key] || key;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      getTranslation('logout'),
      getTranslation('confirmLogout'),
      [
        { text: getTranslation('cancel'), style: 'cancel' },
        {
          text: getTranslation('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Profile: Starting logout process');
              
              // Sign out from Supabase - let the layout handle navigation
              await signOut();
              console.log('Profile: Logout completed - layout will handle navigation');
              
            } catch (error) {
              console.error('Profile: Logout error:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLanguageChange = (langCode: 'en' | 'hi' | 'bn') => {
    setLanguage(langCode);
    setShowLanguageModal(false);
  };

  const handleReportSubmit = async () => {
    if (!reportText.trim()) return;
    
    try {
      // Submit report to database
      const { error } = await supabase
        .from('issue_reports')
        .insert({
          user_id: user?.id,
          report_text: reportText,
          status: 'open',
          created_at: new Date().toISOString()
        });
      
      if (!error) {
        Alert.alert('Success', getTranslation('reportSubmitted'));
        setReportText('');
        setShowReportModal(false);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleContactSubmit = async () => {
    if (!contactMessage.trim()) return;
    
    try {
      // Submit contact message to database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          user_id: user?.id,
          message: contactMessage,
          status: 'open',
          created_at: new Date().toISOString()
        });
      
      if (!error) {
        Alert.alert('Success', getTranslation('contactSubmitted'));
        setContactMessage('');
        setShowContactModal(false);
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={80} color="#1565C0" />
          </View>
          <Text style={styles.userName}>
            {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Worker'}
          </Text>
          <Text style={styles.userRole}>{getTranslation('worker')}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getTranslation('personalInfo')}</Text>
          
          <View style={styles.infoItem}>
            <FontAwesome name="user" size={20} color="#64748b" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{getTranslation('name')}</Text>
              <Text style={styles.infoValue}>
                {profile?.full_name || user?.user_metadata?.full_name || 'Not provided'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome name="envelope" size={20} color="#64748b" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{getTranslation('email')}</Text>
              <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome name="phone" size={20} color="#64748b" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{getTranslation('phone')}</Text>
              <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome name="building" size={20} color="#64748b" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{getTranslation('department')}</Text>
              <Text style={styles.infoValue}>{profile?.department || 'Not assigned'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome name="briefcase" size={20} color="#64748b" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{getTranslation('speciality')}</Text>
              <Text style={styles.infoValue}>{profile?.speciality || 'General worker'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
            onPress={() => router.push('/(worker)/profile/edit')}
          >
            <FontAwesome name="edit" size={20} color="white" />
            <Text style={styles.actionButtonText}>{getTranslation('editProfile')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
            onPress={() => setShowLanguageModal(true)}
          >
            <FontAwesome name="globe" size={20} color="white" />
            <Text style={styles.actionButtonText}>{getTranslation('changeLanguage')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={() => setShowReportModal(true)}
          >
            <FontAwesome name="exclamation-triangle" size={20} color="white" />
            <Text style={styles.actionButtonText}>{getTranslation('reportIssue')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => setShowContactModal(true)}
          >
            <FontAwesome name="phone" size={20} color="white" />
            <Text style={styles.actionButtonText}>{getTranslation('contactUs')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#6366f1' }]}
            onPress={() => setShowFaqModal(true)}
          >
            <FontAwesome name="question-circle" size={20} color="white" />
            <Text style={styles.actionButtonText}>{getTranslation('faq')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <FontAwesome name="sign-out" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              {loading ? 'Logging out...' : getTranslation('logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getTranslation('selectLanguage')}</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.languageOption, language === lang.code && styles.selectedLanguage]}
                onPress={() => handleLanguageChange(lang.code as 'en' | 'hi' | 'bn')}
              >
                <Text style={styles.languageText}>{lang.nativeName}</Text>
                {language === lang.code && <FontAwesome name="check" size={20} color="#1565C0" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.closeButtonText}>{getTranslation('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Issue Modal */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getTranslation('reportIssue')}</Text>
            <TextInput
              style={styles.textArea}
              value={reportText}
              onChangeText={setReportText}
              placeholder={getTranslation('reportPlaceholder')}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.submitButton} onPress={handleReportSubmit}>
                <Text style={styles.submitButtonText}>{getTranslation('submit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowReportModal(false)}>
                <Text style={styles.cancelButtonText}>{getTranslation('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Us Modal */}
      <Modal visible={showContactModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getTranslation('contactUs')}</Text>
            <TextInput
              style={styles.textArea}
              value={contactMessage}
              onChangeText={setContactMessage}
              placeholder={getTranslation('contactPlaceholder')}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.submitButton} onPress={handleContactSubmit}>
                <Text style={styles.submitButtonText}>{getTranslation('submit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowContactModal(false)}>
                <Text style={styles.cancelButtonText}>{getTranslation('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAQ Modal */}
      <Modal visible={showFaqModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getTranslation('faq')}</Text>
            <ScrollView style={styles.faqScrollView}>
              {faqData.map((item, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFaqModal(false)}>
              <Text style={styles.closeButtonText}>{getTranslation('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 15,
    width: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  selectedLanguage: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#1565C0',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    flex: 1,
  },
  cancelButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  faqScrollView: {
    maxHeight: 300,
  },
  faqItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default WorkerProfileScreen;
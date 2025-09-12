import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Modal, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const Logo = React.memo(() => {
  return (
    <View style={styles.logoContainer}>
      <FontAwesome name="building" size={80} color="#1565C0" />
    </View>
  );
});

export default function WelcomeScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { session } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // No automatic session clearing - let the auth flow handle everything
  useEffect(() => {
    // Just log for debugging
    if (session) {
      console.log('Welcome screen loaded with active session');
    } else {
      console.log('Welcome screen loaded without session');
    }
  }, [session]);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const selectLanguage = (langCode: 'en' | 'hi' | 'bn') => {
    setLanguage(langCode);
    setShowLanguageModal(false);
  };

  const getTagline = () => {
    switch(language) {
      case 'hi':
        return 'भारतीय नगरपालिका सेवाओं के लिए\nत्वरित समाधान और नागरिक अधिकार';
      case 'bn':
        return 'ভারতীয় পৌরসভা সেবার জন্য\nদ্রুত সমাধান ও নাগরিক অধিকার';
      default:
        return 'Empowering Indian Municipal Services\nfor Citizen Rights & Quick Resolution';
    }
  };

  const handleCitizenPress = () => {
    console.log('Citizen button pressed - navigating to /(auth)/citizen');
    router.push('/(auth)/citizen');
  };

  const handleWorkerPress = () => {
    if (session) {
      // If user already has session, go directly to worker area
      console.log('User has active session - going to worker dashboard');
      router.push('/(worker)');
    } else {
      // No session, go to login screen
      console.log('Worker button pressed - navigating to /(auth)/worker');
      router.push('/(auth)/worker');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <Logo />
          <Text style={styles.title}>CiviSamadhan</Text>
          <Text style={styles.tagline}>{getTagline()}</Text>
          
          {/* Action Buttons - Moved to center */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.citizenButton]} 
              onPress={handleCitizenPress}
            >
              <FontAwesome name="user" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.citizenButtonText}>Continue as Citizen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.workerButton]}
              onPress={handleWorkerPress}
            >
              <FontAwesome name="briefcase" size={20} color="#1565C0" style={styles.buttonIcon} />
              <Text style={styles.workerButtonText}>Continue as Worker</Text>
            </TouchableOpacity>
          </View>

          {/* Session Status for Testing */}
          {session && (
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionText}>Logged in as: {session.user?.email}</Text>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={async () => {
                  console.log('Clearing session...');
                  await supabase.auth.signOut();
                }}
              >
                <Text style={styles.logoutButtonText}>Logout & Test Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Language Selector - Bottom */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.globeIcon}>
              <FontAwesome name="globe" size={18} color="#1565C0" />
            </View>
            <Text style={styles.languageButtonText}>
              {languages.find(l => l.code === language)?.nativeName || 'English'}
            </Text>
            <FontAwesome name="chevron-down" size={14} color="#1565C0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.selectedLanguageOption
                ]}
                onPress={() => selectLanguage(lang.code as 'en' | 'hi' | 'bn')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[
                    styles.languageOptionText,
                    language === lang.code && styles.selectedLanguageOptionText
                  ]}>
                    {lang.nativeName}
                  </Text>
                </View>
                {language === lang.code && (
                  <FontAwesome name="check-circle" size={20} color="#1565C0" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },

  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 100, // Space for bottom section
  },

  logoContainer: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(21, 101, 192, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  tagline: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: '500',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  
  button: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 56,
  },

  buttonIcon: {
    marginRight: 12,
  },
  
  citizenButton: {
    backgroundColor: '#FF6B35',
  },
  
  workerButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  
  citizenButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  
  workerButtonText: {
    color: '#1565C0',
    fontSize: 18,
    fontWeight: '600',
  },

  bottomSection: {
    paddingBottom: 24,
    alignItems: 'center',
  },

  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  globeIcon: {
    marginRight: 8,
  },
  
  languageButtonText: {
    color: '#1565C0',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  selectedLanguageOption: {
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
    borderColor: '#1565C0',
    borderWidth: 2,
  },
  
  languageOptionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  
  selectedLanguageOptionText: {
    color: '#1565C0',
    fontWeight: '700',
  },
  
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    alignItems: 'center',
  },
  
  modalCloseButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  
  sessionInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1565C0',
  },
  
  sessionText: {
    fontSize: 14,
    color: '#1565C0',
    marginBottom: 8,
    fontWeight: '500',
  },
  
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  
  logoutButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
});
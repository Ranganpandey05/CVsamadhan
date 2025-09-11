import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Your actual CiviSamadhan logo with performance optimizations
const Logo = React.memo(() => {
  return (
    <Image 
      source={require('../assets/CiviSamadhanlogo.png')} 
      style={styles.logo} 
      resizeMode="contain"
      fadeDuration={0} // Disable fade animation for faster loading
      onError={() => {
        console.log('Logo failed to load, using fallback');
      }}
    />
  );
});

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Logo />
        <Text style={styles.title}>Welcome to CiviSamadhan</Text>
        <Text style={styles.subtitle}>Your direct line to civic action.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.citizenButton]} 
          onPress={() => router.push('/(auth)/citizen')}
        >
          <Text style={[styles.buttonText, styles.citizenButtonText]}>Continue as Citizen</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.workerButton]}
          onPress={() => router.push('/(auth)/worker')}
        >
          <Text style={[styles.buttonText, styles.workerButtonText]}>Continue as Worker</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  logo: {
      width: 120,
      height: 120,
      marginBottom: 30,
      // Remove borderRadius to show the full logo design
  },
  fallbackLogo: {
    width: 120,
    height: 120,
    backgroundColor: '#3b82f6',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fallbackLogoText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  citizenButton: {
    backgroundColor: '#3b82f6',
  },
  workerButton: {
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  citizenButtonText: {
    color: '#ffffff',
  },
  workerButtonText: {
    color: '#334155',
  },
});
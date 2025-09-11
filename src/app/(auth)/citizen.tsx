import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, TextInput, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase, testConnection, directSignUp, directSignIn, resendConfirmation } from '../../lib/supabase';
import { Link } from 'expo-router';

// This screen handles both Login and Sign Up for Citizens.
export default function CitizenAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // New state for phone number
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing connection...');

  // Test connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await testConnection();
        if (error) {
          setConnectionStatus('Connection failed - check your internet');
          console.error('Connection test failed:', error);
        } else {
          setConnectionStatus('Connected to server');
          console.log('Connection test successful');
        }
      } catch (err) {
        setConnectionStatus('Connection error');
        console.error('Connection test error:', err);
      }
    };
    
    checkConnection();
  }, []);

  const handleResendConfirmation = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        Alert.alert('Error', 'Failed to resend confirmation email. Please try again.');
      } else {
        Alert.alert('Success', 'Confirmation email sent! Please check your inbox.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to resend confirmation email. Please try again.');
    }
  };

  async function handleAuth() {
    setLoading(true);
    
    try {
      // Validate inputs
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (isSignUp && (!fullName || !username)) {
        Alert.alert('Error', 'Please fill in all required fields for sign up.');
        setLoading(false);
        return;
      }

      console.log('Attempting authentication...', { isSignUp, email });
      
      // Test connection first
      try {
        const { error: connectionError } = await testConnection();
        if (connectionError) {
          throw new Error('Cannot connect to server. Please check your internet connection.');
        }
        console.log('Supabase connection test successful');
      } catch (healthError) {
        console.log('Health check failed:', healthError);
        throw healthError;
      }
      
      console.log('Calling direct auth function...');
      console.log('Auth type:', isSignUp ? 'SIGNUP' : 'SIGNIN');
      
      // Use direct authentication functions to bypass Supabase client issues
      const { data, error } = isSignUp 
        ? await directSignUp(email, password, { 
            full_name: fullName, 
            username: username, 
            phone_number: phoneNumber 
          })
        : await directSignIn(email, password);
        
      console.log('Direct auth result:', { hasData: !!data, hasError: !!error });

      if (error) {
        console.error('Authentication error:', error);
        
        // Handle specific error types
        const errorMsg = (error as any)?.message || String(error) || 'Unknown error';
        if (errorMsg.includes('Network request failed') || errorMsg.includes('fetch')) {
          Alert.alert(
            'Connection Error', 
            'Unable to connect to the server. Please check your internet connection and try again.'
          );
        } else if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
          Alert.alert(
            'Login Failed', 
            'The email or password you entered is incorrect. Please check your credentials and try again.',
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Forgot Password?', 
                style: 'default',
                onPress: () => Alert.alert('Forgot Password', 'Password reset functionality will be available soon.')
              }
            ]
          );
        } else if (errorMsg.includes('User already registered')) {
          Alert.alert('Sign Up Error', 'An account with this email already exists. Please sign in instead.');
        } else if (errorMsg.includes('email_not_confirmed') || errorMsg.includes('Email not confirmed')) {
          Alert.alert(
            'Email Confirmation Required', 
            'Please check your email and click the confirmation link before signing in. If you don\'t see the email, check your spam folder.',
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Resend Email', 
                style: 'default',
                onPress: () => handleResendConfirmation()
              }
            ]
          );
        } else {
          // Provide more specific error messages
          let errorMessage = 'Authentication failed. Please try again.';
          const errorMsg = (error as any)?.message || String(error) || 'Unknown error';
          
          if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (errorMsg.includes('Too many requests')) {
            errorMessage = 'Too many login attempts. Please wait a moment and try again.';
          } else if (errorMsg.includes('User not found')) {
            errorMessage = 'No account found with this email address. Please sign up first.';
          }
          Alert.alert('Authentication Failed', errorMessage);
        }
      } else if (isSignUp) {
        console.log('Sign up successful:', data);
        Alert.alert(
          'Account Created!', 
          'Your account has been created successfully. Please check your email and click the confirmation link to activate your account, then you can sign in.'
        );
        setIsSignUp(false); // Switch back to the login view for convenience
      } else {
        console.log('Sign in successful:', data);
        Alert.alert('Welcome!', 'You have successfully signed in. Redirecting to your dashboard...');
        // On successful login, the root layout will handle redirection automatically.
        // The AuthContext will detect the session change and redirect to (home)
      }
    } catch (err: any) {
      console.error('Network or other error:', err);
      
      if (err.message === 'Request timeout') {
        Alert.alert('Timeout Error', 'The request took too long. Please check your internet connection and try again.');
      } else if (err.message.includes('Network request failed')) {
        Alert.alert('Network Error', 'Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
    
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
          <Text style={styles.title}>{isSignUp ? 'Create Citizen Account' : 'Citizen Login'}</Text>
          
          {isSignUp && (
            <View style={styles.testAccountInfo}>
              <Text style={styles.testAccountTitle}>Creating Your Account:</Text>
              <Text style={styles.testAccountText}>1. Fill in your details below</Text>
              <Text style={styles.testAccountText}>2. Check your email for confirmation link</Text>
              <Text style={styles.testAccountText}>3. Click the link to activate your account</Text>
              <Text style={styles.testAccountNote}>Note: You'll be able to sign in after email confirmation</Text>
            </View>
          )}
          
          {!isSignUp && (
            <View style={styles.testAccountInfo}>
              <Text style={styles.testAccountTitle}>How to Sign In:</Text>
              <Text style={styles.testAccountText}>1. First, create a new account using "Sign Up"</Text>
              <Text style={styles.testAccountText}>2. Check your email and click the confirmation link</Text>
              <Text style={styles.testAccountText}>3. Then come back here and sign in with your credentials</Text>
              <Text style={styles.testAccountNote}>Note: You must confirm your email before signing in</Text>
            </View>
          )}
          
          <View style={styles.connectionStatus}>
            <Text style={[
              styles.connectionText, 
              connectionStatus.includes('Connected') ? styles.connectionSuccess : styles.connectionError
            ]}>
              {connectionStatus}
            </Text>
          </View>
          
          {isSignUp && (
            <>
              <TextInput
                style={styles.input}
                onChangeText={setFullName}
                value={fullName}
                placeholder="Full Name"
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                onChangeText={setUsername}
                value={username}
                placeholder="Unique Username"
                autoCapitalize="none"
              />
               <TextInput
                style={styles.input}
                onChangeText={setPhoneNumber}
                value={phoneNumber}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </>
          )}

          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="Email (e.g., name@email.com)"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            placeholder="Password"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
          
          {!isSignUp && (
            <TouchableOpacity onPress={() => setIsSignUp(true)} style={styles.createAccountButton}>
              <Text style={styles.createAccountButtonText}>Create New Account</Text>
            </TouchableOpacity>
          )}
          
          <Link href="/" asChild>
             <TouchableOpacity style={styles.backButton}>
                <Text style={styles.backButtonText}>Back to role selection</Text>
             </TouchableOpacity>
          </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// A comprehensive stylesheet for a modern look
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  form: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  toggleButton: {
    marginTop: 20,
  },
  toggleText: {
    color: '#3b82f6',
    textAlign: 'center',
    fontWeight: '500',
  },
  backButton: {
      marginTop: 20,
  },
  backButtonText: {
      color: '#64748b',
      textAlign: 'center',
      fontWeight: '500'
  },
  connectionStatus: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  connectionText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  connectionSuccess: {
    color: '#10b981',
  },
  connectionError: {
    color: '#ef4444',
  },
  testAccountInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  testAccountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  testAccountText: {
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 2,
  },
  testAccountNote: {
    fontSize: 11,
    color: '#0284c7',
    fontStyle: 'italic',
    marginTop: 4,
  },
  createAccountButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});

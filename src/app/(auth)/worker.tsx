import React, { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase, directSignUp, directSignIn } from '../../lib/supabase';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// This screen handles both Login and Sign Up for Workers.
export default function WorkerAuth() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [idCardImage, setIdCardImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setIdCardImage(result.assets[0]);
    }
  };

  async function handleLogin() {
      setLoading(true);
      
      try {
        const { data, error } = await directSignIn(email, password);
        
        if (error) {
          const errorMsg = (error as any)?.message || String(error) || 'Unknown error';
          if (errorMsg.includes('email_not_confirmed') || errorMsg.includes('Email not confirmed')) {
            Alert.alert(
              'Email Confirmation Required', 
              'Please check your email and click the confirmation link before signing in. If you don\'t see the email, check your spam folder.'
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
          } else {
            // Provide more specific error messages
            let errorMessage = 'Login failed. Please try again.';
            
            if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
              errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (errorMsg.includes('email_not_confirmed') || errorMsg.includes('Email not confirmed')) {
              errorMessage = 'Please check your email and click the confirmation link before signing in.';
            } else if (errorMsg.includes('Too many requests')) {
              errorMessage = 'Too many login attempts. Please wait a moment and try again.';
            } else if (errorMsg.includes('User not found')) {
              errorMessage = 'No account found with this email address. Please sign up first.';
            }
            Alert.alert('Login Failed', errorMessage);
          }
        } else if (data?.user) {
          // Check worker status after login
          try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.log('Profile fetch error:', profileError);
                // If we can't fetch profile, allow login but show warning
                Alert.alert(
                  'Login Successful', 
                  'You have signed in successfully. Some features may be limited until your profile is fully set up.',
                  [{ text: 'OK' }]
                );
            } else if (profile?.status === 'pending') {
                Alert.alert(
                  'Pending Approval', 
                  'Your worker application is under review. You can access limited features while waiting for approval.',
                  [
                    { 
                      text: 'Continue', 
                      onPress: () => {
                        // Allow them to continue to dashboard with limited access
                        console.log('Worker login successful - pending approval');
                      }
                    }
                  ]
                );
            } else if (profile?.status === 'approved') {
                Alert.alert('Welcome!', 'You have successfully signed in. Redirecting to your dashboard...');
            } else {
                Alert.alert(
                  'Account Status', 
                  `Your account status is: ${profile?.status || 'unknown'}. Please contact support if you need assistance.`,
                  [{ text: 'OK' }]
                );
            }
          } catch (profileCheckError) {
            console.log('Profile check error:', profileCheckError);
            // If profile check fails, still allow login
            Alert.alert('Login Successful', 'You have signed in successfully.');
          }
          // The root layout will handle redirection regardless of approval status
        }
      } catch (err) {
        Alert.alert('Network Error', 'Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      setLoading(false);
  }

  async function handleSignUp() {
    if (!idCardImage) {
      Alert.alert('Missing ID Card', 'Please upload a photo of your work ID card for verification.');
      return;
    }
    setLoading(true);

    // 1. Sign up the user using direct function
    const { data: signUpData, error: signUpError } = await directSignUp(email, password, {
      full_name: fullName,
      username,
      role: 'worker'
    });

    if (signUpError) {
      Alert.alert('Sign Up Error', (signUpError as any)?.message || String(signUpError) || 'Unknown error');
      setLoading(false);
      return;
    }
    if (!signUpData.user) {
      Alert.alert('Sign Up Error', 'Could not create user.');
      setLoading(false);
      return;
    }

    // 2. Upload the ID card image
    const fileExt = idCardImage.uri.split('.').pop();
    const fileName = `${signUpData.user.id}.${fileExt}`;
    const filePath = `${fileName}`;
    
    let formData = new FormData();
    formData.append('file', {
        uri: idCardImage.uri,
        name: fileName,
        type: `image/${fileExt}`
    } as any);

    const { error: uploadError } = await supabase.storage
      .from('worker-verification')
      .upload(filePath, formData);

    if (uploadError) {
        Alert.alert('Upload Error', 'Failed to upload ID card. Please try again.');
        // Consider deleting the user if upload fails
        setLoading(false);
        return;
    }

    // 3. Update the user's profile with worker info
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          department,
          speciality,
          id_card_url: filePath,
          status: 'pending', // Key step: set status to pending
          role: 'worker'
        })
        .eq('id', signUpData.user.id);
        
      if (updateError) {
        console.log('Profile update failed:', updateError.message);
        Alert.alert('Warning', 'Account created but profile update failed. Please contact support.');
      } else {
        console.log('Profile updated successfully for worker');
      }
    } catch (profileError) {
      console.log('Profile update error:', profileError);
      Alert.alert('Warning', 'Account created but profile update failed. Please contact support.');
    }

    // Show success message regardless of profile update
    Alert.alert(
      'Registration Complete!', 
      'Please check your email to confirm your account. Your application will be reviewed by the municipality for approval.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Switch to login mode after successful registration
            setIsSignUp(false);
          }
        }
      ]
    );

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
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>{isSignUp ? 'Worker Registration' : 'Worker Login'}</Text>
        
        {isSignUp && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Worker Registration Process:</Text>
            <Text style={styles.infoText}>1. Fill in your details and upload ID card</Text>
            <Text style={styles.infoText}>2. Your application will be reviewed</Text>
            <Text style={styles.infoText}>3. You'll receive approval notification</Text>
            <Text style={styles.infoNote}>Note: Registration requires admin approval</Text>
          </View>
        )}
        
        {!isSignUp && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How to Sign In:</Text>
            <Text style={styles.infoText}>1. First, register as a worker using "Register"</Text>
            <Text style={styles.infoText}>2. Wait for admin approval</Text>
            <Text style={styles.infoText}>3. Then sign in with your credentials</Text>
            <Text style={styles.infoNote}>Note: You must be approved before signing in</Text>
          </View>
        )}
        
        {isSignUp && (
          <>
            <TextInput style={styles.input} onChangeText={setFullName} value={fullName} placeholder="Full Name" autoCapitalize="words"/>
            <TextInput style={styles.input} onChangeText={setUsername} value={username} placeholder="Username" autoCapitalize="none"/>
          </>
        )}

        <TextInput style={styles.input} onChangeText={setEmail} value={email} placeholder="email@address.com" autoCapitalize="none" keyboardType="email-address"/>
        <TextInput style={styles.input} onChangeText={setPassword} value={password} secureTextEntry placeholder="Password" autoCapitalize="none"/>
        
        {isSignUp && (
          <>
            <TextInput style={styles.input} onChangeText={setDepartment} value={department} placeholder="Department (e.g., Sanitation)"/>
            <TextInput style={styles.input} onChangeText={setSpeciality} value={speciality} placeholder="Speciality (e.g., Electrician)"/>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>{idCardImage ? 'ID Card Selected!' : 'Upload Work ID Card'}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={isSignUp ? handleSignUp : handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>{isSignUp ? 'Register for Approval' : 'Sign In'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
          <Text style={styles.toggleText}>{isSignUp ? 'Already have an account? Sign In' : "New worker? Register here"}</Text>
        </TouchableOpacity>

        <Link href="/" asChild>
           <TouchableOpacity style={styles.backButton}><Text style={styles.backButtonText}>Back to role selection</Text></TouchableOpacity>
        </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles are similar to CitizenAuth but with additions for the image picker
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  form: {
    flexGrow: 1,
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
    backgroundColor: '#64748b', // Worker theme color
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
    color: '#64748b',
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
  imageButton: {
      backgroundColor: '#e2e8f0',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
  },
  imageButtonText: {
      color: '#334155',
      fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 2,
  },
  infoNote: {
    fontSize: 11,
    color: '#0284c7',
    fontStyle: 'italic',
    marginTop: 4,
  }
});

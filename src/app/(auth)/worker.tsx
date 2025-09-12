import React, { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase, signUpWithEmail, signInWithEmail } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Translations for Worker Auth
const translations = {
  en: {
    workerAuth: 'Worker Login',
    workerSignUp: 'Worker Registration',
    email: 'Email Address',
    password: 'Password',
    fullName: 'Full Name',
    username: 'Username',
    department: 'Department',
    speciality: 'Speciality/Role',
    uploadIdCard: 'Upload ID Card Photo',
    signIn: 'Sign In',
    signUp: 'Create Account',
    switchToSignUp: "Don't have an account? Sign Up",
    switchToSignIn: 'Already have an account? Sign In',
    backToWelcome: 'Back to Welcome',
    emailConfirmationRequired: 'Email Confirmation Required',
    emailConfirmationMsg: 'Please check your email and click the confirmation link before signing in. If you don\'t see the email, check your spam folder.',
    loginFailed: 'Login Failed',
    invalidCredentials: 'The email or password you entered is incorrect. Please check your credentials and try again.',
    registrationSuccess: 'Registration Successful!',
    registrationSuccessMsg: 'Your worker account has been created. Please check your email to confirm your account.',
    registrationFailed: 'Registration Failed',
  },
  hi: {
    workerAuth: 'कार्यकर्ता लॉगिन',
    workerSignUp: 'कार्यकर्ता पंजीकरण',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    username: 'उपयोगकर्ता नाम',
    department: 'विभाग',
    speciality: 'विशेषता/भूमिका',
    uploadIdCard: 'पहचान पत्र फोटो अपलोड करें',
    signIn: 'साइन इन',
    signUp: 'खाता बनाएं',
    switchToSignUp: 'खाता नहीं है? साइन अप करें',
    switchToSignIn: 'पहले से खाता है? साइन इन करें',
    backToWelcome: 'स्वागत पर वापस',
    emailConfirmationRequired: 'ईमेल पुष्टिकरण आवश्यक',
    emailConfirmationMsg: 'कृपया अपना ईमेल जांचें और साइन इन करने से पहले पुष्टिकरण लिंक पर क्लिक करें। यदि आपको ईमेल नज़र नहीं आता, तो अपना स्पैम फ़ोल्डर जांचें।',
    loginFailed: 'लॉगिन विफल',
    invalidCredentials: 'आपके द्वारा दर्ज किया गया ईमेल या पासवर्ड गलत है। कृपया अपनी जानकारी जांचें और पुनः प्रयास करें।',
    registrationSuccess: 'पंजीकरण सफल!',
    registrationSuccessMsg: 'आपका कार्यकर्ता खाता बनाया गया है। कृपया अपने खाते की पुष्टि करने के लिए अपना ईमेल जांचें।',
    registrationFailed: 'पंजीकरण विफल',
  },
  bn: {
    workerAuth: 'কর্মী লগইন',
    workerSignUp: 'কর্মী নিবন্ধন',
    email: 'ইমেইল ঠিকানা',
    password: 'পাসওয়ার্ড',
    fullName: 'পূর্ণ নাম',
    username: 'ব্যবহারকারীর নাম',
    department: 'বিভাগ',
    speciality: 'বিশেষত্ব/ভূমিকা',
    uploadIdCard: 'পরিচয়পত্রের ছবি আপলোড করুন',
    signIn: 'সাইন ইন',
    signUp: 'অ্যাকাউন্ট তৈরি করুন',
    switchToSignUp: 'অ্যাকাউন্ট নেই? সাইন আপ করুন',
    switchToSignIn: 'ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন',
    backToWelcome: 'স্বাগতম পাতায় ফিরে যান',
    emailConfirmationRequired: 'ইমেইল নিশ্চিতকরণ প্রয়োজন',
    emailConfirmationMsg: 'সাইন ইন করার আগে অনুগ্রহ করে আপনার ইমেইল চেক করুন এবং নিশ্চিতকরণ লিঙ্কে ক্লিক করুন। যদি আপনি ইমেইলটি না দেখেন, আপনার স্প্যাম ফোল্ডার চেক করুন।',
    loginFailed: 'লগইন ব্যর্থ',
    invalidCredentials: 'আপনার প্রবেশ করা ইমেইল বা পাসওয়ার্ড ভুল। অনুগ্রহ করে আপনার তথ্য চেক করুন এবং আবার চেষ্টা করুন।',
    registrationSuccess: 'নিবন্ধন সফল!',
    registrationSuccessMsg: 'আপনার কর্মী অ্যাকাউন্ট তৈরি হয়েছে। আপনার অ্যাকাউন্ট নিশ্চিত করতে অনুগ্রহ করে আপনার ইমেইল চেক করুন।',
    registrationFailed: 'নিবন্ধন ব্যর্থ',
  },
};

// This screen handles both Login and Sign Up for Workers.
export default function WorkerAuth() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = (key: keyof typeof translations.en) => translations[language][key] || translations.en[key];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [idCardImage, setIdCardImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
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
        const { data, error } = await signInWithEmail(email, password);
        
        if (error) {
          const errorMsg = (error as any)?.message || String(error) || 'Unknown error';
          if (errorMsg.includes('email_not_confirmed') || errorMsg.includes('Email not confirmed')) {
            Alert.alert(
              t('emailConfirmationRequired'), 
              t('emailConfirmationMsg')
            );
          } else if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
            Alert.alert(
              t('loginFailed'), 
              t('invalidCredentials'),
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
          // Ensure user has worker role in metadata AND database
          try {
            // Update user metadata
            await supabase.auth.updateUser({
              data: { 
                role: 'worker',
                ...data.user.user_metadata 
              }
            });

            // Force update profile in database to worker role
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                role: 'worker',
                full_name: data.user.user_metadata?.full_name || fullName,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              });

            if (profileUpdateError) {
              console.log('Profile role update error:', profileUpdateError);
            } else {
              console.log('Successfully updated profile role to worker');
            }
          } catch (updateError) {
            console.log('Could not update user role:', updateError);
          }

          // Check worker approval status after login
          try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('approval_status, role, full_name')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.log('Profile fetch error:', profileError);
                // If we can't fetch profile, allow login but show warning
                Alert.alert(
                  'Login Successful', 
                  'You have signed in successfully. Some features may be limited until your profile is fully set up.',
                  [{ 
                    text: 'OK',
                    onPress: () => {
                      console.log('Navigating to worker dashboard after profile error');
                      router.replace('/(worker)/dashboard');
                    }
                  }]
                );
            } else if (profile?.approval_status === 'pending') {
                Alert.alert(
                  'Pending Approval', 
                  'Your worker application is under review by our admin team. You cannot access the worker dashboard until your application is approved. Please wait for approval notification.',
                  [
                    { 
                      text: 'OK', 
                      onPress: () => {
                        console.log('Worker application still pending - staying on auth screen');
                        // Stay on the auth screen, don't navigate to dashboard
                      }
                    }
                  ]
                );
            } else if (profile?.approval_status === 'rejected') {
                Alert.alert(
                  'Application Rejected', 
                  'Your worker application has been rejected. Please contact admin for more information or submit a new application.',
                  [
                    { 
                      text: 'OK', 
                      onPress: () => {
                        console.log('Worker application rejected - staying on auth screen');
                        // Stay on the auth screen
                      }
                    }
                  ]
                );
            } else if (profile?.approval_status === 'approved') {
                Alert.alert('Welcome!', 'You have successfully signed in. Redirecting to your dashboard...', [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('Navigating to approved worker dashboard');
                      router.replace('/(worker)/dashboard');
                    }
                  }
                ]);
            } else {
                Alert.alert(
                  'Account Status', 
                  `Your account approval status is: ${profile?.approval_status || 'unknown'}. Please contact support if you need assistance.`,
                  [{ 
                    text: 'OK',
                    onPress: () => {
                      console.log('Worker with unknown approval status - staying on auth screen');
                      // Stay on the auth screen for safety
                    }
                  }]
                );
            }
          } catch (profileCheckError) {
            console.log('Profile check error:', profileCheckError);
            // If profile check fails, still allow login
            Alert.alert('Login Successful', 'You have signed in successfully.', [
              {
                text: 'OK',
                onPress: () => {
                  console.log('Navigating to dashboard after profile check error');
                  router.replace('/(worker)/dashboard');
                }
              }
            ]);
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
    
    if (!fullName.trim() || !username.trim() || !phone.trim() || !department.trim() || !speciality.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    setLoading(true);

    try {
      // 1. Sign up the user using Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'worker', // Set role as worker
          },
        },
      });

      if (signUpError) {
        Alert.alert('Sign Up Error', signUpError.message || 'Failed to create account');
        setLoading(false);
        return;
      }
      
      if (!signUpData?.user) {
        Alert.alert('Sign Up Error', 'Could not create user.');
        setLoading(false);
        return;
      }

      console.log('User created successfully:', signUpData.user.id);
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the session is established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session not established:', sessionError);
        Alert.alert('Session Error', 'Authentication session not established. Please try logging in.');
        setLoading(false);
        return;
      }
      
      console.log('Session verified for user:', session.user.id);

      // 2. Upload the ID card image to storage
      const fileExt = idCardImage.uri.split('.').pop();
      const fileName = `${signUpData.user.id}_id_card.${fileExt}`;
      const filePath = `${signUpData.user.id}/${fileName}`;
      
      console.log('Uploading image to:', filePath);
      console.log('Image URI:', idCardImage.uri);
      
      try {
        // Method 1: Try with ArrayBuffer first
        let uploadError = null;
        
        try {
          const response = await fetch(idCardImage.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          console.log('Image converted to arrayBuffer, size:', arrayBuffer.byteLength);
          
          const { error } = await supabase.storage
            .from('worker-documents')
            .upload(filePath, arrayBuffer, {
              contentType: `image/${fileExt}`,
              upsert: false
            });
            
          uploadError = error;
          
        } catch (arrayBufferError) {
          console.log('ArrayBuffer method failed, trying FormData method...');
          
          // Method 2: Fallback to FormData for React Native
          const formData = new FormData();
          formData.append('file', {
            uri: idCardImage.uri,
            type: `image/${fileExt}`,
            name: fileName,
          } as any);
          
          const { error } = await supabase.storage
            .from('worker-documents')
            .upload(filePath, formData);
            
          uploadError = error;
        }

        if (uploadError) {
          console.error('Upload error:', uploadError);
          
          // If upload fails, try to save the application without the image first
          console.log('Image upload failed, saving application without image for now...');
          
          // Save application without image
          const { data: applicationData, error: appError } = await supabase
            .from('worker_applications')
            .insert({
              auth_user_id: signUpData.user.id,
              full_name: fullName,
              username: username,
              email: email,
              phone: phone,
              department: department,
              speciality: speciality,
              id_card_url: null, // Will update later
              id_card_type: 'Government ID',
              status: 'pending',
              application_date: new Date().toISOString()
            })
            .select()
            .single();
            
          if (appError) {
            Alert.alert('Application Error', `Failed to submit application: ${appError.message}`);
            setLoading(false);
            return;
          }
          
          // Now try to upload image again and update the application
          console.log('Retrying image upload...');
          
          // Second attempt with different approach
          try {
            const formData = new FormData();
            formData.append('file', {
              uri: idCardImage.uri,
              type: `image/${fileExt}`,
              name: fileName,
            } as any);
            
            const { error: retryUploadError } = await supabase.storage
              .from('worker-documents')
              .upload(filePath, formData);
              
            if (!retryUploadError) {
              // Update application with image URL
              await supabase
                .from('worker_applications')
                .update({ id_card_url: filePath })
                .eq('id', applicationData.id);
                
              console.log('Image uploaded successfully on retry');
            } else {
              console.error('Retry upload also failed:', retryUploadError);
              Alert.alert(
                'Partial Success', 
                'Your application was submitted but the ID image upload failed. Please contact support to complete your application.'
              );
            }
          } catch (retryError) {
            console.error('Retry upload error:', retryError);
            Alert.alert(
              'Partial Success', 
              'Your application was submitted but the ID image upload failed. Please contact support to complete your application.'
            );
          }
          
          // Continue with profile creation
          const continueWithProfile = true;
          if (!continueWithProfile) {
            setLoading(false);
            return;
          }
        } else {
          console.log('Image uploaded successfully to:', filePath);
        }
        
      } catch (uploadError) {
        console.error('Image conversion/upload error:', uploadError);
        Alert.alert('Upload Error', 'Failed to process or upload image. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }

      // 3. Save worker application to database for admin review
      console.log('Saving worker application for user:', signUpData.user.id);
      
      const { data: applicationData, error: applicationError } = await supabase
        .from('worker_applications')
        .insert({
          auth_user_id: signUpData.user.id,
          full_name: fullName,
          username: username,
          email: email,
          phone: phone,
          department: department,
          speciality: speciality,
          id_card_url: filePath,
          id_card_type: 'Government ID',
          status: 'pending',
          application_date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (applicationError) {
        console.error('Application save error:', applicationError);
        Alert.alert(
          'Application Error', 
          `Failed to submit application: ${applicationError.message}. Please contact support.`
        );
        setLoading(false);
        return;
      }
      
      console.log('Worker application saved successfully:', applicationData);

      // 4. Ensure profile is created/updated with worker status
      // The trigger should handle this, but let's make sure
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          full_name: fullName,
          username: username,
          email: email,
          role: 'worker',
          department: department,
          speciality: speciality,
          approval_status: 'pending',
          application_id: applicationData?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
        
      if (profileError) {
        console.error('Profile creation error:', profileError);
        console.log('Profile error details:', profileError.message);
        // Don't fail the signup - the application was saved successfully
      } else {
        console.log('Profile updated successfully');
      }

      // Show success message
      Alert.alert(
        'Application Submitted!', 
        'Your worker application has been submitted successfully. You will receive an email notification once an admin reviews and approves your application. Please check your email for confirmation.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Switch to login mode after successful registration
              setIsSignUp(false);
              // Clear form
              setFullName('');
              setUsername('');
              setPhone('');
              setDepartment('');
              setSpeciality('');
              setIdCardImage(null);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Signup process error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.title}>{isSignUp ? t('workerSignUp') : t('workerAuth')}</Text>
        
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
            <TextInput style={styles.input} onChangeText={setFullName} value={fullName} placeholder={t('fullName')} autoCapitalize="words"/>
            <TextInput style={styles.input} onChangeText={setUsername} value={username} placeholder={t('username')} autoCapitalize="none"/>
            <TextInput style={styles.input} onChangeText={setPhone} value={phone} placeholder="Phone Number" keyboardType="phone-pad"/>
          </>
        )}

        <TextInput style={styles.input} onChangeText={setEmail} value={email} placeholder={t('email')} autoCapitalize="none" keyboardType="email-address"/>
        <TextInput style={styles.input} onChangeText={setPassword} value={password} secureTextEntry placeholder={t('password')} autoCapitalize="none"/>
        
        {isSignUp && (
          <>
            <TextInput style={styles.input} onChangeText={setDepartment} value={department} placeholder={t('department')}/>
            <TextInput style={styles.input} onChangeText={setSpeciality} value={speciality} placeholder={t('speciality')}/>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>{idCardImage ? 'ID Card Selected!' : t('uploadIdCard')}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={isSignUp ? handleSignUp : handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>{isSignUp ? t('signUp') : t('signIn')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
          <Text style={styles.toggleText}>{isSignUp ? t('switchToSignIn') : t('switchToSignUp')}</Text>
        </TouchableOpacity>

        <Link href="/" asChild>
           <TouchableOpacity style={styles.backButton}><Text style={styles.backButtonText}>{t('backToWelcome')}</Text></TouchableOpacity>
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

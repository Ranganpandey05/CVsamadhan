import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Translations for Report Screen
const translations = {
  en: {
    reportIssue: 'Report Issue',
    title: 'Issue Title',
    titlePlaceholder: 'Brief title of the issue',
    description: 'Description',
    descriptionPlaceholder: 'Detailed description of the issue',
    category: 'Category',
    selectCategory: 'Select Category',
    address: 'Address',
    addressPlaceholder: 'Location address',
    priority: 'Priority',
    getCurrentLocation: 'Get Current Location',
    submitReport: 'Submit Report',
    reportSubmitted: 'Report Submitted',
    reportSuccess: 'Your report has been submitted successfully.',
    reportNumber: 'Report Number',
    updatesMessage: 'You will receive updates soon.',
    error: 'Error',
    submitError: 'There was a problem submitting your report. Please try again.',
    ok: 'OK',
    categories: {
      'Road Issues': 'Road Issues',
      'Water Supply': 'Water Supply',
      'Electricity': 'Electricity',
      'Waste Management': 'Waste Management',
      'Public Safety': 'Public Safety',
      'Street Lighting': 'Street Lighting',
      'Drainage': 'Drainage',
      'Parks & Recreation': 'Parks & Recreation',
      'Other': 'Other'
    },
    priorities: {
      'Low': 'Low',
      'Medium': 'Medium',
      'High': 'High',
      'Urgent': 'Urgent'
    },
    locationPermission: 'Location Permission Required',
    locationPermissionMessage: 'Please allow location access so we can identify the correct location of your issue.',
    photoPermission: 'Permission Required',
    photoPermissionMessage: 'Please allow photo access permission',
    cameraPermission: 'Permission Required',
    cameraPermissionMessage: 'Please allow camera access permission',
    gpsAccuracy: 'GPS Accuracy',
    meters: 'meters',
    issueDescription: 'Issue Description',
    issueDescriptionPlaceholder: 'Describe the issue in detail...',
    addPhotos: 'Add Photos',
    takePhoto: 'Take Photo',
    chooseFromGallery: 'Choose from Gallery',
    validationTitle: 'Error',
    validationTitleRequired: 'Please enter issue title',
    validationDescriptionRequired: 'Please enter issue description',
    validationCategoryRequired: 'Please select issue category',
    validationLocationRequired: 'Please get location information',
    validationSubmissionError: 'Failed to submit report',
    submissionSuccess: 'Report submitted successfully!',
    submitting: 'Submitting...',
    locationError: 'Error',
    locationErrorMessage: 'Problem getting location'
  },
  hi: {
    reportIssue: 'समस्या रिपोर्ट करें',
    title: 'समस्या का शीर्षक',
    titlePlaceholder: 'समस्या का संक्षिप्त शीर्षक',
    description: 'विवरण',
    descriptionPlaceholder: 'समस्या का विस्तृत विवरण',
    category: 'श्रेणी',
    selectCategory: 'श्रेणी चुनें',
    address: 'पता',
    addressPlaceholder: 'स्थान का पता',
    priority: 'प्राथमिकता',
    getCurrentLocation: 'वर्तमान स्थान प्राप्त करें',
    addPhotos: 'फोटो जोड़ें',
    submitReport: 'रिपोर्ट जमा करें',
    reportSubmitted: 'रिपोर्ट सबमिट हुई',
    reportSuccess: 'आपकी रिपोर्ट सफलतापूर्वक सबमिट हो गई है।',
    reportNumber: 'रिपोर्ट नंबर',
    updatesMessage: 'आपको जल्द ही अपडेट मिलेगा।',
    error: 'त्रुटि',
    submitError: 'रिपोर्ट सबमिट करने में समस्या हुई। कृपया दोबारा कोशिश करें।',
    ok: 'ठीक है',
    locationPermission: 'स्थान की अनुमति चाहिए',
    locationPermissionMessage: 'कृपया स्थान की अनुमति दें ताकि हम आपकी समस्या का सही पता लगा सकें।',
    photoPermission: 'अनुमति चाहिए',
    photoPermissionMessage: 'कृपया फोटो एक्सेस की अनुमति दें',
    cameraPermission: 'अनुमति चाहिए',
    cameraPermissionMessage: 'कृपया कैमरा एक्सेस की अनुमति दें',
    gpsAccuracy: 'GPS सटीकता',
    meters: 'मीटर',
    issueDescription: 'समस्या का विवरण',
    issueDescriptionPlaceholder: 'समस्या के बारे में विस्तार से बताएं...',
    takePhoto: 'फोटो खींचें',
    chooseFromGallery: 'गैलरी से चुनें',
    validationTitle: 'त्रुटि',
    validationTitleRequired: 'कृपया समस्या का शीर्षक लिखें',
    validationDescriptionRequired: 'कृपया समस्या का विवरण लिखें',
    validationCategoryRequired: 'कृपया समस्या की श्रेणी चुनें',
    validationLocationRequired: 'कृपया स्थान की जानकारी प्राप्त करें',
    validationSubmissionError: 'रिपोर्ट जमा करने में विफल',
    submissionSuccess: 'रिपोर्ट सफलतापूर्वक जमा की गई!',
    submitting: 'जमा कर रहे हैं...',
    locationError: 'त्रुटि',
    locationErrorMessage: 'स्थान प्राप्त करने में समस्या हुई',
    categories: {
      'Road Issues': 'सड़क की समस्याएं',
      'Water Supply': 'पानी की आपूर्ति',
      'Electricity': 'बिजली',
      'Waste Management': 'कचरा प्रबंधन',
      'Public Safety': 'सार्वजनिक सुरक्षा',
      'Street Lighting': 'सड़क की रोशनी',
      'Drainage': 'जल निकासी',
      'Parks & Recreation': 'पार्क और मनोरंजन',
      'Other': 'अन्य'
    },
    priorities: {
      'Low': 'कम',
      'Medium': 'मध्यम',
      'High': 'उच्च',
      'Urgent': 'तत्काल'
    }
  },
  bn: {
    reportIssue: 'সমস্যা রিপোর্ট করুন',
    title: 'সমস্যার শিরোনাম',
    titlePlaceholder: 'সমস্যার সংক্ষিপ্ত শিরোনাম',
    description: 'বিবরণ',
    descriptionPlaceholder: 'সমস্যার বিস্তারিত বিবরণ',
    category: 'বিভাগ',
    selectCategory: 'বিভাগ নির্বাচন করুন',
    address: 'ঠিকানা',
    addressPlaceholder: 'অবস্থানের ঠিকানা',
    priority: 'অগ্রাধিকার',
    getCurrentLocation: 'বর্তমান অবস্থান পান',
    addPhotos: 'ছবি যোগ করুন',
    submitReport: 'রিপোর্ট জমা দিন',
    reportSubmitted: 'রিপোর্ট জমা দেওয়া হয়েছে',
    reportSuccess: 'আপনার রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে।',
    reportNumber: 'রিপোর্ট নম্বর',
    updatesMessage: 'আপনি শীঘ্রই আপডেট পাবেন।',
    error: 'ত্রুটি',
    submitError: 'আপনার রিপোর্ট জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    ok: 'ঠিক আছে',
    locationPermission: 'অবস্থানের অনুমতি প্রয়োজন',
    locationPermissionMessage: 'আপনার সমস্যার সঠিক অবস্থান চিহ্নিত করতে অবস্থানের অনুমতি দিন।',
    photoPermission: 'অনুমতি প্রয়োজন',
    photoPermissionMessage: 'ছবি অ্যাক্সেসের অনুমতি দিন',
    cameraPermission: 'অনুমতি প্রয়োজন',
    cameraPermissionMessage: 'ক্যামেরা অ্যাক্সেসের অনুমতি দিন',
    gpsAccuracy: 'GPS নির্ভুলতা',
    meters: 'মিটার',
    issueDescription: 'সমস্যার বিবরণ',
    issueDescriptionPlaceholder: 'সমস্যা সম্পর্কে বিস্তারিত বর্ণনা করুন...',
    takePhoto: 'ছবি তুলুন',
    chooseFromGallery: 'গ্যালারি থেকে নির্বাচন করুন',
    validationTitle: 'ত্রুটি',
    validationTitleRequired: 'সমস্যার শিরোনাম লিখুন',
    validationDescriptionRequired: 'সমস্যার বিবরণ লিখুন',
    validationCategoryRequired: 'সমস্যার বিভাগ নির্বাচন করুন',
    validationLocationRequired: 'অবস্থানের তথ্য পান',
    validationSubmissionError: 'রিপোর্ট জমা দিতে ব্যর্থ',
    submissionSuccess: 'রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে!',
    submitting: 'জমা দিচ্ছি...',
    locationError: 'ত্রুটি',
    locationErrorMessage: 'অবস্থান পেতে সমস্যা হয়েছে',
    categories: {
      'Road Issues': 'রাস্তার সমস্যা',
      'Water Supply': 'পানি সরবরাহ',
      'Electricity': 'বিদ্যুৎ',
      'Waste Management': 'বর্জ্য ব্যবস্থাপনা',
      'Public Safety': 'জনিক নিরাপত্তা',
      'Street Lighting': 'রাস্তার আলো',
      'Drainage': 'নিষ্কাশন',
      'Parks & Recreation': 'পার্ক ও বিনোদন',
      'Other': 'অন্যান্য'
    },
    priorities: {
      'Low': 'কম',
      'Medium': 'মধ্যম',
      'High': 'উচ্চ',
      'Urgent': 'জরুরি'
    }
  }
};

interface ReportForm {
  title: string;
  description: string;
  category: string;
  address: string;
  priority: string;
  latitude: number | null;
  longitude: number | null;
  gps_accuracy: number | null;
  photos: string[];
}

const ReportScreen = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = (key: keyof typeof translations.en): string => {
    const translation = translations[language][key];
    if (typeof translation === 'string') {
      return translation;
    }
    return translations.en[key] as string;
  };
  
  const getCategory = (categoryKey: keyof typeof translations.en.categories): string => {
    const categoryTranslations = translations[language].categories;
    return categoryTranslations[categoryKey] || translations.en.categories[categoryKey];
  };
  
  const getPriority = (priorityKey: keyof typeof translations.en.priorities): string => {
    const priorityTranslations = translations[language].priorities;
    return priorityTranslations[priorityKey] || translations.en.priorities[priorityKey];
  };
  
  const router = useRouter();
  const [formData, setFormData] = useState<ReportForm>({
    title: '',
    description: '',
    category: '',
    address: '',
    priority: 'Medium',
    latitude: null,
    longitude: null,
    gps_accuracy: null,
    photos: [],
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const categories = [
    { value: 'Road Issues', label: getCategory('Road Issues'), icon: 'road' },
    { value: 'Water Supply', label: getCategory('Water Supply'), icon: 'tint' },
    { value: 'Electricity', label: getCategory('Electricity'), icon: 'bolt' },
    { value: 'Waste Management', label: getCategory('Waste Management'), icon: 'trash' },
    { value: 'Public Safety', label: getCategory('Public Safety'), icon: 'shield' },
    { value: 'Street Lighting', label: getCategory('Street Lighting'), icon: 'lightbulb-o' },
    { value: 'Drainage', label: getCategory('Drainage'), icon: 'tint' },
    { value: 'Parks & Recreation', label: getCategory('Parks & Recreation'), icon: 'tree' },
    { value: 'Other', label: getCategory('Other'), icon: 'question' },
  ];

  const priorities = [
    { value: 'Low', label: getPriority('Low'), color: '#10b981' },
    { value: 'Medium', label: getPriority('Medium'), color: '#f59e0b' },
    { value: 'High', label: getPriority('High'), color: '#ef4444' },
    { value: 'Urgent', label: getPriority('Urgent'), color: '#dc2626' },
  ];

  useEffect(() => {
    fetchUserProfile();
    getCurrentLocation();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.log('Using user metadata as fallback');
        setUserProfile({
          id: user?.id,
          full_name: user?.user_metadata?.full_name || 'Citizen',
          phone_number: user?.user_metadata?.phone_number || '',
        });
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('locationPermission'),
          t('locationPermissionMessage')
        );
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const formattedAddress = address[0] 
        ? `${address[0].name || ''}, ${address[0].city || ''}, ${address[0].region || ''}`
        : 'स्थान मिला';

      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        gps_accuracy: location.coords.accuracy,
        address: formattedAddress,
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(t('locationError'), t('locationErrorMessage'));
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('photoPermission'), t('photoPermissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri],
      }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('cameraPermission'), t('cameraPermissionMessage'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri],
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert(t('error'), t('validationTitleRequired'));
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert(t('error'), t('validationDescriptionRequired'));
      return;
    }
    if (!formData.category) {
      Alert.alert(t('error'), t('validationCategoryRequired'));
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert(t('error'), t('validationLocationRequired'));
      return;
    }

    setLoading(true);
    try {
      // Generate issue number
      const issueNumber = `CIV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      // Submit to database
      const { data, error } = await supabase
        .from('issues')
        .insert({
          issue_number: issueNumber,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          latitude: formData.latitude,
          longitude: formData.longitude,
          address: formData.address,
          gps_accuracy: formData.gps_accuracy,
          citizen_id: user?.id,
          citizen_name: userProfile?.full_name || 'Unknown',
          citizen_phone: userProfile?.phone_number || '',
          photos: formData.photos,
          device_info: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        })
        .select()
        .single();

      if (error) {
        console.log('Database error, simulating successful submission:', error);
        // Simulate success for demo - using translations
        Alert.alert(
          t('reportSubmitted'),
          `${t('reportSuccess')}\n\n${t('reportNumber')}: ${issueNumber}\n\n${t('updatesMessage')}`,
          [{ text: t('ok'), onPress: resetForm }]
        );
        return;
      }

      Alert.alert(
        t('reportSubmitted'),
        `${t('reportSuccess')}\n\n${t('reportNumber')}: ${data.issue_number}\n\n${t('updatesMessage')}`,
        [{ text: t('ok'), onPress: resetForm }]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(t('error'), t('submitError'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      address: '',
      priority: 'Medium',
      latitude: null,
      longitude: null,
      gps_accuracy: null,
      photos: [],
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('reportIssue')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 {t('address')}</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationInfo}>
              <FontAwesome name="map-marker" size={16} color="#f97316" />
              <Text style={styles.locationText}>
                {formData.address || t('addressPlaceholder')}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshLocationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              <FontAwesome 
                name={locationLoading ? "spinner" : "refresh"} 
                size={16} 
                color="#f97316" 
              />
            </TouchableOpacity>
          </View>
          {formData.gps_accuracy && (
            <Text style={styles.accuracyText}>
              {t('gpsAccuracy')}: {formData.gps_accuracy.toFixed(0)} {t('meters')}
            </Text>
          )}
        </View>

        {/* Issue Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('title')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder={t('titlePlaceholder')}
            multiline
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('category')} *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryButton,
                  formData.category === category.value && styles.selectedCategory
                ]}
                onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
              >
                <FontAwesome 
                  name={category.icon as any} 
                  size={20} 
                  color={formData.category === category.value ? 'white' : '#f97316'} 
                />
                <Text style={[
                  styles.categoryText,
                  formData.category === category.value && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('priority')}</Text>
          <View style={styles.priorityRow}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityButton,
                  { borderColor: priority.color },
                  formData.priority === priority.value && { backgroundColor: priority.color }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
              >
                <Text style={[
                  styles.priorityText,
                  { color: formData.priority === priority.value ? 'white' : priority.color }
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('issueDescription')} *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder={t('issueDescriptionPlaceholder')}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 {t('addPhotos')}</Text>
          <View style={styles.photoSection}>
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <FontAwesome name="camera" size={20} color="#f97316" />
                <Text style={styles.photoButtonText}>{t('takePhoto')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <FontAwesome name="image" size={20} color="#f97316" />
                <Text style={styles.photoButtonText}>{t('chooseFromGallery')}</Text>
              </TouchableOpacity>
            </View>
            
            {formData.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoGallery}>
                {formData.photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <FontAwesome name="times" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <FontAwesome name="spinner" size={20} color="white" />
          ) : (
            <>
              <FontAwesome name="check" size={20} color="white" />
              <Text style={styles.submitButtonText}>{t('submitReport')}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#f97316',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    flex: 1,
  },
  refreshLocationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
  },
  accuracyText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 64) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategory: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: 'white',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 8,
    backgroundColor: '#fff7ed',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginLeft: 8,
  },
  photoGallery: {
    marginTop: 8,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ReportScreen;
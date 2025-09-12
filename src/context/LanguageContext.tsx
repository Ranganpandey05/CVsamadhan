import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Home Screen
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    greeting: 'Namaste',
    ji: '',
    civisamadhan: 'CiviSamadhan',
    appName: 'CiviSamadhan',
    citizen: 'Citizen',
    description: 'Report and track civic issues in your area',
    homeDescription: 'View nearby issues and raise your voice',
    nearbyIssues: 'Nearby Issues',
    within: 'within',
    issuesFound: 'issues found',
    reportNewIssue: 'Report New Issue',
    communityIssues: 'Community Issues',
    noIssuesFound: 'No Issues Found',
    noIssuesDescription: 'No reported issues within 2.5 km of your location',
    ago: 'ago',
    away: 'away',
    hours: 'hours',
    days: 'days',
    justNow: 'Just now',
    share: 'Share',
    
    // Report Screen
    reportIssue: 'Report Issue',
    issueTitle: 'Issue Title',
    issueTitlePlaceholder: 'Brief title of the issue',
    issueDescription: 'Description',
    descriptionPlaceholder: 'Detailed description of the issue',
    category: 'Category',
    selectCategory: 'Select Category',
    priority: 'Priority',
    location: 'Location',
    getCurrentLocation: 'Get Current Location',
    takePhoto: 'Take Photo',
    selectFromGallery: 'Select from Gallery',
    submit: 'Submit Report',
    submitting: 'Submitting...',
    
    // Categories
    roadMaintenance: 'Road Maintenance',
    waterSupply: 'Water Supply',
    sanitation: 'Sanitation',
    electrical: 'Electrical',
    parksRecreation: 'Parks & Recreation',
    infrastructure: 'Infrastructure',
    
    // Priorities
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    
    // Status
    reported: 'Reported',
    acknowledged: 'Acknowledged',
    assigned: 'Assigned',
    inProgress: 'In Progress',
    completed: 'Completed',
    verified: 'Verified',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    phone: 'Phone Number',
    selectLanguage: 'Select Language',
    english: 'English',
    hindi: 'हिन्दी',
    bengali: 'বাংলা',
    
    // Profile
    profile: 'Profile',
    language: 'Language',
    settings: 'Settings',
    signOut: 'Sign Out',
    
    // Common
    cancel: 'Cancel',
    ok: 'OK',
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    retry: 'Retry',
  },
  hi: {
    // Home Screen
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'नमस्ते',
    goodEvening: 'शुभ संध्या',
    morning: 'सुप्रभात',
    afternoon: 'नमस्कार', 
    evening: 'शुभ संध्या',
    greeting: 'नमस्ते',
    ji: 'जी',
    civisamadhan: 'सिवि समाधान',
    appName: 'सिवि समाधान',
    citizen: 'नागरिक',
    description: 'अपने क्षेत्र की नागरिक समस्याओं की रिपोर्ट करें और ट्रैक करें',
    homeDescription: 'आपके आसपास की समस्याएं देखें और अपनी आवाज उठाएं',
    nearbyIssues: 'आसपास की समस्याएं',
    within: 'के अंदर',
    issuesFound: 'समस्याएं मिलीं',
    reportNewIssue: 'नई समस्या दर्ज करें',
    communityIssues: 'समुदायिक मुद्दे',
    noIssuesFound: 'कोई समस्या नहीं मिली',
    noIssuesDescription: 'आपके स्थान के 2.5 किमी के अंदर कोई रिपोर्ट नहीं है',
    ago: 'पहले',
    away: 'दूर',
    hours: 'घंटे',
    days: 'दिन',
    justNow: 'अभी-अभी',
    share: 'शेयर',
    
    // Report Screen
    reportIssue: 'समस्या दर्ज करें',
    issueTitle: 'समस्या का शीर्षक',
    issueTitlePlaceholder: 'समस्या का संक्षिप्त शीर्षक',
    issueDescription: 'विवरण',
    descriptionPlaceholder: 'समस्या का विस्तृत विवरण',
    category: 'श्रेणी',
    selectCategory: 'श्रेणी चुनें',
    priority: 'प्राथमिकता',
    location: 'स्थान',
    getCurrentLocation: 'वर्तमान स्थान प्राप्त करें',
    takePhoto: 'फोटो लें',
    selectFromGallery: 'गैलरी से चुनें',
    submit: 'रिपोर्ट सबमिट करें',
    submitting: 'सबमिट कर रहे हैं...',
    
    // Categories
    roadMaintenance: 'सड़क रखरखाव',
    waterSupply: 'पानी की आपूर्ति',
    sanitation: 'स्वच्छता',
    electrical: 'बिजली',
    parksRecreation: 'पार्क और मनोरंजन',
    infrastructure: 'बुनियादी ढांचा',
    
    // Priorities
    low: 'कम',
    medium: 'मध्यम',
    high: 'उच्च',
    urgent: 'तत्काल',
    
    // Status
    reported: 'रिपोर्ट की गई',
    acknowledged: 'स्वीकार की गई',
    assigned: 'आवंटित',
    inProgress: 'प्रगति में',
    completed: 'पूर्ण',
    verified: 'सत्यापित',
    
    // Auth
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    phone: 'फोन नंबर',
    selectLanguage: 'भाषा चुनें',
    english: 'English',
    hindi: 'हिन्दी',
    bengali: 'বাংলা',
    
    // Profile
    profile: 'प्रोफाइल',
    language: 'भाषा',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    
    // Common
    cancel: 'रद्द करें',
    ok: 'ठीक है',
    error: 'त्रुटि',
    success: 'सफलता',
    loading: 'लोड हो रहा है...',
    retry: 'पुनः प्रयास',
  },
  bn: {
    // Home Screen
    goodMorning: 'সুপ্রভাত',
    goodAfternoon: 'নমস্কার',
    goodEvening: 'শুভ সন্ধ্যা',
    morning: 'সুপ্রভাত',
    afternoon: 'নমস্কার',
    evening: 'শুভ সন্ধ্যা',
    greeting: 'নমস্তে',
    ji: '',
    civisamadhan: 'সিভি সমাধান',
    appName: 'সিভি সমাধান',
    citizen: 'নাগরিক',
    description: 'আপনার এলাকার নাগরিক সমস্যা রিপোর্ট করুন এবং ট্র্যাক করুন',
    homeDescription: 'আশেপাশের সমস্যাগুলি দেখুন এবং আপনার কণ্ঠস্বর তুলুন',
    nearbyIssues: 'কাছাকাছি সমস্যা',
    within: 'এর মধ্যে',
    issuesFound: 'সমস্যা পাওয়া গেছে',
    reportNewIssue: 'নতুন সমস্যা রিপোর্ট করুন',
    communityIssues: 'কমিউনিটি সমস্যা',
    noIssuesFound: 'কোনো সমস্যা পাওয়া যায়নি',
    noIssuesDescription: 'আপনার অবস্থানের ২.৫ কিমি এর মধ্যে কোনো রিপোর্ট নেই',
    ago: 'আগে',
    away: 'দূরে',
    hours: 'ঘন্টা',
    days: 'দিন',
    justNow: 'এখনই',
    share: 'শেয়ার',
    
    // Report Screen
    reportIssue: 'সমস্যা রিপোর্ট করুন',
    issueTitle: 'সমস্যার শিরোনাম',
    issueTitlePlaceholder: 'সমস্যার সংক্ষিপ্ত শিরোনাম',
    issueDescription: 'বিবরণ',
    descriptionPlaceholder: 'সমস্যার বিস্তারিত বিবরণ',
    category: 'বিভাগ',
    selectCategory: 'বিভাগ নির্বাচন করুন',
    priority: 'অগ্রাধিকার',
    location: 'অবস্থান',
    getCurrentLocation: 'বর্তমান অবস্থান পান',
    takePhoto: 'ছবি তুলুন',
    selectFromGallery: 'গ্যালারি থেকে নির্বাচন করুন',
    submit: 'রিপোর্ট জমা দিন',
    submitting: 'জমা দিচ্ছি...',
    
    // Categories
    roadMaintenance: 'রাস্তা রক্ষণাবেক্ষণ',
    waterSupply: 'পানি সরবরাহ',
    sanitation: 'স্যানিটেশন',
    electrical: 'বিদ্যুৎ',
    parksRecreation: 'পার্ক এবং বিনোদন',
    infrastructure: 'অবকাঠামো',
    
    // Priorities
    low: 'কম',
    medium: 'মধ্যম',
    high: 'উচ্চ',
    urgent: 'জরুরি',
    
    // Status
    reported: 'রিপোর্ট করা হয়েছে',
    acknowledged: 'স্বীকার করা হয়েছে',
    assigned: 'বরাদ্দ করা হয়েছে',
    inProgress: 'চলমান',
    completed: 'সম্পন্ন',
    verified: 'যাচাই করা হয়েছে',
    
    // Auth
    signIn: 'সাইন ইন',
    signUp: 'সাইন আপ',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    fullName: 'পূর্ণ নাম',
    phone: 'ফোন নম্বর',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    english: 'English',
    hindi: 'हिन्दी',
    bengali: 'বাংলা',
    
    // Profile
    profile: 'প্রোফাইল',
    language: 'ভাষা',
    settings: 'সেটিংস',
    signOut: 'সাইন আউট',
    
    // Common
    cancel: 'বাতিল',
    ok: 'ঠিক আছে',
    error: 'ত্রুটি',
    success: 'সফল',
    loading: 'লোড হচ্ছে...',
    retry: 'আবার চেষ্টা করুন',
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi' || savedLanguage === 'bn')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
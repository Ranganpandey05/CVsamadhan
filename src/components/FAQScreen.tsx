import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    faq: 'Frequently Asked Questions',
    search: 'Search FAQs...',
    categories: 'Categories',
    general: 'General',
    account: 'Account',
    tasks: 'Tasks & Reports',
    technical: 'Technical Support',
    privacy: 'Privacy & Security',
    payments: 'Payments & Billing',
    contactSupport: 'Contact Support',
    stillNeedHelp: 'Still need help?',
    contactUs: 'Contact us for more assistance',
    noResults: 'No FAQs found matching your search',
    tryDifferent: 'Try different keywords',
  },
  hi: {
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    search: 'FAQ खोजें...',
    categories: 'श्रेणियां',
    general: 'सामान्य',
    account: 'खाता',
    tasks: 'कार्य और रिपोर्ट',
    technical: 'तकनीकी सहायता',
    privacy: 'गोपनीयता और सुरक्षा',
    payments: 'भुगतान और बिलिंग',
    contactSupport: 'सहायता से संपर्क करें',
    stillNeedHelp: 'अभी भी मदद चाहिए?',
    contactUs: 'अधिक सहायता के लिए हमसे संपर्क करें',
    noResults: 'आपकी खोज से मेल खाने वाले कोई FAQ नहीं मिले',
    tryDifferent: 'अलग कीवर्ड का प्रयास करें',
  },
  bn: {
    faq: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
    search: 'FAQ অনুসন্ধান করুন...',
    categories: 'বিভাগসমূহ',
    general: 'সাধারণ',
    account: 'অ্যাকাউন্ট',
    tasks: 'কাজ ও রিপোর্ট',
    technical: 'প্রযুক্তিগত সহায়তা',
    privacy: 'গোপনীয়তা ও নিরাপত্তা',
    payments: 'পেমেন্ট ও বিলিং',
    contactSupport: 'সহায়তার সাথে যোগাযোগ',
    stillNeedHelp: 'এখনও সাহায্য প্রয়োজন?',
    contactUs: 'আরও সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন',
    noResults: 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো FAQ পাওয়া যায়নি',
    tryDifferent: 'ভিন্ন কীওয়ার্ড চেষ্টা করুন',
  },
};

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const FAQScreen = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const t = (key: keyof typeof translations.en): string => {
    return (translations as any)[language][key] || translations.en[key];
  };

  const faqs: FAQ[] = [
    // General
    {
      id: '1',
      question: 'What is CiviSamadhan?',
      answer: 'CiviSamadhan is a digital governance platform that connects citizens with government services. Citizens can report issues, track progress, and communicate with officials while workers can manage tasks efficiently.',
      category: 'general',
      tags: ['app', 'purpose', 'government', 'services'],
    },
    {
      id: '2',
      question: 'How do I get started?',
      answer: 'Download the app, create an account by choosing either Citizen or Worker role, complete your profile, and start reporting issues or managing tasks based on your role.',
      category: 'general',
      tags: ['getting started', 'signup', 'registration'],
    },
    {
      id: '3',
      question: 'Is the app free to use?',
      answer: 'Yes, CiviSamadhan is completely free for all citizens and government workers. There are no hidden charges or subscription fees.',
      category: 'general',
      tags: ['free', 'cost', 'pricing'],
    },
    
    // Account
    {
      id: '4',
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password", enter your email address, and follow the instructions sent to your email to reset your password.',
      category: 'account',
      tags: ['password', 'reset', 'forgot', 'login'],
    },
    {
      id: '5',
      question: 'Can I change my role from Citizen to Worker?',
      answer: 'Role changes require approval from the system administrator. Contact support with your employee ID and department details to request a role change.',
      category: 'account',
      tags: ['role', 'change', 'worker', 'citizen'],
    },
    {
      id: '6',
      question: 'How do I update my profile information?',
      answer: 'Go to Profile > Edit Profile. You can update your name, phone number, and other details. Some changes may require verification.',
      category: 'account',
      tags: ['profile', 'update', 'edit', 'personal information'],
    },

    // Tasks & Reports
    {
      id: '7',
      question: 'How do I report an issue?',
      answer: 'Tap the "Report" tab, select the issue category, add a description, attach photos if needed, and submit. You\'ll receive a tracking ID for follow-up.',
      category: 'tasks',
      tags: ['report', 'issue', 'problem', 'complaint'],
    },
    {
      id: '8',
      question: 'How can I track my reported issues?',
      answer: 'Go to the Dashboard or Reports section to see all your submitted reports with their current status: Pending, In Progress, or Resolved.',
      category: 'tasks',
      tags: ['track', 'status', 'progress', 'reports'],
    },
    {
      id: '9',
      question: 'What happens after I report an issue?',
      answer: 'Your report is automatically assigned to the relevant department. A worker will be notified and you\'ll receive updates as they work on resolving the issue.',
      category: 'tasks',
      tags: ['workflow', 'assignment', 'process', 'notifications'],
    },

    // Technical
    {
      id: '10',
      question: 'The app is running slowly. What should I do?',
      answer: 'Try closing and reopening the app, check your internet connection, clear app cache, or restart your device. If problems persist, contact technical support.',
      category: 'technical',
      tags: ['slow', 'performance', 'troubleshooting', 'bugs'],
    },
    {
      id: '11',
      question: 'I can\'t upload photos. What\'s wrong?',
      answer: 'Check if the app has camera and storage permissions. Ensure your photos are under 10MB each. Try using a different image format (JPG, PNG).',
      category: 'technical',
      tags: ['photos', 'upload', 'camera', 'permissions'],
    },
    {
      id: '12',
      question: 'Why am I not receiving notifications?',
      answer: 'Check if notifications are enabled in your device settings and app settings. Ensure the app is not in battery optimization mode.',
      category: 'technical',
      tags: ['notifications', 'alerts', 'settings', 'permissions'],
    },

    // Privacy
    {
      id: '13',
      question: 'How is my personal data protected?',
      answer: 'We use industry-standard encryption and security measures. Your data is stored securely and only used for service delivery. Read our Privacy Policy for details.',
      category: 'privacy',
      tags: ['privacy', 'security', 'data protection', 'encryption'],
    },
    {
      id: '14',
      question: 'Who can see my reported issues?',
      answer: 'Only relevant government officials and assigned workers can view your reports. Personal information is kept confidential and used only for resolution purposes.',
      category: 'privacy',
      tags: ['visibility', 'confidential', 'access', 'officials'],
    },
    {
      id: '15',
      question: 'Can I delete my account and data?',
      answer: 'Yes, you can request account deletion from the Profile settings. This will permanently remove your account and associated data from our systems.',
      category: 'privacy',
      tags: ['delete', 'account', 'data removal', 'permanent'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: 'list' },
    { id: 'general', name: t('general'), icon: 'info-circle' },
    { id: 'account', name: t('account'), icon: 'user' },
    { id: 'tasks', name: t('tasks'), icon: 'tasks' },
    { id: 'technical', name: t('technical'), icon: 'cog' },
    { id: 'privacy', name: t('privacy'), icon: 'shield' },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleContactSupport = () => {
    const email = 'support@civisamadhan.com';
    const subject = 'Support Request';
    const body = 'Hi, I need help with...';
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('faq')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <FontAwesome name="times" size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>{t('categories')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <FontAwesome 
                  name={category.icon as any} 
                  size={14} 
                  color={selectedCategory === category.id ? 'white' : '#6b7280'} 
                />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ List */}
        <View style={styles.faqContainer}>
          {filteredFAQs.length === 0 ? (
            <View style={styles.noResults}>
              <FontAwesome name="search" size={40} color="#d1d5db" />
              <Text style={styles.noResultsTitle}>{t('noResults')}</Text>
              <Text style={styles.noResultsSubtitle}>{t('tryDifferent')}</Text>
            </View>
          ) : (
            filteredFAQs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleExpanded(faq.id)}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <FontAwesome
                    name={expandedItems.has(faq.id) ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#6b7280"
                  />
                </TouchableOpacity>
                {expandedItems.has(faq.id) && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    <View style={styles.faqTags}>
                      {faq.tags.map((tag, index) => (
                        <View key={index} style={styles.faqTag}>
                          <Text style={styles.faqTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>{t('stillNeedHelp')}</Text>
          <Text style={styles.supportSubtitle}>{t('contactUs')}</Text>
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <FontAwesome name="envelope" size={16} color="white" />
            <Text style={styles.supportButtonText}>{t('contactSupport')}</Text>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1565C0',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  faqContainer: {
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  faqTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  faqTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  faqTagText: {
    fontSize: 12,
    color: '#1565C0',
    fontWeight: '500',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  supportSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FAQScreen;
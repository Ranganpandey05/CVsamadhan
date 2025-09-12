import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '../context/LanguageContext';

const { height: screenHeight } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  sender: 'worker' | 'admin' | 'system';
  message: string;
  timestamp: string;
  senderName: string;
  type: 'text' | 'image' | 'system';
}

interface TaskChatProps {
  taskId: string;
  onClose: () => void;
}

const translations = {
  en: {
    taskChat: 'Task Communication',
    typeMessage: 'Type your message...',
    send: 'Send',
    online: 'Online',
    taskUpdate: 'Task Update',
    photoSent: 'Photo sent',
    typing: 'typing...',
  },
  hi: {
    taskChat: 'कार्य संचार',
    typeMessage: 'अपना संदेश लिखें...',
    send: 'भेजें',
    online: 'ऑनलाइन',
    taskUpdate: 'कार्य अपडेट',
    photoSent: 'फोटो भेजी गई',
    typing: 'टाइप कर रहे हैं...',
  },
  bn: {
    taskChat: 'কাজের যোগাযোগ',
    typeMessage: 'আপনার বার্তা টাইপ করুন...',
    send: 'পাঠান',
    online: 'অনলাইন',
    taskUpdate: 'কাজের আপডেট',
    photoSent: 'ছবি পাঠানো হয়েছে',
    typing: 'টাইপ করছেন...',
  },
};

const TaskChat: React.FC<TaskChatProps> = ({ taskId, onClose }) => {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'admin',
      message: 'Welcome! Please provide updates on the water pipeline task.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      senderName: 'Kolkata Municipal Admin',
      type: 'text',
    },
    {
      id: '2',
      sender: 'worker',
      message: 'Task started. Will provide updates every hour.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      senderName: 'You',
      type: 'text',
    },
    {
      id: '3',
      sender: 'system',
      message: 'Task status changed to In Progress',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      senderName: 'System',
      type: 'system',
    },
  ]);
  const [keyboardHeight] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key];
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'worker',
        message: message.trim(),
        timestamp: new Date().toISOString(),
        senderName: 'You',
        type: 'text',
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate admin response after 2 seconds
      setTimeout(() => {
        const adminResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'admin',
          message: 'Thank you for the update. Keep up the good work!',
          timestamp: new Date().toISOString(),
          senderName: 'Municipal Admin',
          type: 'text',
        };
        setMessages(prev => [...prev, adminResponse]);
      }, 2000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStyle = (sender: string) => {
    switch (sender) {
      case 'worker':
        return styles.workerMessage;
      case 'admin':
        return styles.adminMessage;
      case 'system':
        return styles.systemMessage;
      default:
        return styles.adminMessage;
    }
  };

  const getMessageTextStyle = (sender: string) => {
    switch (sender) {
      case 'worker':
        return styles.workerMessageText;
      case 'admin':
        return styles.adminMessageText;
      case 'system':
        return styles.systemMessageText;
      default:
        return styles.adminMessageText;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{t('taskChat')}</Text>
          <Text style={styles.headerSubtitle}>Task #{taskId}</Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineIndicator} />
          <Text style={styles.onlineText}>{t('online')}</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageContainer, msg.sender === 'worker' ? styles.workerContainer : styles.otherContainer]}>
              {msg.sender !== 'worker' && (
                <Text style={styles.senderName}>{msg.senderName}</Text>
              )}
              <View style={getMessageStyle(msg.sender)}>
                <Text style={getMessageTextStyle(msg.sender)}>{msg.message}</Text>
                <Text style={[styles.timestamp, msg.sender === 'worker' ? styles.workerTimestamp : styles.otherTimestamp]}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <Animated.View style={[styles.inputContainer, { marginBottom: keyboardHeight }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder={t('typeMessage')}
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity 
              style={[styles.sendButton, message.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <FontAwesome 
                name="send" 
                size={18} 
                color={message.trim() ? "white" : "#9ca3af"} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  workerContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
    marginLeft: 12,
  },
  workerMessage: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  adminMessage: {
    backgroundColor: 'white',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  systemMessage: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  workerMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 20,
  },
  adminMessageText: {
    color: '#1f2937',
    fontSize: 16,
    lineHeight: 20,
  },
  systemMessageText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  workerTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#9ca3af',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#2563eb',
  },
  sendButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
});

export default TaskChat;
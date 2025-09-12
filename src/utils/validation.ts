// Form Validation Utility
export const validateForm = {
  email: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  fullName: (name: string): string | null => {
    if (!name) return 'Full name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return null;
  },

  username: (username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  },

  phoneNumber: (phone: string): string | null => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) return 'Please enter a valid phone number';
    return null;
  },

  reportTitle: (title: string): string | null => {
    if (!title.trim()) return 'Title is required';
    if (title.length < 5) return 'Title must be at least 5 characters';
    if (title.length > 100) return 'Title cannot exceed 100 characters';
    return null;
  },

  reportDescription: (description: string): string | null => {
    if (!description.trim()) return 'Description is required';
    if (description.length < 10) return 'Description must be at least 10 characters';
    if (description.length > 500) return 'Description cannot exceed 500 characters';
    return null;
  },

  location: (location: string): string | null => {
    if (!location.trim()) return 'Location is required';
    if (location.length < 5) return 'Please provide a more detailed location';
    return null;
  },

  category: (category: string): string | null => {
    if (!category) return 'Please select a category';
    return null;
  }
};

// Input Sanitization
export const sanitizeInput = {
  text: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },

  email: (email: string): string => {
    return email.toLowerCase().trim();
  },

  username: (username: string): string => {
    return username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  },

  phoneNumber: (phone: string): string => {
    return phone.replace(/[^\d\+\-\(\)\s]/g, '');
  }
};

// Error Handler Utility
export const handleError = (error: any, context: string = 'Operation'): string => {
  console.error(`${context} error:`, error);
  
  const message = error?.message || String(error) || 'Unknown error';
  
  // Network errors
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'Network connection error. Please check your internet and try again.';
  }
  
  // Authentication errors
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  
  if (message.includes('email_not_confirmed') || message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link.';
  }
  
  if (message.includes('User already registered')) {
    return 'An account with this email already exists.';
  }
  
  if (message.includes('Too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  
  // Supabase errors
  if (message.includes('duplicate key value')) {
    return 'This information is already in use.';
  }
  
  if (message.includes('permission denied')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('Request timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Generic fallback
  return `${context} failed. Please try again.`;
};

// Rate Limiting Hook
import { useState, useCallback } from 'react';

export const useRateLimit = (delay: number = 1000) => {
  const [isLimited, setIsLimited] = useState(false);
  
  const execute = useCallback((fn: Function) => {
    if (isLimited) {
      console.warn('Rate limit active, request ignored');
      return;
    }
    
    setIsLimited(true);
    fn();
    
    setTimeout(() => {
      setIsLimited(false);
    }, delay);
  }, [isLimited, delay]);
  
  return { execute, isLimited };
};

// Security utilities
export const security = {
  // Generate secure random string
  generateSecureId: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },
  
  // Basic XSS protection
  escapeHtml: (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },
  
  // Check if string contains suspicious content
  isSafeInput: (input: string): boolean => {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\(/i,
      /expression\(/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(input));
  }
};

// Form validation hook
export const useFormValidation = (validationRules: { [key: string]: (value: any) => string | null }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const validateField = useCallback((field: string, value: any): boolean => {
    const rule = validationRules[field];
    if (!rule) return true;
    
    const error = rule(value);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
    
    return !error;
  }, [validationRules]);
  
  const validateAll = useCallback((data: { [key: string]: any }): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const error = rule(data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [validationRules]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  return {
    errors,
    validateField,
    validateAll,
    clearErrors,
    hasErrors: Object.values(errors).some(error => error)
  };
};
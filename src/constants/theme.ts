// Professional Indian Government UI Theme
export const theme = {
  colors: {
    // Primary - Modern Government Blue
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    
    // Secondary - Indian Flag Saffron (Modern)
    secondary: '#f97316',
    secondaryLight: '#fb923c',
    secondaryDark: '#ea580c',
    
    // Accent - Success Green (Modern)
    accent: '#059669',
    accentLight: '#10b981',
    accentDark: '#047857',
    
    // Government Official Colors
    govBlue: '#2563eb',
    govGreen: '#059669',
    govOrange: '#f97316',
    
    // Status Colors
    success: '#059669',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#2563eb',
    
    // Priority Colors
    urgent: '#dc2626',
    high: '#f59e0b',
    medium: '#2563eb',
    low: '#059669',
    
    // Neutral Colors
    white: '#FFFFFF',
    black: '#000000',
    
    // Professional Gray Scale (Updated)
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    
    // Text Colors
    textPrimary: '#212121',
    textSecondary: '#616161',
    textDisabled: '#9E9E9E',
    textHint: '#BDBDBD',
    text: '#333333',
    
    // Background Colors
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F8F9FA',
    
    // Status Specific
    reported: '#F57C00',
    acknowledged: '#7B1FA2',
    assigned: '#1976D2',
    inProgress: '#00ACC1',
    completed: '#2E7D32',
    verified: '#689F38',
    
    // Map Colors
    mapPin: '#D32F2F',
    userLocation: '#1976D2',
    selectedPin: '#FF6B35',
    
    // Transparent overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 50,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 18,
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  components: {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    button: {
      primary: {
        backgroundColor: '#FF6B35',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      },
      secondary: {
        backgroundColor: '#138808',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FF6B35',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    
    input: {
      backgroundColor: '#F5F5F5',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 16,
      color: '#212121',
    },
    
    header: {
      backgroundColor: '#FF6B35',
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
  },
};

// Helper functions for consistent styling
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'reported': return theme.colors.reported;
    case 'acknowledged': return theme.colors.acknowledged;
    case 'assigned': return theme.colors.assigned;
    case 'in progress': return theme.colors.inProgress;
    case 'completed': return theme.colors.completed;
    case 'verified': return theme.colors.verified;
    default: return theme.colors.gray500;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent': return theme.colors.urgent;
    case 'high': return theme.colors.high;
    case 'medium': return theme.colors.medium;
    case 'low': return theme.colors.low;
    default: return theme.colors.gray500;
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'road maintenance': return 'road';
    case 'water supply': return 'tint';
    case 'sanitation': return 'trash';
    case 'electrical': return 'bolt';
    case 'parks & recreation': return 'tree';
    case 'infrastructure': return 'building';
    default: return 'exclamation-circle';
  }
};
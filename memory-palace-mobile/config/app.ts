// App Configuration
// Update this IP address to match your backend server
export const APP_CONFIG = {
  // Backend API URL - Update this to your backend IP address
  API_BASE_URL: "http://192.168.0.233:8000",
  
  // App Settings
  APP_NAME: "Memory Palace",
  VERSION: "1.0.0",
  
  // UI Settings
  COLORS: {
    primary: "#3498db",
    secondary: "#e74c3c", 
    success: "#27ae60",
    warning: "#f39c12",
    purple: "#9b59b6",
    background: "#f8f9fa",
    cardBackground: "#ffffff",
    text: "#2c3e50",
    textSecondary: "#7f8c8d",
    textLight: "#95a5a6",
    border: "#ddd",
    placeholder: "#ecf0f1",
  },
  
  // Patient View Settings
  PATIENT_VIEW: {
    backgroundColor: "#fef9e7", // Warm, calming background
    largeButtonSize: 60,
    fontSize: {
      title: 32,
      subtitle: 18,
      body: 16,
    }
  },
  
  // Upload Settings
  UPLOAD: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxAudioSize: 10 * 1024 * 1024, // 10MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/heic'],
    supportedVideoTypes: ['video/mp4', 'video/mov'],
    supportedAudioTypes: ['audio/m4a', 'audio/mp3', 'audio/wav'],
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${APP_CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

// Helper function to get image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${APP_CONFIG.API_BASE_URL}${imagePath}`;
};
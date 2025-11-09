# Memory Palace Mobile App �

A beautiful React Native mobile app for the Memory Palace project - helping families preserve and share memories with loved ones, especially those with memory challenges.

## 🌟 Features

### Family Dashboard
- **Upload Memories**: Add photos, videos, audio recordings, and text stories
- **AI Processing**: Automatic image captioning and audio transcription
- **Face Detection**: Identify and tag people in photos
- **Story Generation**: AI creates personalized narratives from your memories
- **Search**: Find memories by people or events

### Patient View
- **Simple Interface**: Large buttons and clear navigation designed for accessibility
- **Memory Playback**: View photos and listen to AI-generated stories
- **Audio Narration**: Text-to-speech for all stories
- **Gentle Experience**: Warm, calming design focused on emotional comfort

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Your Memory Palace backend running (see backend folder)

### Installation

1. **Install dependencies**
   ```bash
   cd memory-palace-mobile
   npm install
   ```

2. **Configure Backend Connection**
   
   Update the backend IP address in these files:
   - `app/(tabs)/index.tsx` - Line 15
   - `app/(tabs)/explore.tsx` - Line 15
   - `app/upload.tsx` - Line 25
   - `app/memory/[id].tsx` - Line 25
   - `app/search.tsx` - Line 15
   - `services/api.ts` - Line 3
   
   Replace `"http://192.168.1.100:8000"` with your actual backend IP address.

3. **Start the app**
   ```bash
   npx expo start
   ```

4. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 📱 App Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Family Dashboard - Main memory list
│   └── explore.tsx        # Patient View - Simple memory viewer
├── upload.tsx             # Upload new memories
├── memory/[id].tsx        # Memory details and editing
├── search.tsx             # Search memories
└── _layout.tsx            # Navigation setup

services/
└── api.ts                 # Backend API service
```

## 🎯 Usage Guide

### For Family Members (Caregivers)

1. **Adding Memories**
   - Tap "Add New Memory" on the home screen
   - Upload photos, record audio, or add videos
   - Write optional text stories
   - Submit to process with AI

2. **Managing Memories**
   - View AI-generated captions for photos
   - Tag people in detected faces
   - Generate personalized stories
   - Listen to text-to-speech narration

3. **Searching**
   - Use the search bar to find specific memories
   - Search by person names or events

### For Patients

1. **Simple Navigation**
   - Switch to "Patient View" tab
   - Large, clear interface with minimal options

2. **Viewing Memories**
   - Tap on memory thumbnails to select
   - View photos in large, clear format
   - Listen to AI-generated stories

3. **Audio Playback**
   - Large "Play Story" button
   - Stories are narrated with warm, clear voice

## 🔧 Configuration

### Backend Connection
Make sure your backend is running and accessible. Update the IP address in all files mentioned above.

### Permissions
The app requires these permissions:
- **Camera**: For taking photos
- **Photo Library**: For selecting existing photos
- **Microphone**: For recording audio
- **Storage**: For saving and accessing files

## 🎨 Design Philosophy

- **Accessibility First**: Large buttons, clear text, high contrast
- **Emotional Warmth**: Soft colors, gentle animations, caring language
- **Simplicity**: Minimal cognitive load, especially for patient view
- **Privacy**: All processing happens locally on your network

## 🛠 Development

### Adding New Features
1. Create new screens in the `app/` directory
2. Update navigation in `app/_layout.tsx`
3. Add API calls in `services/api.ts`
4. Follow the existing design patterns

### Customization
- Colors and themes: `constants/theme.ts`
- Components: `components/` directory
- Icons: Using Ionicons from `@expo/vector-icons`

## 📋 API Endpoints Expected

Your backend should provide these endpoints:
- `GET /memories` - List all memories
- `GET /memory/{id}` - Get specific memory details
- `POST /upload` - Upload new memory files
- `POST /memory/{id}/faces` - Save face labels
- `POST /memory/{id}/generate-story` - Generate AI story
- `GET /memory/{id}/audio` - Get story audio
- `GET /search?query=...` - Search memories

## 🚨 Troubleshooting

### Common Issues

1. **Can't connect to backend**
   - Check if backend is running on correct port
   - Verify IP address in configuration files
   - Ensure devices are on same network

2. **Permissions denied**
   - Grant camera/microphone permissions in device settings
   - Restart the app after granting permissions

3. **Audio not playing**
   - Check device volume
   - Ensure backend audio endpoint is working
   - Try restarting the app

### Getting Help
- Check the console logs in Expo CLI
- Use `npx expo doctor` to diagnose issues
- Ensure all dependencies are properly installed

## 🎉 Demo Flow

Perfect for hackathons and presentations:

1. **Family uploads a photo** → AI detects faces and generates captions
2. **Family tags people** → "Mom", "Dad", "Grandma"
3. **Generate story** → AI creates warm, personal narrative
4. **Switch to Patient View** → Simple, accessible interface
5. **Play memory** → Patient enjoys photos and narrated story

## 📄 License

This project is part of the Memory Palace system designed to help families preserve and share precious memories.

---

*Built with ❤️ for families and their precious memories*
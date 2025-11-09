# 🚀 Quick Start Guide - Memory Palace Mobile

Get your Memory Palace mobile app running in 5 minutes!

## Step 1: Prerequisites ✅

Make sure you have:
- [ ] Node.js installed (v16+)
- [ ] Your Memory Palace backend running
- [ ] Expo Go app on your phone (iOS/Android)

## Step 2: Install Dependencies 📦

```bash
cd memory-palace-mobile
npm install
```

## Step 3: Configure Backend Connection 🔧

**Option A: Use Setup Script (Recommended)**
```bash
npm run setup
```
Follow the prompts to enter your backend IP address.

**Option B: Manual Configuration**
Edit `config/app.ts` and update the `API_BASE_URL` with your backend IP:
```typescript
API_BASE_URL: "http://YOUR_BACKEND_IP:8000"
```

## Step 4: Start the App 📱

```bash
npm start
```

## Step 5: Connect Your Device 📲

1. Open Expo Go app on your phone
2. Scan the QR code from your terminal
3. Wait for the app to load

## Step 6: Test the Connection 🧪

1. Tap "Add New Memory" 
2. Upload a test photo
3. Check if it appears in your backend

## 🎉 You're Ready!

Your Memory Palace mobile app is now running! 

### Family Dashboard Features:
- ✅ Upload photos, videos, audio
- ✅ AI image captioning  
- ✅ Face detection and tagging
- ✅ Story generation
- ✅ Search memories

### Patient View Features:
- ✅ Simple, accessible interface
- ✅ Large buttons and text
- ✅ Audio story playback
- ✅ Warm, calming design

## 🚨 Troubleshooting

**Can't connect to backend?**
- Ensure backend is running: `curl http://YOUR_IP:8000/memories`
- Check both devices are on same WiFi network
- Verify firewall settings

**Permissions issues?**
- Grant camera/microphone permissions in device settings
- Restart the app after granting permissions

**App won't load?**
- Run `npx expo doctor` to check for issues
- Clear Expo cache: `npx expo start --clear`

## 📞 Need Help?

Check the full README.md for detailed documentation and troubleshooting guides.

---

**Happy memory making! 💝**
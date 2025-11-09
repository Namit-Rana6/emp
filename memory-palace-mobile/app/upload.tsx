import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

// Type definitions
type ImageAsset = {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  fileName?: string;
};

type VideoAsset = {
  uri: string;
  duration?: number;
  type?: string;
  fileName?: string;
};

type AudioAsset = {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
};

export default function UploadScreen() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoAsset | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AudioAsset | null>(null);
  const [textStory, setTextStory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Replace with your backend IP - Use your actual local IP
  const BASE_URL = "http://192.168.0.233:8000"; // Update this to your backend IP

  // Test connection to backend
  const testConnection = async () => {
    try {
      console.log('Testing connection to:', BASE_URL);
      const response = await fetch(`${BASE_URL}/health`, { timeout: 5000 });
      if (response.ok) {
        const data = await response.json();
        console.log('Connection test successful:', data);
        Alert.alert('Connection OK', 'Successfully connected to backend!');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('Connection test failed:', error);
      Alert.alert(
        'Connection Error', 
        `Cannot connect to backend at ${BASE_URL}\n\nPlease check:\n1. Backend is running\n2. IP address is correct\n3. Both devices on same WiFi`
      );
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const imageAssets: ImageAsset[] = result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName || `image_${Date.now()}.jpg`
      }));
      setSelectedImages(imageAssets);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImageAssets: ImageAsset[] = result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`
      }));
      setSelectedImages([...selectedImages, ...newImageAssets]);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const videoAsset: VideoAsset = {
        uri: result.assets[0].uri,
        duration: result.assets[0].duration,
        type: result.assets[0].type,
        fileName: result.assets[0].fileName || `video_${Date.now()}.mp4`
      };
      setSelectedVideo(videoAsset);
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const audioAsset: AudioAsset = {
          uri: result.assets[0].uri,
          name: result.assets[0].name || `audio_${Date.now()}.m4a`,
          type: result.assets[0].mimeType,
          size: result.assets[0].size
        };
        setSelectedAudio(audioAsset);
      }
    } catch (error) {
      console.log('Audio picker error:', error);
      Alert.alert('Error', 'Could not pick audio file. Please try again.');
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permissions to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.log('Recording error:', error);
      Alert.alert('Recording Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const audioAsset: AudioAsset = {
          uri,
          name: `recorded_audio_${Date.now()}.m4a`,
          type: 'audio/m4a'
        };
        setSelectedAudio(audioAsset);
      }
      setRecording(null);
    } catch (error) {
      console.log('Stop recording error:', error);
      Alert.alert('Recording Error', 'Could not save recording. Please try again.');
      setIsRecording(false);
      setRecording(null);
    }
  };

  const uploadMemory = async () => {
    if (selectedImages.length === 0 && !selectedVideo && !selectedAudio && !textStory.trim()) {
      Alert.alert('No Content', 'Please add at least one photo, video, audio, or text story.');
      return;
    }

    setIsUploading(true);

    try {
      console.log('Starting upload...');
      console.log('Images:', selectedImages.length);
      console.log('Video:', !!selectedVideo);
      console.log('Audio:', !!selectedAudio);
      console.log('Story:', !!textStory.trim());

      const formData = new FormData();

      // Add images (backend expects 'photos' field)
      selectedImages.forEach((image, index) => {
        const imageFile = {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `image_${index}.jpg`,
        };
        console.log(`Adding image ${index}:`, imageFile.name);
        formData.append('photos', imageFile as any);
      });

      // Add video
      if (selectedVideo) {
        const videoFile = {
          uri: selectedVideo.uri,
          type: selectedVideo.type || 'video/mp4',
          name: selectedVideo.fileName || 'video.mp4',
        };
        console.log('Adding video:', videoFile.name);
        formData.append('video', videoFile as any);
      }

      // Add audio
      if (selectedAudio) {
        const audioFile = {
          uri: selectedAudio.uri,
          type: selectedAudio.type || 'audio/m4a',
          name: selectedAudio.name || 'audio.m4a',
        };
        console.log('Adding audio:', audioFile.name);
        formData.append('audio', audioFile as any);
      }

      // Add text story (backend expects 'story' field)
      if (textStory.trim()) {
        console.log('Adding story text');
        formData.append('story', textStory.trim());
      }

      console.log('Uploading to:', `${BASE_URL}/upload`);
      
      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let FormData set it automatically with boundary
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload success:', result);
        
        // Clear form
        setSelectedImages([]);
        setSelectedVideo(null);
        setSelectedAudio(null);
        setTextStory('');
        
        Alert.alert(
          'Success! 🎉',
          'Memory uploaded successfully. You can now view it in your memories.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        const errorText = await response.text();
        console.log('Upload error response:', errorText);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert(
        'Upload Error', 
        `Could not upload memory. Please check your connection and try again.\n\nError: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Memory</Text>
          <Text style={styles.subtitle}>Upload photos, videos, audio, or write a story</Text>
          
          {/* Debug: Test Connection Button */}
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Ionicons name="wifi" size={16} color="#3498db" />
            <Text style={styles.testButtonText}>Test Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Photos</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#3498db" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pickImages}>
              <Ionicons name="images" size={24} color="#3498db" />
              <Text style={styles.actionButtonText}>Choose Photos</Text>
            </TouchableOpacity>
          </View>
          
          {selectedImages.length > 0 && (
            <ScrollView horizontal style={styles.previewContainer}>
              {selectedImages.map((image, index) => (
                <Image key={index} source={{ uri: image.uri }} style={styles.imagePreview} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Video Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎥 Video</Text>
          <TouchableOpacity style={styles.actionButton} onPress={pickVideo}>
            <Ionicons name="videocam" size={24} color="#e74c3c" />
            <Text style={styles.actionButtonText}>Choose Video</Text>
          </TouchableOpacity>
          
          {selectedVideo && (
            <View style={styles.filePreview}>
              <Ionicons name="videocam" size={20} color="#e74c3c" />
              <Text style={styles.fileName}>Video selected</Text>
            </View>
          )}
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 Audio</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, isRecording && styles.recordingButton]} 
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={24} 
                color={isRecording ? "#e74c3c" : "#f39c12"} 
              />
              <Text style={styles.actionButtonText}>
                {isRecording ? "Stop Recording" : "Record Audio"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pickAudio}>
              <Ionicons name="musical-notes" size={24} color="#f39c12" />
              <Text style={styles.actionButtonText}>Choose Audio</Text>
            </TouchableOpacity>
          </View>
          
          {selectedAudio && (
            <View style={styles.filePreview}>
              <Ionicons name="musical-notes" size={20} color="#f39c12" />
              <Text style={styles.fileName}>{selectedAudio.name || 'Audio file'}</Text>
            </View>
          )}
        </View>

        {/* Text Story Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Text Story</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Write a story about this memory..."
            multiline
            numberOfLines={4}
            value={textStory}
            onChangeText={setTextStory}
          />
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, isUploading && styles.uploadingButton]}
          onPress={uploadMemory}
          disabled={isUploading}
        >
          <Ionicons name="cloud-upload" size={24} color="white" />
          <Text style={styles.uploadButtonText}>
            {isUploading ? "Uploading..." : "Upload Memory"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  previewContainer: {
    marginTop: 16,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadingButton: {
    backgroundColor: '#95a5a6',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
  },
  testButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
});
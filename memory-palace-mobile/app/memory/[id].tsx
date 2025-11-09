import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function MemoryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [faces, setFaces] = useState([]);
  const [faceLabels, setFaceLabels] = useState({});
  const [story, setStory] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  // Replace with your backend IP - Use your actual local IP
  const BASE_URL = "http://192.168.0.233:8000"; // Update this to your backend IP

  useEffect(() => {
    fetchMemoryDetails();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [id]);

  const fetchMemoryDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/memory/${id}`);
      const data = await response.json();
      setMemory(data);
      setFaces(data.faces || []);
      setStory(data.story || '');
      
      // Initialize face labels
      const labels = {};
      data.faces?.forEach((face, index) => {
        labels[index] = face.label || '';
      });
      setFaceLabels(labels);
    } catch (error) {
      console.log('Fetch error:', error);
      Alert.alert('Error', 'Could not load memory details.');
    } finally {
      setLoading(false);
    }
  };

  const playStory = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Check if audio is available
      const response = await fetch(`${BASE_URL}/memory/${id}/audio`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.audio_url) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: `${BASE_URL}${data.audio_url}` },
            { shouldPlay: true }
          );
          
          setSound(newSound);
          setIsPlaying(true);

          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        } else {
          Alert.alert(
            "Audio Not Available", 
            "Audio generation is not implemented in this demo. You can read the story text above.",
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "Audio Not Available", 
          "Audio generation is not implemented in this demo version.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log('Audio playback error:', error);
      Alert.alert(
        'Audio Not Available', 
        'Audio playback is not available in this demo version. You can read the story text instead.',
        [{ text: "OK" }]
      );
    }
  };

  const stopStory = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const saveFaceLabels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/memory/${id}/faces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labels: faceLabels }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Face labels saved successfully!');
      } else {
        throw new Error('Failed to save labels');
      }
    } catch (error) {
      console.log('Save error:', error);
      Alert.alert('Error', 'Could not save face labels.');
    }
  };

  const generateStory = async () => {
    setIsGeneratingStory(true);
    try {
      const response = await fetch(`${BASE_URL}/memory/${id}/generate-story`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
        Alert.alert('Success', 'Story generated successfully!');
      } else {
        throw new Error('Failed to generate story');
      }
    } catch (error) {
      console.log('Generate story error:', error);
      Alert.alert('Error', 'Could not generate story.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading memory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!memory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>Memory not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Images Section */}
        {memory.images && memory.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {memory.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: `${BASE_URL}${image}` }}
                  style={styles.memoryImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Captions Section */}
        {memory.captions && memory.captions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 AI Captions</Text>
            {memory.captions.map((caption, index) => (
              <View key={index} style={styles.captionCard}>
                <Text style={styles.captionText}>{caption}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Faces Section */}
        {faces.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 People in this Memory</Text>
            <FlatList
              data={faces}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.faceCard}>
                  <Image
                    source={{ uri: `${BASE_URL}${item.image}` }}
                    style={styles.faceImage}
                  />
                  <TextInput
                    style={styles.faceInput}
                    placeholder="Who is this?"
                    value={faceLabels[index] || ''}
                    onChangeText={(text) =>
                      setFaceLabels({ ...faceLabels, [index]: text })
                    }
                  />
                </View>
              )}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveFaceLabels}>
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Labels</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transcript Section */}
        {memory.transcript && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 Audio Transcript</Text>
            <View style={styles.transcriptCard}>
              <Text style={styles.transcriptText}>{memory.transcript}</Text>
            </View>
          </View>
        )}

        {/* Story Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Memory Story</Text>
          
          {!story ? (
            <View style={styles.noStoryContainer}>
              <Text style={styles.noStoryText}>No story generated yet</Text>
              <TouchableOpacity
                style={[styles.generateButton, isGeneratingStory && styles.generatingButton]}
                onPress={generateStory}
                disabled={isGeneratingStory}
              >
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.generateButtonText}>
                  {isGeneratingStory ? 'Generating...' : 'Generate Story'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.storyContainer}>
              <View style={styles.storyCard}>
                <Text style={styles.storyText}>{story}</Text>
              </View>
              
              <View style={styles.audioControls}>
                <TouchableOpacity
                  style={[styles.playButton, isPlaying && styles.playingButton]}
                  onPress={() => (isPlaying ? stopStory() : playStory())}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="white"
                  />
                  <Text style={styles.playButtonText}>
                    {isPlaying ? 'Pause Story' : 'Play Story'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={generateStory}
                  disabled={isGeneratingStory}
                >
                  <Ionicons name="refresh" size={20} color="#3498db" />
                  <Text style={styles.regenerateButtonText}>Regenerate</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 19,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 20,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  memoryImage: {
    width: 220,
    height: 170,
    borderRadius: 18,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  captionCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  captionText: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 26,
    fontWeight: '500',
  },
  faceCard: {
    alignItems: 'center',
    marginRight: 18,
  },
  faceImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  faceInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: 110,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1f36',
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 18,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  transcriptCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transcriptText: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 26,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  noStoryContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noStoryText: {
    fontSize: 17,
    color: '#6b7280',
    marginBottom: 24,
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  generatingButton: {
    backgroundColor: '#9ca3af',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  storyContainer: {
    alignItems: 'center',
  },
  storyCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  storyText: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  audioControls: {
    flexDirection: 'row',
    gap: 14,
  },
  playButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  playingButton: {
    backgroundColor: '#f59e0b',
  },
  playButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  regenerateButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  regenerateButtonText: {
    color: '#2563eb',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
});
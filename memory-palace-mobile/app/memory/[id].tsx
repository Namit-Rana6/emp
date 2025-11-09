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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  memoryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  captionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  captionText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
  },
  faceCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  faceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  faceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 100,
    textAlign: 'center',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  transcriptCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transcriptText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  noStoryContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noStoryText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#9b59b6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  generatingButton: {
    backgroundColor: '#95a5a6',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  storyContainer: {
    alignItems: 'center',
  },
  storyCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
    textAlign: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  playingButton: {
    backgroundColor: '#f39c12',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  regenerateButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  regenerateButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
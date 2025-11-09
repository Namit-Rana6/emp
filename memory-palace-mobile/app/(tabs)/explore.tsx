import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, Alert, Dimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function PatientViewScreen() {
  const router = useRouter();
  const [memories, setMemories] = useState([]);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Replace with your backend IP - Use your actual local IP
  const BASE_URL = "http://192.168.0.233:8000"; // Update this to your backend IP

  useEffect(() => {
    fetchMemories();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/memories`);
      const data = await response.json();
      setMemories(data.memories || []);
      if (data.memories && data.memories.length > 0) {
        setCurrentMemory(data.memories[0]);
      }
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Connection Error", "Could not connect to backend. Please check your network connection.");
    }
  };

  const playStory = async (memoryId) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // First check if audio endpoint exists
      const response = await fetch(`${BASE_URL}/memory/${memoryId}/audio`);
      
      if (response.ok) {
        const data = await response.json();
        
        // If audio file exists, try to play it
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
          // Use device's built-in speech synthesis
          Alert.alert(
            "Audio Not Available", 
            "Audio generation is not implemented in this demo version. The story text is available to read.",
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert("Audio Error", "Could not load audio for this memory.");
      }
    } catch (error) {
      console.log("Audio playback error:", error);
      Alert.alert(
        "Audio Not Available", 
        "Audio playback is not available in this demo version. You can read the story text instead.",
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

  const selectMemory = (memory) => {
    setCurrentMemory(memory);
  };

  if (memories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color="#e74c3c" />
          <Text style={styles.emptyTitle}>No Memories Yet</Text>
          <Text style={styles.emptySubtitle}>Ask your family to add some memories for you</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi 👋</Text>
        <Text style={styles.subtitle}>Would you like to revisit a memory today?</Text>
      </View>

      {currentMemory && (
        <View style={styles.currentMemoryContainer}>
          <View style={styles.imageContainer}>
            {currentMemory.images && currentMemory.images.length > 0 ? (
              <Image 
                source={{ uri: `${BASE_URL}${currentMemory.images[0]}` }} 
                style={styles.mainImage} 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={60} color="#bdc3c7" />
              </View>
            )}
          </View>

          <View style={styles.storyContainer}>
            <Text style={styles.storyTitle}>
              {currentMemory.title || `Memory from ${currentMemory.date || 'recently'}`}
            </Text>
            
            {currentMemory.story && (
              <Text style={styles.storyText} numberOfLines={4}>
                {currentMemory.story}
              </Text>
            )}

            <View style={styles.audioControls}>
              <TouchableOpacity
                style={[styles.playButton, isPlaying && styles.playingButton]}
                onPress={() => isPlaying ? stopStory() : playStory(currentMemory.id)}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="white" 
                />
                <Text style={styles.playButtonText}>
                  {isPlaying ? "Pause Story" : "Play Story"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.memoriesListContainer}>
        <Text style={styles.sectionTitle}>Choose a Memory</Text>
        <FlatList
          data={memories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.memoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.memoryThumbnail,
                currentMemory?.id === item.id && styles.selectedMemory
              ]}
              onPress={() => selectMemory(item)}
            >
              {item.thumbnail ? (
                <Image 
                  source={{ uri: `${BASE_URL}${item.thumbnail}` }} 
                  style={styles.thumbnailImage} 
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#95a5a6" />
                </View>
              )}
              <Text style={styles.thumbnailText} numberOfLines={2}>
                {item.title || `Memory ${item.id}`}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f0',
  },
  header: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1a1f36',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 19,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  currentMemoryContainer: {
    flex: 1,
    margin: 24,
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  imageContainer: {
    height: 280,
    backgroundColor: '#fef3c7',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fde68a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyContainer: {
    padding: 24,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1f36',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  audioControls: {
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playingButton: {
    backgroundColor: '#f59e0b',
  },
  playButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 14,
    letterSpacing: 0.3,
  },
  memoriesListContainer: {
    paddingVertical: 24,
    backgroundColor: '#fffbeb',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: 18,
    paddingHorizontal: 24,
    letterSpacing: -0.3,
  },
  memoriesList: {
    paddingHorizontal: 24,
  },
  memoryThumbnail: {
    width: 110,
    marginRight: 18,
    alignItems: 'center',
  },
  selectedMemory: {
    transform: [{ scale: 1.12 }],
  },
  thumbnailImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  thumbnailPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: '#fde68a',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  thumbnailText: {
    fontSize: 13,
    color: '#1a1f36',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1f36',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
});

import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const [memories, setMemories] = useState([]);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Replace with your backend IP - Use your actual local IP
  const BASE_URL = "http://192.168.0.233:8000"; // Update this to your backend IP

  const fetchMemories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/memories`);
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Connection Error", "Could not connect to backend. Please check your network connection.");
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMemories();
    setRefreshing(false);
  };

  const handleAddMemory = () => {
    router.push('/upload');
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memory Palace</Text>
        <Text style={styles.subtitle}>Family Dashboard</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search memories by person or event..."
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMemory}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New Memory</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.memoriesSection}>
        <Text style={styles.sectionTitle}>Recent Memories</Text>
        
        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add New Memory" to get started</Text>
          </View>
        ) : (
          <FlatList
            data={memories}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.memoryCard}
                onPress={() => router.push(`/memory/${item.id}`)}
              >
                {item.thumbnail ? (
                  <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={32} color="#999" />
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.memoryTitle} numberOfLines={2}>
                    {item.title || `Memory ${item.id}`}
                  </Text>
                  <Text style={styles.memoryDate}>
                    {item.date || 'Recent'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  memoriesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  memoryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#ecf0f1',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 12,
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  memoryDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

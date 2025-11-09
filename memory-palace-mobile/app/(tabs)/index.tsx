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
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a1f36',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1f36',
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  addButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  memoriesSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 20,
    letterSpacing: -0.2,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  memoryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 18,
    marginHorizontal: 5,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  thumbnail: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 14,
  },
  memoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: 6,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  memoryDate: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

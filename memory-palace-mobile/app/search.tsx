import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const { query: initialQuery } = useLocalSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Replace with your backend IP - Use your actual local IP
  const BASE_URL = "http://192.168.0.233:8000"; // Update this to your backend IP

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(query);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search memories..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length === 0 && query ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>Try searching for people names or events</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => router.push(`/memory/${item.id}`)}
            >
              {item.thumbnail ? (
                <Image source={{ uri: `${BASE_URL}${item.thumbnail}` }} style={styles.thumbnail} />
              ) : (
                <View style={styles.placeholderThumbnail}>
                  <Ionicons name="image-outline" size={32} color="#95a5a6" />
                </View>
              )}
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>
                  {item.title || `Memory ${item.id}`}
                </Text>
                <Text style={styles.resultDate}>
                  {item.date || 'Recent'}
                </Text>
                {item.matchReason && (
                  <Text style={styles.matchReason}>
                    Found: {item.matchReason}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
  searchContainer: {
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
  searchButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  resultsList: {
    padding: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  placeholderThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  matchReason: {
    fontSize: 12,
    color: '#3498db',
    fontStyle: 'italic',
  },
});
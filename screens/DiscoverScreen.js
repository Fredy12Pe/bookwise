import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BookCard from '../components/BookCard';
import {
  fetchBooksByQuery,
  fetchNYTBestsellersList,
  enrichBookFromGoogle,
} from '../lib/bookApi';

// Section Header component
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// Book List component
const BookList = ({ books, onBookPress, horizontal = true }) => (
  <FlatList
    data={books}
    horizontal={horizontal}
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item) => item.id || item.primaryIsbn13}
    renderItem={({ item }) => (
      <BookCard book={item} onPress={onBookPress} />
    )}
    contentContainerStyle={styles.bookList}
  />
);

export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [businessBooks, setBusinessBooks] = useState([]);
  const [nonfictionBooks, setNonfictionBooks] = useState([]);
  const [productivityBooks, setProductivityBooks] = useState([]);
  const [loading, setLoading] = useState({
    search: false,
    business: false,
    nonfiction: false,
    productivity: false,
  });

  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(prev => ({ ...prev, search: true }));
    try {
      const results = await fetchBooksByQuery(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Fetch NYT books and enrich with Google Books data
  const fetchAndEnrichBooks = async (category, setter, loadingKey) => {
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const nytBooks = await fetchNYTBestsellersList(category);
      const enrichedBooks = await Promise.all(
        nytBooks.map(async (book) => {
          const googleData = await enrichBookFromGoogle(book.primaryIsbn13);
          return {
            ...book,
            ...googleData,
            id: googleData?.id || book.primaryIsbn13,
            authors: googleData?.authors || [book.author],
            thumbnail: googleData?.thumbnail || book.bookImage,
          };
        })
      );
      setter(enrichedBooks);
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Fetch productivity books
  const fetchProductivityBooks = async () => {
    setLoading(prev => ({ ...prev, productivity: true }));
    try {
      const books = await fetchBooksByQuery('productivity', 10);
      setProductivityBooks(books);
    } catch (error) {
      console.error('Error fetching productivity books:', error);
    } finally {
      setLoading(prev => ({ ...prev, productivity: false }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAndEnrichBooks('business-books', setBusinessBooks, 'business');
    fetchAndEnrichBooks('hardcover-nonfiction', setNonfictionBooks, 'nonfiction');
    fetchProductivityBooks();
  }, []);

  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', { book });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.screenTitle}>Discover</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books or topics"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#2F80ED" />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {loading.search && (
          <ActivityIndicator style={styles.loader} color="#2F80ED" />
        )}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Search Results" />
            <BookList books={searchResults} onBookPress={handleBookPress} />
          </View>
        )}

        {/* Business Books Section */}
        <View style={styles.section}>
          <SectionHeader title="Top Business Books" />
          {loading.business ? (
            <ActivityIndicator style={styles.loader} color="#2F80ED" />
          ) : (
            <BookList books={businessBooks} onBookPress={handleBookPress} />
          )}
        </View>

        {/* Nonfiction Books Section */}
        <View style={styles.section}>
          <SectionHeader title="Top Nonfiction" />
          {loading.nonfiction ? (
            <ActivityIndicator style={styles.loader} color="#2F80ED" />
          ) : (
            <BookList books={nonfictionBooks} onBookPress={handleBookPress} />
          )}
        </View>

        {/* Productivity Books Section */}
        <View style={styles.section}>
          <SectionHeader title="Books on Productivity" />
          {loading.productivity ? (
            <ActivityIndicator style={styles.loader} color="#2F80ED" />
          ) : (
            <BookList books={productivityBooks} onBookPress={handleBookPress} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  bookList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  loader: {
    padding: 20,
  },
}); 
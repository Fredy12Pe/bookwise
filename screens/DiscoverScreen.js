import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BookCard from '../components/BookCard';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import {
  fetchBooksByQuery,
  fetchNYTBestsellersList,
  enrichBookFromGoogle,
  fetchBooks,
  fetchBooksByCategory,
} from '../lib/bookApi';

const BRAND_COLOR = '#211B32';

const CATEGORIES = [
  {
    id: '1',
    name: 'Natural\nScience',
    icon: 'flask-outline',
  },
  {
    id: '2',
    name: 'Social\nScience',
    icon: 'people-outline',
  },
  {
    id: '3',
    name: 'Math',
    icon: 'calculator-outline',
  },
  {
    id: '4',
    name: 'English\nLanguage',
    icon: 'language-outline',
  },
];

const PLACEHOLDER_BOOKS = [
  {
    id: '1',
    title: 'Geografi Kelas XI',
    publisher: 'Erlangga',
    color: '#4263EB',
  },
  {
    id: '2',
    title: 'Fisika Kelas XI',
    publisher: 'Erlangga',
    color: '#FF6B6B',
  },
  {
    id: '3',
    title: 'Kimia Kelas 11',
    publisher: 'Erlangga',
    color: '#20C997',
  },
  {
    id: '4',
    title: 'Biologi Kelas XI',
    publisher: 'Erlangga',
    color: '#845EF7',
  },
  {
    id: '5',
    title: 'Matematika Kelas 11',
    publisher: 'Erlangga',
    color: '#FF922B',
  },
  {
    id: '6',
    title: 'Sejarah Indonesia',
    publisher: 'Erlangga',
    color: '#51CF66',
  },
];

// Book List component
const BookList = ({ books, onBookPress }) => (
  <FlatList
    data={books}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item) => item.id || item.primaryIsbn13}
    renderItem={({ item }) => (
      <BookCard book={item} onPress={onBookPress} />
    )}
    contentContainerStyle={styles.bookList}
    style={styles.bookListContainer}
  />
);

export default function DiscoverScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [businessBooks, setBusinessBooks] = useState([]);
  const [nonfictionBooks, setNonfictionBooks] = useState([]);
  const [productivityBooks, setProductivityBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Replace API calls with placeholder data
  useEffect(() => {
    setBusinessBooks(PLACEHOLDER_BOOKS);
    setNonfictionBooks(PLACEHOLDER_BOOKS);
    setProductivityBooks(PLACEHOLDER_BOOKS);
    setLoading(false);
  }, []);

  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', { book });
  };

  const renderBookCard = (book) => (
    <TouchableOpacity key={book.id} style={styles.bookCard}>
      <View style={[styles.bookCover, { backgroundColor: book.color }]} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.bookPublisher} numberOfLines={1}>
          {book.publisher}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = (category) => (
    <TouchableOpacity key={category.id} style={styles.categoryCard}>
      <Text style={styles.categoryName}>{category.name}</Text>
      <View style={styles.categoryIconContainer}>
        <Ionicons name={category.icon} size={24} color="#211B32" />
      </View>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Reload your data here
    setBusinessBooks(PLACEHOLDER_BOOKS);
    setNonfictionBooks(PLACEHOLDER_BOOKS);
    setProductivityBooks(PLACEHOLDER_BOOKS);
    setRefreshing(false);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[theme].tint}
            />
          }
        >
          <ThemedText type="title" style={styles.screenTitle}>Discover</ThemedText>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: Colors[theme].searchBar }]}>
            <Ionicons name="search" size={20} color={Colors[theme].secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: Colors[theme].text }]}
              placeholder="Search books or topics"
              placeholderTextColor={Colors[theme].secondaryText}
            />
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Explore by categories</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesScrollContent}
            >
              {CATEGORIES.map(category => (
                <TouchableOpacity 
                  key={category.id} 
                  style={[styles.categoryCard, { backgroundColor: Colors[theme].categoryCard, borderColor: Colors[theme].border }]}
                >
                  <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                  <View style={[styles.categoryIconContainer, { backgroundColor: Colors[theme].background }]}>
                    <Ionicons name={category.icon} size={24} color={Colors[theme].text} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Book Sections */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Top Business Books</ThemedText>
              <TouchableOpacity onPress={() => {}}>
                <ThemedText style={styles.seeAll}>See All</ThemedText>
              </TouchableOpacity>
            </View>
            <BookList books={businessBooks} onBookPress={handleBookPress} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Top Nonfiction</ThemedText>
              <TouchableOpacity onPress={() => {}}>
                <ThemedText style={styles.seeAll}>See All</ThemedText>
              </TouchableOpacity>
            </View>
            <BookList books={nonfictionBooks} onBookPress={handleBookPress} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Books on Productivity</ThemedText>
              <TouchableOpacity onPress={() => {}}>
                <ThemedText style={styles.seeAll}>See All</ThemedText>
              </TouchableOpacity>
            </View>
            <BookList books={productivityBooks} onBookPress={handleBookPress} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  seeAll: {
    fontSize: 16,
    color: Colors.light.secondaryText,
  },
  categoriesScroll: {
    marginTop: 0,
  },
  categoriesScrollContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  categoryCard: {
    width: 140,
    height: 160,
    borderRadius: 24,
    padding: 20,
    marginRight: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  bookListContainer: {
    marginLeft: 20,
  },
  bookList: {
    paddingRight: 20,
  },
  bookCard: {
    width: 160,
    marginRight: 16,
  },
  bookCover: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  bookInfo: {
    marginTop: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bookPublisher: {
    fontSize: 12,
    color: '#9CA3AF',
  },
}); 
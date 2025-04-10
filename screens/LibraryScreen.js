import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import FeaturedSummaryCard from '../components/FeaturedSummaryCard';
import SummaryPreviewCard from '../components/SummaryPreviewCard';
import EmptyLibraryPlaceholder from '../components/EmptyLibraryPlaceholder';
import { searchBooks } from '../lib/bookApi';

// Mock data for now - would come from local storage/backend
const myBooks = [
  {
    id: '1',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    status: 'Summary done',
    thumbnail: 'https://via.placeholder.com/128x196?text=Atomic+Habits'
  },
  {
    id: '2',
    title: 'Deep Work',
    authors: ['Cal Newport'],
    status: 'In progress',
    thumbnail: 'https://via.placeholder.com/128x196?text=Deep+Work'
  },
  {
    id: '3',
    title: 'The Power of Habit',
    authors: ['Charles Duhigg'],
    status: 'In progress',
    thumbnail: 'https://via.placeholder.com/128x196?text=Power+of+Habit'
  },
];

const featuredSummary = {
  title: 'Start With Why',
  author: 'Simon Sinek',
  summary: 'Learn how great leaders inspire action by focusing on their purpose.',
};

const recentSummaries = [
  { id: '1', title: 'The 7 Habits of Highly Effective People', summary: 'Timeless advice for personal and professional growth.' },
  { id: '2', title: 'Grit', summary: 'Why passion and perseverance are key to success.' },
];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [displayedBooks, setDisplayedBooks] = useState(myBooks);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchBooks(searchQuery);
          // Mark books that are already in the library
          const booksWithStatus = results.map(book => ({
            ...book,
            status: myBooks.find(myBook => 
              myBook.title.toLowerCase() === book.title.toLowerCase()
            )?.status || 'Not in library',
            thumbnail: book.thumbnail || 'https://via.placeholder.com/128x196?text=' + encodeURIComponent(book.title)
          }));
          setSearchResults(booksWithStatus);
          setDisplayedBooks(booksWithStatus);
        } catch (error) {
          console.error('Error searching books:', error);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setDisplayedBooks(myBooks);
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const renderBookCard = ({ item }) => (
    <BookCard
      book={item}
      onPress={() => {}}
    />
  );

  if (myBooks.length === 0 && !searchQuery) {
    return <EmptyLibraryPlaceholder onExplore={() => {}} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Books</Text>
        
        <SearchBar
          placeholder="Search your library"
          onChangeText={setSearchQuery}
        />

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? 'Search Results' : 'Your Library'}
              </Text>
              <FlatList
                data={displayedBooks}
                renderItem={renderBookCard}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bookList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No books found</Text>
                }
              />
            </View>

            {!searchQuery && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Featured Summary</Text>
                  <FeaturedSummaryCard
                    title={featuredSummary.title}
                    author={featuredSummary.author}
                    summary={featuredSummary.summary}
                    onPress={() => {}}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recently Summarized</Text>
                  {recentSummaries.map(summary => (
                    <SummaryPreviewCard
                      key={summary.id}
                      title={summary.title}
                      summary={summary.summary}
                      onPress={() => {}}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bookList: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 16,
  },
}); 
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecentSummaryCard from '../components/RecentSummaryCard';

const BRAND_COLOR = '#211B32';

const RECENT_SUMMARIES = [
  {
    id: '1',
    title: 'Old man and sea',
    author: 'Ernest Heminguey',
    description: "Santiago's luck changes when he hooks a giant marlin, a fish of immense size and strength.",
    color: '#4263EB'
  },
  {
    id: '2',
    title: 'Old man and sea',
    author: 'Ernest Heminguey',
    description: "Santiago's luck changes when he hooks a giant marlin, a fish of immense size and strength.",
    color: '#FF9E9E'
  }
];

const LIBRARY_BOOKS = [
  {
    id: '1',
    title: 'Geografi Kelas XI',
    publisher: 'Erlangga',
    color: '#4263EB'
  },
  {
    id: '2',
    title: 'Fisika Kelas XI',
    publisher: 'Erlangga',
    color: '#FF9E9E'
  },
  {
    id: '3',
    title: 'Kimia Kelas XI',
    publisher: 'Erlangga',
    color: '#9EFFB5'
  }
];

export default function LibraryScreen() {
  const renderBookCard = (book) => (
    <TouchableOpacity key={book.id} style={styles.bookCard}>
      <View style={[styles.bookCover, { backgroundColor: book.color }]}>
        <Text style={styles.bookCoverTitle}>{book.title}</Text>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookPublisher}>
          {book.publisher}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/logo/bookwise-logo-2x.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>BookWise</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Explore the world{'\n'}through books
            </Text>
            <Image
              source={require('../assets/images/illustrations/reading-2x.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any books"
            placeholderTextColor="#999"
          />
        </View>

        {/* Your Library Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Library</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.booksScroll}
            contentContainerStyle={styles.booksScrollContent}
          >
            {LIBRARY_BOOKS.map(renderBookCard)}
          </ScrollView>
        </View>

        {/* Featured Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Summary</Text>
          <TouchableOpacity style={styles.featuredCard}>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>
                Natural{'\n'}
                Science
              </Text>
              <Text style={styles.featuredAuthor}>Simon Sinek</Text>
              <Text style={styles.featuredDescription}>
                Learn how great leaders{'\n'}
                inspire action by focusing{'\n'}
                on their purpose
              </Text>
              <TouchableOpacity style={styles.readButton}>
                <Text style={styles.readButtonText}>Read Summary</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bookIconContainer}>
              <Ionicons name="book-outline" size={48} color="#1E1A2D" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recently Summarized */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Summarized</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentSummaries}>
            {RECENT_SUMMARIES.map(summary => (
              <RecentSummaryCard
                key={summary.id}
                title={summary.title}
                author={summary.author}
                description={summary.description}
                color={summary.color}
                onPress={() => {}}
              />
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  heroSection: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 39,
    letterSpacing: -0.5,
  },
  heroImage: {
    width: 150,
    height: 150,
    marginLeft: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 28,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: BRAND_COLOR,
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAll: {
    fontSize: 14,
    color: BRAND_COLOR,
    fontWeight: '500',
  },
  booksScroll: {
    marginLeft: -20,
  },
  booksScrollContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  bookCard: {
    width: 160,
    marginRight: 16,
  },
  bookCover: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  bookCoverTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookInfo: {
    marginTop: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bookPublisher: {
    fontSize: 14,
    color: '#666666',
  },
  featuredCard: {
    backgroundColor: '#1E1A2D',
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    position: 'relative',
    minHeight: 220,
  },
  featuredContent: {
    maxWidth: '65%',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredAuthor: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 32,
  },
  bookIconContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readButton: {
    backgroundColor: '#4B3F72',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  readButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  recentSummaries: {
    marginTop: 12,
  },
}); 
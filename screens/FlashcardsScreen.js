import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Text,
  Pressable,
} from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { generateFlashcards } from '../lib/openai';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_SIDE_MARGIN = 20;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_SIDE_MARGIN * 2);
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function FlashcardsScreen({ route, navigation }) {
  const { book } = route.params;
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const { colors } = useTheme();
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState(null);

  const flipAnimation = useSharedValue(0);

  const frontAnimatedStyles = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flipAnimation.value,
      [0, 1],
      [0, 180]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyles = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flipAnimation.value,
      [0, 1],
      [180, 360]
    );
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching flashcards for book:', book);
        
        // Ensure we have text to generate flashcards from
        const text = book.description || book.summary;
        if (!text) {
          setError('No content available to generate flashcards from. Please ensure the book has a description or summary.');
          setIsLoading(false);
          return;
        }

        console.log('Generating flashcards from text:', text.substring(0, 100) + '...');
        const response = await generateFlashcards(text);
        console.log('Flashcards response:', response);

        if (response.success) {
          if (response.data && response.data.length > 0) {
            setFlashcards(response.data);
          } else {
            setError('No flashcards were generated. Please try again.');
          }
        } else {
          setError(response.error || 'Failed to generate flashcards. Please check your internet connection and try again.');
          console.error('Flashcards generation failed:', response.error);
        }
      } catch (error) {
        console.error('Error in fetchFlashcards:', error);
        setError(error.message || 'An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [book]);

  const handleFlip = () => {
    const newValue = flipAnimation.value === 0 ? 1 : 0;
    flipAnimation.value = withTiming(newValue, { duration: 800 }, () => {
      runOnJS(setIsFlipped)(!isFlipped);
    });
  };

  const handleNext = () => {
    if (isFlipped) {
      handleFlip();
    }
    setCurrentCardIndex((prevIndex) => 
      prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    if (isFlipped) {
      handleFlip();
    }
    setCurrentCardIndex((prevIndex) => 
      prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
    );
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'concept':
        return '#4CAF50';
      case 'definition':
        return '#2196F3';
      case 'example':
        return '#FF9800';
      case 'key_point':
        return '#F44336';
      default:
        return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Generating study materials...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!flashcards.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No study materials available
        </Text>
      </View>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>{book.title} Study Materials</ThemedText>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setIsLoading(true);
              setError(null);
              setCurrentCardIndex(0);
              setIsFlipped(false);
              fetchFlashcards();
            }}
          >
            <Ionicons name="refresh" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            {currentCardIndex + 1} of {flashcards.length}
          </ThemedText>
        </View>

        {/* Flashcard */}
        <View style={styles.cardWrapper}>
          <Pressable onPress={handleFlip} style={styles.cardContainer}>
            <Animated.View style={[styles.card, frontAnimatedStyles]}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(currentCard.type) }]}>
                <Text style={styles.typeText}>{currentCard.type?.toUpperCase()}</Text>
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardText}>{currentCard.front}</ThemedText>
              </View>
            </Animated.View>
            
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyles]}>
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardText}>{currentCard.back}</ThemedText>
              </View>
            </Animated.View>
          </Pressable>
        </View>

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handlePrevious}
          >
            <Ionicons name="chevron-back" size={30} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={handleFlip}
          >
            <Ionicons name="sync" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handleNext}
          >
            <Ionicons name="chevron-forward" size={30} color={colors.text} />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButton: {
    padding: 8,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardWrapper: {
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardBack: {
    backgroundColor: '#f8f9fa',
  },
  typeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  navButton: {
    padding: 12,
  },
  flipButton: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 
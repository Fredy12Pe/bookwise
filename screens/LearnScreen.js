import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FlashcardCard from '../components/FlashcardCard';

// Mock data for initial state
const mockFlashcards = [
  {
    id: '1',
    question: 'What is the main concept of Atomic Habits?',
    answer: 'The main concept is that small, consistent changes can lead to remarkable results over time.',
  },
  {
    id: '2',
    question: 'What are the four laws of behavior change?',
    answer: 'Make it obvious, make it attractive, make it easy, and make it satisfying.',
  },
  {
    id: '3',
    question: 'What is habit stacking?',
    answer: 'Habit stacking is the practice of adding a new habit onto an existing one.',
  },
];

const LearnScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentIndex < mockFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const generateNewFlashcards = async () => {
    setIsLoading(true);
    // TODO: Implement actual API call to generate new flashcards
    // For now, we'll just use mock data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateNewFlashcards}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Generate New Flashcards</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mockFlashcards.length > 0 ? (
          <FlashcardCard
            flashcard={mockFlashcards[currentIndex]}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No flashcards available. Generate some to start learning!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F80ED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default LearnScreen; 
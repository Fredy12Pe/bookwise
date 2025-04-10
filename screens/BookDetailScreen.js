import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from '../components/AudioPlayer';

// Mock data for initial state
const mockBook = {
  title: 'Atomic Habits',
  author: 'James Clear',
  coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  summary: {
    short: 'Atomic Habits teaches you how to build good habits and break bad ones through small, consistent changes.',
    medium: 'Atomic Habits by James Clear is a comprehensive guide to understanding how habits work and how to change them. The book explains that small, consistent changes can lead to remarkable results over time, and provides practical strategies for building good habits and breaking bad ones.',
    long: 'Atomic Habits by James Clear is a groundbreaking book that explores the science of habit formation and change. The author argues that small, consistent changes can lead to remarkable results over time, and provides a comprehensive framework for understanding how habits work. The book covers topics such as habit stacking, environment design, and the four laws of behavior change, offering practical strategies for building good habits and breaking bad ones. Through real-world examples and scientific research, Clear demonstrates how anyone can transform their habits and achieve their goals.',
  },
};

const BookDetailScreen = () => {
  const [selectedSummary, setSelectedSummary] = useState('medium');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.title}>{mockBook.title}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Image source={{ uri: mockBook.coverImage }} style={styles.coverImage} />
        <Text style={styles.author}>by {mockBook.author}</Text>

        <View style={styles.summarySelector}>
          <TouchableOpacity
            style={[styles.selectorButton, selectedSummary === 'short' && styles.selectedButton]}
            onPress={() => setSelectedSummary('short')}
          >
            <Text style={[styles.selectorText, selectedSummary === 'short' && styles.selectedText]}>
              Short
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorButton, selectedSummary === 'medium' && styles.selectedButton]}
            onPress={() => setSelectedSummary('medium')}
          >
            <Text style={[styles.selectorText, selectedSummary === 'medium' && styles.selectedText]}>
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorButton, selectedSummary === 'long' && styles.selectedButton]}
            onPress={() => setSelectedSummary('long')}
          >
            <Text style={[styles.selectorText, selectedSummary === 'long' && styles.selectedText]}>
              Long
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>{mockBook.summary[selectedSummary]}</Text>
        </View>

        <View style={styles.audioContainer}>
          <AudioPlayer text={mockBook.summary[selectedSummary]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  content: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  author: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 16,
  },
  summarySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  selectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },
  selectedButton: {
    backgroundColor: '#2F80ED',
  },
  selectorText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111111',
  },
  audioContainer: {
    padding: 16,
    marginTop: 16,
  },
});

export default BookDetailScreen; 
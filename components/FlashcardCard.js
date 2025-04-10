import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FlashcardCard = ({ flashcard, onNext, onPrevious }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = new Animated.Value(0);

  const flipCard = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.front, frontAnimatedStyle]}>
          <Text style={styles.question}>{flashcard.question}</Text>
          <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
            <Text style={styles.flipButtonText}>Show Answer</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
          <Text style={styles.answer}>{flashcard.answer}</Text>
          <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
            <Text style={styles.flipButtonText}>Show Question</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
          <Ionicons name="arrow-back" size={24} color="#2F80ED" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onNext}>
          <Ionicons name="arrow-forward" size={24} color="#2F80ED" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '90%',
    height: 300,
    marginBottom: 20,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  front: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 20,
  },
  answer: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  flipButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  flipButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  navButton: {
    padding: 10,
  },
});

export default FlashcardCard; 
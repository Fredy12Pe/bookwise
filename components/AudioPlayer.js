import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const AudioPlayer = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = async () => {
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
    } else {
      await Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: (error) => {
          console.error('Speech error:', error);
          setIsPlaying(false);
        },
      });
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      <Text style={styles.statusText}>
        {isPlaying ? 'Playing...' : 'Play Summary'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F80ED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  playButton: {
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AudioPlayer; 
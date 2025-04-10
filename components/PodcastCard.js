import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PodcastCard = ({ podcast, onPlay }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPlay}>
      <Image source={{ uri: podcast.thumbnail }} style={styles.thumbnail} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{podcast.title}</Text>
        <Text style={styles.duration}>{podcast.duration}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={onPlay}>
        <Ionicons name="play" size={24} color="#2F80ED" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#666666',
  },
  playButton: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
});

export default PodcastCard; 
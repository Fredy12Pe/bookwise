import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PodcastCard from '../components/PodcastCard';

// Mock data for initial state
const mockPodcasts = [
  {
    id: '1',
    title: 'The Psychology of Money - Book Summary',
    duration: '15:30',
    thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '2',
    title: 'Atomic Habits - Key Takeaways',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    title: 'Deep Work - Book Review',
    duration: '18:20',
    thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
];

const AudioScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState(null);

  const handlePlay = (podcast) => {
    setSelectedPodcast(podcast);
    // TODO: Implement actual audio playback
  };

  const renderPodcastCard = ({ item }) => (
    <PodcastCard
      podcast={item}
      onPlay={() => handlePlay(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audio</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F80ED" />
        </View>
      ) : (
        <FlatList
          data={mockPodcasts}
          renderItem={renderPodcastCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedPodcast && (
        <View style={styles.playerContainer}>
          <Text style={styles.nowPlaying}>Now Playing</Text>
          <Text style={styles.podcastTitle}>{selectedPodcast.title}</Text>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2F80ED',
    padding: 16,
  },
  nowPlaying: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
  podcastTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AudioScreen; 
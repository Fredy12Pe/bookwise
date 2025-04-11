import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

export default function BookCard({ book, onPress, style }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const {
    title,
    publisher,
    thumbnail,
  } = book;

  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setImageError(false);
    setIsLoading(!!thumbnail);
  }, [thumbnail]);

  const handleImageError = () => {
    console.log('Image load error for:', title, thumbnail);
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(book)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {/* Book cover */}
        {thumbnail && !imageError ? (
          <Image 
            source={{ uri: thumbnail }}
            style={styles.cover}
            resizeMode="cover"
            onError={handleImageError}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
        ) : (
          <View style={[styles.cover, { backgroundColor: book.color || Colors[theme].categoryCard }]} />
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors[theme].text} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <ThemedText numberOfLines={1} style={styles.title}>
          {title || 'Unknown Title'}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.publisher}>
          {publisher || 'Unknown Publisher'}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  info: {
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  publisher: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
}); 
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';

const DEFAULT_COVER = 'https://via.placeholder.com/128x196?text=No+Cover';

export default function BookCard({ book, onPress, style }) {
  const {
    title,
    authors = [],
    thumbnail,
  } = book;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(book)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: thumbnail || DEFAULT_COVER }}
        style={styles.cover}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.author}>
          {authors.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 6) / 2.5;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: CARD_MARGIN,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cover: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#666666',
  },
}); 
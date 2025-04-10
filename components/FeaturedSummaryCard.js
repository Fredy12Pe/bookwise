import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FeaturedSummaryCard = ({ title, author, summary, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.summary} numberOfLines={3}>
          {summary}
        </Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Read Summary</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.illustration}>
        <Ionicons name="book" size={40} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  illustration: {
    width: 80,
    height: 80,
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeaturedSummaryCard; 
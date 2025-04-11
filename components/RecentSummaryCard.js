import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RecentSummaryCard = ({ title, author, description, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.cover, { backgroundColor: color }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.author} numberOfLines={1}>{author}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" style={styles.arrow} />
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
    alignItems: 'center',
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
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  arrow: {
    alignSelf: 'center',
  },
});

export default RecentSummaryCard; 
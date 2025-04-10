import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SummaryPreviewCard = ({ title, summary, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text" size={24} color="#007AFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.summary} numberOfLines={2}>{summary}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#E6F0FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SummaryPreviewCard; 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyLibraryPlaceholder = ({ onExplore }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="library-outline" size={48} color="#007AFF" />
      </View>
      <Text style={styles.title}>Your library is empty</Text>
      <Text style={styles.message}>
        You haven't added any books yet. Start exploring our collection to find your next read!
      </Text>
      <TouchableOpacity style={styles.button} onPress={onExplore}>
        <Text style={styles.buttonText}>Explore Books</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E6F0FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default EmptyLibraryPlaceholder; 
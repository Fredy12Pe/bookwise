import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ placeholder = "Search your library", onChangeText }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});

export default SearchBar; 
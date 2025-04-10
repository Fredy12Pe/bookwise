import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { testGoogleBooksAPI, testNYTBooksAPI } from '../lib/bookApi';
import { getAPIKeys, deleteAPIKeys, initializeSecureStorage } from '../lib/secureStorage';

export default function TestAPIScreen() {
  const [results, setResults] = useState({
    google: null,
    nyt: null,
    keys: null
  });

  const resetKeys = async () => {
    try {
      console.log('Resetting API keys...');
      await deleteAPIKeys();
      await initializeSecureStorage();
      await checkStoredKeys();
      console.log('API keys reset complete');
    } catch (error) {
      console.error('Error resetting API keys:', error);
    }
  };

  const checkStoredKeys = async () => {
    const keys = await getAPIKeys();
    setResults(prev => ({
      ...prev,
      keys: {
        googleKey: keys.googleKey ? 'Present' : 'Missing',
        nytKey: keys.nytKey ? 'Present' : 'Missing'
      }
    }));
  };

  const testAPIs = async () => {
    try {
      // Test Google Books API
      const googleResult = await testGoogleBooksAPI();
      
      // Test NYT Books API
      const nytResult = await testNYTBooksAPI();

      setResults(prev => ({
        ...prev,
        google: googleResult,
        nyt: nytResult
      }));
    } catch (error) {
      console.error('Error testing APIs:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Test Results</Text>
      
      <TouchableOpacity style={styles.button} onPress={resetKeys}>
        <Text style={styles.buttonText}>Reset API Keys</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={checkStoredKeys}>
        <Text style={styles.buttonText}>Check Stored Keys</Text>
      </TouchableOpacity>

      {results.keys && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stored Keys Status:</Text>
          <Text>Google Books API Key: {results.keys.googleKey}</Text>
          <Text>NYT API Key: {results.keys.nytKey}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={testAPIs}>
        <Text style={styles.buttonText}>Test APIs</Text>
      </TouchableOpacity>

      {results.google && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Books API:</Text>
          <Text style={results.google.success ? styles.success : styles.error}>
            {results.google.success ? '✓ Working' : '✗ Not Working'}
          </Text>
          <Text>{results.google.message}</Text>
        </View>
      )}

      {results.nyt && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NYT Books API:</Text>
          <Text style={results.nyt.success ? styles.success : styles.error}>
            {results.nyt.success ? '✓ Working' : '✗ Not Working'}
          </Text>
          <Text>{results.nyt.message}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  success: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  error: {
    color: '#f44336',
    fontWeight: 'bold',
  },
}); 
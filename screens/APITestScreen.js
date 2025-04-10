import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import { deleteAPIKeys, getAPIKeys } from '../lib/secureStorage.js';
import { testGoogleBooksAPI, testNYTBooksAPI } from '../lib/bookApi.js';

export default function APITestScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleResetKeys = async () => {
    try {
      setIsLoading(true);
      const success = await deleteAPIKeys();
      if (success) {
        Alert.alert('Success', 'API keys have been reset');
      } else {
        Alert.alert('Error', 'Failed to reset API keys');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckKeys = async () => {
    try {
      setIsLoading(true);
      const keys = await getAPIKeys();
      Alert.alert(
        'Stored Keys',
        `Google Books API Key: ${keys.googleKey ? 'Present' : 'Missing'}\nNYT API Key: ${keys.nytKey ? 'Present' : 'Missing'}`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAPIs = async () => {
    try {
      setIsLoading(true);
      const googleResult = await testGoogleBooksAPI();
      const nytResult = await testNYTBooksAPI();

      Alert.alert(
        'API Test Results',
        `Google Books API: ${googleResult.success ? '✅' : '❌'}\n${googleResult.message}\n\nNYT API: ${nytResult.success ? '✅' : '❌'}\n${nytResult.message}`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Button
          title="Reset API Keys"
          onPress={handleResetKeys}
          disabled={isLoading}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Check Stored Keys"
          onPress={handleCheckKeys}
          disabled={isLoading}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Test APIs"
          onPress={handleTestAPIs}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 10,
  },
}); 
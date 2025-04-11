import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { testGoogleBooksAPI, testNYTBooksAPI, testAPIKeys } from '../lib/bookApi';
import { verifyAPIKeys } from '../lib/secureStorage';

export default function TestScreen() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runTests() {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('\n=== Starting API Tests ===\n');
      
      // Step 1: Verify API keys in secure storage
      console.log('Step 1: Verifying API keys in secure storage...');
      const verificationResult = await verifyAPIKeys();
      
      // Step 2: Test API keys validity
      console.log('\nStep 2: Testing API keys validity...');
      const apiKeysResult = await testAPIKeys();
      
      // Step 3: Test individual APIs if keys are valid
      let googleResult = null;
      let nytResult = null;
      
      if (apiKeysResult.success) {
        console.log('\nStep 3a: Testing Google Books API...');
        googleResult = await testGoogleBooksAPI();
        
        console.log('\nStep 3b: Testing NYT Books API...');
        nytResult = await testNYTBooksAPI();
      }
      
      setResults({
        timestamp: new Date().toISOString(),
        verification: verificationResult,
        apiKeys: apiKeysResult,
        googleBooks: googleResult,
        nyt: nytResult
      });
    } catch (error) {
      console.error('Test failed:', error);
      setResults({
        timestamp: new Date().toISOString(),
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={runTests}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Running Tests...' : 'Test APIs'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.results}>
        {results && (
          <View>
            <Text style={styles.timestamp}>
              Test run at: {results.timestamp}
            </Text>
            
            {results.error ? (
              <Text style={styles.error}>Error: {results.error}</Text>
            ) : (
              <>
                <Text style={styles.section}>API Keys Verification:</Text>
                <Text style={styles.detail}>
                  Status: {results.verification?.success ? '✅ Success' : '❌ Failed'}
                </Text>
                
                <Text style={styles.section}>API Keys Validity:</Text>
                <Text style={styles.detail}>
                  Status: {results.apiKeys?.success ? '✅ Success' : '❌ Failed'}
                </Text>
                {results.apiKeys?.message && (
                  <Text style={styles.message}>{results.apiKeys.message}</Text>
                )}
                
                <Text style={styles.section}>Google Books API:</Text>
                <Text style={styles.detail}>
                  Status: {results.googleBooks?.success ? '✅ Success' : '❌ Failed'}
                </Text>
                {results.googleBooks?.message && (
                  <Text style={styles.message}>{results.googleBooks.message}</Text>
                )}
                
                <Text style={styles.section}>NYT Books API:</Text>
                <Text style={styles.detail}>
                  Status: {results.nyt?.success ? '✅ Success' : '❌ Failed'}
                </Text>
                {results.nyt?.message && (
                  <Text style={styles.message}>{results.nyt.message}</Text>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  results: {
    marginTop: 16
  },
  timestamp: {
    color: '#666',
    marginBottom: 16
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8
  },
  detail: {
    fontSize: 16,
    marginBottom: 4
  },
  message: {
    color: '#666',
    marginBottom: 8
  },
  error: {
    color: '#FF3B30',
    fontSize: 16
  }
}); 
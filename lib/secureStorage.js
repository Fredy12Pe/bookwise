import * as SecureStore from 'expo-secure-store';
import { API_KEYS } from '../config.js';

const KEYS = {
  googleKey: 'google_books_api_key',
  nytKey: 'nyt_api_key'
};

// Debug helper
function debugLog(title, data) {
  console.log('\n=== ' + title + ' ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('='.repeat(20) + '\n');
}

// Initialize secure storage with API keys
async function initializeSecureStorage() {
  try {
    console.log('Starting secure storage initialization...');
    
    // Check if keys are already stored
    const existingKeys = await getAPIKeys();
    debugLog('Existing Keys Status', {
      googleKeyPresent: !!existingKeys.googleKey,
      nytKeyPresent: !!existingKeys.nytKey,
      configGoogleKeyPresent: !!API_KEYS.googleKey,
      configNYTKeyPresent: !!API_KEYS.nytKey
    });

    // Always save keys from config to ensure they're up to date
    console.log('Storing API keys in secure storage...');
    const success = await saveAPIKeys(API_KEYS.googleKey, API_KEYS.nytKey);
    
    if (success) {
      console.log('API keys successfully stored in secure storage');
      
      // Verify keys were stored correctly
      const verifyKeys = await getAPIKeys();
      debugLog('Verification', {
        googleKeyStored: !!verifyKeys.googleKey,
        nytKeyStored: !!verifyKeys.nytKey,
        googleKeyMatches: verifyKeys.googleKey === API_KEYS.googleKey,
        nytKeyMatches: verifyKeys.nytKey === API_KEYS.nytKey
      });
      
      return true;
    } else {
      throw new Error('Failed to store API keys in secure storage');
    }
  } catch (error) {
    console.error('Error initializing secure storage:', error);
    return false;
  }
}

/**
 * Save API keys securely
 */
async function saveAPIKeys(googleKey, nytKey) {
  try {
    debugLog('Saving Keys', {
      googleKeyProvided: !!googleKey,
      nytKeyProvided: !!nytKey
    });

    if (!googleKey || !nytKey) {
      throw new Error('Both API keys must be provided');
    }

    await SecureStore.setItemAsync(KEYS.googleKey, googleKey);
    await SecureStore.setItemAsync(KEYS.nytKey, nytKey);

    // Verify the keys were saved
    const savedGoogleKey = await SecureStore.getItemAsync(KEYS.googleKey);
    const savedNytKey = await SecureStore.getItemAsync(KEYS.nytKey);

    const success = !!savedGoogleKey && !!savedNytKey;
    debugLog('Save Result', {
      success,
      googleKeySaved: !!savedGoogleKey,
      nytKeySaved: !!savedNytKey
    });

    return success;
  } catch (error) {
    console.error('Error saving API keys:', error);
    return false;
  }
}

/**
 * Get API keys from secure storage
 */
async function getAPIKeys() {
  try {
    const googleKey = await SecureStore.getItemAsync(KEYS.googleKey);
    const nytKey = await SecureStore.getItemAsync(KEYS.nytKey);

    debugLog('Retrieved Keys', {
      googleKeyFound: !!googleKey,
      nytKeyFound: !!nytKey
    });

    return { googleKey, nytKey };
  } catch (error) {
    console.error('Error getting API keys:', error);
    return { googleKey: null, nytKey: null };
  }
}

/**
 * Delete API keys from secure storage
 */
async function deleteAPIKeys() {
  try {
    await SecureStore.deleteItemAsync(KEYS.googleKey);
    await SecureStore.deleteItemAsync(KEYS.nytKey);

    // Verify deletion
    const verifyKeys = await getAPIKeys();
    const success = !verifyKeys.googleKey && !verifyKeys.nytKey;

    debugLog('Delete Result', {
      success,
      googleKeyRemoved: !verifyKeys.googleKey,
      nytKeyRemoved: !verifyKeys.nytKey
    });

    return success;
  } catch (error) {
    console.error('Error deleting API keys:', error);
    return false;
  }
}

export {
  initializeSecureStorage,
  saveAPIKeys,
  getAPIKeys,
  deleteAPIKeys
}; 
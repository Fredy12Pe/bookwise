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
    console.log('\n=== Starting secure storage initialization ===\n');
    
    // Validate API keys from config
    if (!API_KEYS.googleKey || !API_KEYS.nytKey) {
      throw new Error('API keys not found in config.js');
    }

    console.log('API Keys from config:');
    console.log('- Google Books API key length:', API_KEYS.googleKey.length);
    console.log('- NYT API key length:', API_KEYS.nytKey.length);

    // Clear existing keys first
    console.log('\nClearing existing keys...');
    await deleteAPIKeys();
    
    // Save new keys
    console.log('\nSaving new keys to secure storage...');
    const success = await saveAPIKeys(API_KEYS.googleKey, API_KEYS.nytKey);
    
    if (!success) {
      throw new Error('Failed to save API keys to secure storage');
    }

    // Verify keys were stored correctly
    console.log('\nVerifying stored keys...');
    const verifyKeys = await getAPIKeys();
    
    const googleKeyMatch = verifyKeys.googleKey === API_KEYS.googleKey;
    const nytKeyMatch = verifyKeys.nytKey === API_KEYS.nytKey;

    console.log('Verification results:');
    console.log('- Google Books API key stored:', !!verifyKeys.googleKey);
    console.log('- NYT API key stored:', !!verifyKeys.nytKey);
    console.log('- Google Books API key matches:', googleKeyMatch);
    console.log('- NYT API key matches:', nytKeyMatch);

    if (!googleKeyMatch || !nytKeyMatch) {
      throw new Error('Stored API keys do not match config');
    }

    console.log('\n=== Secure storage initialization successful ===\n');
    return true;
  } catch (error) {
    console.error('\n=== Secure storage initialization failed ===\n');
    console.error('Error:', error.message);
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

/**
 * Verify API keys in secure storage
 */
export async function verifyAPIKeys() {
  try {
    console.log('\n=== Verifying API Keys in Secure Storage ===\n');
    
    // Check if keys exist in config
    console.log('Config API Keys:');
    console.log('- Google Books API key in config:', !!API_KEYS.googleKey);
    console.log('- NYT API key in config:', !!API_KEYS.nytKey);

    // Get keys from secure storage
    const storedKeys = await getAPIKeys();
    console.log('\nSecure Storage API Keys:');
    console.log('- Google Books API key in storage:', !!storedKeys.googleKey);
    console.log('- NYT API key in storage:', !!storedKeys.nytKey);

    // Verify keys match
    const googleKeyMatch = storedKeys.googleKey === API_KEYS.googleKey;
    const nytKeyMatch = storedKeys.nytKey === API_KEYS.nytKey;
    
    console.log('\nKey Verification:');
    console.log('- Google Books API key matches:', googleKeyMatch);
    console.log('- NYT API key matches:', nytKeyMatch);

    // If keys don't match or are missing, reinitialize
    if (!googleKeyMatch || !nytKeyMatch) {
      console.log('\nReinitializing secure storage...');
      await initializeSecureStorage();
      
      // Verify again after reinitialization
      const verifiedKeys = await getAPIKeys();
      console.log('\nVerification after reinitialization:');
      console.log('- Google Books API key stored:', !!verifiedKeys.googleKey);
      console.log('- NYT API key stored:', !!verifiedKeys.nytKey);
    }

    console.log('\n=== API Keys Verification Complete ===\n');
    return {
      success: true,
      keysPresent: {
        google: !!storedKeys.googleKey,
        nyt: !!storedKeys.nytKey
      },
      keysMatch: {
        google: googleKeyMatch,
        nyt: nytKeyMatch
      }
    };
  } catch (error) {
    console.error('\n=== API Keys Verification Failed ===\n');
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export {
  initializeSecureStorage,
  saveAPIKeys,
  getAPIKeys,
  deleteAPIKeys
}; 
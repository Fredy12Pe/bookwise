import { saveAPIKeys } from '../lib/secureStorage.js';
import { API_KEYS } from '../config.js';

async function initAppApiKeys() {
  try {
    const result = await saveAPIKeys(API_KEYS.googleKey, API_KEYS.nytKey);
    if (result) {
      console.log('API keys stored successfully in secure storage');
    } else {
      console.error('Failed to store API keys');
    }
  } catch (error) {
    console.error('Error storing API keys:', error);
  }
}

initAppApiKeys(); 
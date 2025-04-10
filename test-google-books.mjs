import { searchGoogleBooks } from './lib/bookApi.js';

async function testSearch() {
  try {
    console.log('Testing Google Books API search...');
    const results = await searchGoogleBooks('harry potter');
    console.log('Search results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error testing Google Books API:', error);
  }
}

testSearch(); 
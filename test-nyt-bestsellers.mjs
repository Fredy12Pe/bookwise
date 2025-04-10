import { fetchNYTBestsellersList } from './lib/bookApi.js';

async function testBestsellers() {
  try {
    console.log('Testing NYT Bestsellers API...');
    const results = await fetchNYTBestsellersList();
    console.log('Bestsellers list:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error testing NYT Bestsellers API:', error);
  }
}

testBestsellers(); 
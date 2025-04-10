import { testGoogleBooksAPI, testNYTBooksAPI } from '../lib/bookApi.js';

async function runTests() {
  console.log('Starting API tests...\n');

  // Test Google Books API
  const googleResult = await testGoogleBooksAPI();
  console.log(googleResult.message);
  if (!googleResult.success) {
    console.error(googleResult.error);
  }

  console.log('\n');

  // Test NYT Books API
  const nytResult = await testNYTBooksAPI();
  console.log(nytResult.message);
  if (!nytResult.success) {
    console.error(nytResult.error);
  }

  console.log('\nTests completed.');
}

runTests().catch(error => {
  console.error('Error running tests:', error);
}); 
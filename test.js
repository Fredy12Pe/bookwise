const https = require('https');

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = 'AIzaSyD6LnRxjRCEqBW8Iauq7jNTvtD5SyWAKu0'; // From your config.js

function makeRequest(query) {
  return new Promise((resolve, reject) => {
    const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&key=${API_KEY}`;
    console.log('Making request to:', url.replace(API_KEY, 'HIDDEN'));

    https.get(url, (res) => {
      let data = '';

      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Raw response:', data.substring(0, 200) + '...');
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
  });
}

// Test the API
console.log('Testing Google Books API...');
makeRequest('Harry Potter')
  .then(response => {
    console.log('\nAPI test successful!');
    console.log('Total items:', response.totalItems);
    if (response.items && response.items.length > 0) {
      console.log('First book:', {
        title: response.items[0].volumeInfo.title,
        authors: response.items[0].volumeInfo.authors
      });
    }
  })
  .catch(error => {
    console.error('\nAPI test failed:', error.message);
  }); 
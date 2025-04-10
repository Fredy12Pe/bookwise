import { getAPIKeys } from './secureStorage.js';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const NYT_BOOKS_API = 'https://api.nytimes.com/svc/books/v3';

// Add delay helper for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Debug helper
function debugLog(title, data) {
  console.log('\n=== ' + title + ' ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('='.repeat(20) + '\n');
}

// Cache for ISBN lookups
const isbnCache = new Map();

// Simple request function with retries
async function makeGoogleBooksRequest(params) {
  const MAX_RETRIES = 3;
  const TIMEOUT = 30000; // 30 seconds timeout
  
  const { googleKey } = await getAPIKeys();
  if (!googleKey) {
    throw new Error('Google Books API key not found');
  }

  const queryString = Object.entries({ ...params, key: googleKey })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const url = `${GOOGLE_BOOKS_API}?${queryString}`;
  console.log('Request URL (key hidden):', url.replace(googleKey, 'HIDDEN'));

  let lastError = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Add longer delay between retries
      if (attempt > 0) {
        const waitTime = 5000 * (attempt + 1); // 5s, 10s, 15s
        console.log(`Retry ${attempt + 1}/${MAX_RETRIES}, waiting ${waitTime}ms`);
        await delay(waitTime);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          console.log('Rate limited, will retry after longer delay');
          await delay(10000); // Wait 10 seconds on rate limit
          continue;
        }

        // Handle other error responses
        if (!response.ok) {
          const text = await response.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error?.message || `API Error: ${response.status}`;
          } catch (e) {
            errorMessage = `API Error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === MAX_RETRIES - 1;
      const isRetryableError = 
        error.name === 'AbortError' || 
        error.message.includes('Network request failed') ||
        error.message.includes('429');

      if (!isRetryableError || isLastAttempt) {
        console.error('Final attempt failed:', error.message);
        throw error;
      }

      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Helper function to normalize book data from Google Books API
function normalizeGoogleBookData(item) {
  if (!item || !item.volumeInfo) {
    return null;
  }

  const volumeInfo = item.volumeInfo;
  return {
    id: item.id,
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors || [],
    description: volumeInfo.description || '',
    thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories || [],
    averageRating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount
  };
}

/**
 * Search books by query
 */
export async function fetchBooksByQuery(query, maxResults = 10) {
  try {
    const data = await makeGoogleBooksRequest({
      q: query,
      maxResults: maxResults.toString()
    });

    if (!data.items) {
      console.log('No results found for query:', query);
      return [];
    }

    return data.items.map(normalizeGoogleBookData).filter(Boolean) || [];
  } catch (error) {
    console.error('Error in fetchBooksByQuery:', error);
    return [];
  }
}

/**
 * Fetch Google Books metadata by ISBN with caching
 */
export async function enrichBookFromGoogle(isbn) {
  if (!isbn) {
    console.error('No ISBN provided');
    return null;
  }

  // Check cache first
  if (isbnCache.has(isbn)) {
    console.log(`Using cached data for ISBN: ${isbn}`);
    return isbnCache.get(isbn);
  }

  try {
    // Try ISBN-13 first
    const query = isbn.length === 13 
      ? `isbn:${isbn} OR isbn:${isbn.substring(3)}` // Search both ISBN-13 and its ISBN-10 equivalent
      : `isbn:${isbn}`;

    console.log('Searching with ISBN query:', query);

    const data = await makeGoogleBooksRequest({
      q: query,
      maxResults: '2' // Allow for potential matches of both ISBN formats
    });

    if (!data.items || data.items.length === 0) {
      console.log(`No Google Books data found for ISBN: ${isbn}`);
      // Cache negative result to avoid repeated lookups
      isbnCache.set(isbn, null);
      return null;
    }

    // Return the first valid match
    const normalizedBook = normalizeGoogleBookData(data.items[0]);
    if (normalizedBook) {
      // Cache the result
      isbnCache.set(isbn, normalizedBook);
      return normalizedBook;
    }

    console.log(`No valid book data found for ISBN: ${isbn}`);
    // Cache negative result
    isbnCache.set(isbn, null);
    return null;
  } catch (error) {
    console.error('Error enriching book from Google:', error);
    // Don't cache errors
    return null;
  }
}

/**
 * Fetch NYT bestsellers list with retry logic
 */
export async function fetchNYTBestsellersList(list = 'hardcover-fiction') {
  const MAX_RETRIES = 3;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { nytKey } = await getAPIKeys();
      if (!nytKey) {
        throw new Error('NYT API key not found');
      }

      // Add delay between retries
      if (attempt > 0) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 8000);
        console.log(`Retry ${attempt + 1}/${MAX_RETRIES}, waiting ${waitTime}ms`);
        await delay(waitTime);
      }

      const url = `${NYT_BOOKS_API}/lists/current/${list}.json?api-key=${nytKey}`;
      const response = await fetch(url);
      
      if (response.status === 429) {
        console.log('Rate limited, will retry');
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results.books.map(book => ({
        rank: book.rank,
        title: book.title,
        author: book.author,
        description: book.description,
        publisher: book.publisher,
        primaryIsbn13: book.primary_isbn13,
        amazonProductUrl: book.amazon_product_url,
        bookImage: book.book_image,
        weeksOnList: book.weeks_on_list
      }));
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES - 1;
      if (isLastAttempt) {
        console.error('Error fetching NYT Bestsellers:', error);
        throw error;
      }
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
    }
  }
}

/**
 * Test Google Books API
 */
export async function testGoogleBooksAPI() {
  try {
    console.log('Testing Google Books API...');
    const books = await fetchBooksByQuery('programming', 1);
    return {
      success: true,
      message: `Google Books API test successful - Found ${books.length} books`,
      data: books
    };
  } catch (error) {
    console.error('Google Books API test failed:', error);
    return {
      success: false,
      message: `Google Books API test failed: ${error.message}`,
      error: error
    };
  }
}

/**
 * Test NYT Books API
 */
export async function testNYTBooksAPI() {
  try {
    console.log('Testing NYT Books API...');
    const bestsellers = await fetchNYTBestsellersList();
    return {
      success: true,
      message: `NYT Books API test successful - Found ${bestsellers.length} bestsellers`,
      data: bestsellers
    };
  } catch (error) {
    console.error('NYT Books API test failed:', error);
    return {
      success: false,
      message: `NYT Books API test failed: ${error.message}`,
      error: error
    };
  }
} 
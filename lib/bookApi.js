import { getAPIKeys } from './secureStorage.js';
import { GOOGLE_BOOKS_API_KEY, NYT_API_KEY } from '@env';
import { Platform } from 'react-native';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const NYT_BOOKS_API = 'https://api.nytimes.com/svc/books/v3';
const OPEN_LIBRARY_API = 'https://openlibrary.org';

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

// Cache for all Google Books API requests
const apiCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Add at the top of the file after imports
const RATE_LIMIT = {
  requestsPerMinute: 30,
  requestQueue: [],
  lastRequestTime: 0
};

// Add before makeGoogleBooksRequest function
async function throttleRequest() {
  const now = Date.now();
  const minInterval = (60 * 1000) / RATE_LIMIT.requestsPerMinute; // Minimum time between requests
  
  // If we've made a request recently, wait before proceeding
  if (now - RATE_LIMIT.lastRequestTime < minInterval) {
    const waitTime = minInterval - (now - RATE_LIMIT.lastRequestTime);
    console.log(`Rate limiting: waiting ${Math.round(waitTime)}ms before next request`);
    await delay(waitTime);
  }
  
  RATE_LIMIT.lastRequestTime = Date.now();
}

// Helper function to get cache key
function getCacheKey(params) {
  return JSON.stringify(params);
}

// Add offline mode detection
let isOfflineMode = false;

// Helper to check network status
async function checkNetworkStatus() {
  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });
    isOfflineMode = false;
    return true;
  } catch (error) {
    isOfflineMode = true;
    return false;
  }
}

// Simple request function with retries and caching
async function makeGoogleBooksRequest(params) {
  const cacheKey = getCacheKey(params);
  
  // Always check cache first, especially important for offline mode
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    const { data, timestamp } = cachedData;
    const age = Date.now() - timestamp;
    
    // In offline mode, use cached data regardless of age
    if (isOfflineMode || age < CACHE_DURATION) {
      console.log('Using cached response for:', params);
      return data;
    } else if (!isOfflineMode) {
      console.log('Cache expired for:', params);
      apiCache.delete(cacheKey);
    }
  }

  // If we're offline and don't have cache, fail fast
  if (isOfflineMode) {
    throw new Error('No internet connection and no cached data available');
  }

  // Check network status before making request
  const isOnline = await checkNetworkStatus();
  if (!isOnline) {
    throw new Error('No internet connection available');
  }

  const MAX_RETRIES = 3;
  
  if (!GOOGLE_BOOKS_API_KEY) {
    throw new Error('Google Books API key not found in environment variables');
  }

  // Construct query parameters
  const queryParams = new URLSearchParams({
    ...params,
    key: GOOGLE_BOOKS_API_KEY
  });

  const url = `${GOOGLE_BOOKS_API}?${queryParams.toString()}`;
  console.log('Request URL (key hidden):', url.replace(GOOGLE_BOOKS_API_KEY, 'HIDDEN'));

  // Helper function to make a single request
  const makeRequest = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('Request timed out');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  };

  // Retry logic
  let lastError = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const waitTime = 2000 * Math.pow(2, attempt);
        console.log(`Retry ${attempt + 1}/${MAX_RETRIES}, waiting ${waitTime}ms`);
        await delay(waitTime);
      }

      console.log(`\nAttempt ${attempt + 1}: Making request...`);
      const data = await makeRequest();
      
      // Cache the successful response
      apiCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);

      const isRetryableError = 
        error.message.includes('Network error') ||
        error.message.includes('timeout') ||
        error.message.includes('No internet') ||
        error.message.includes('Rate limited');

      if (!isRetryableError || attempt === MAX_RETRIES - 1) {
        throw new Error(`Request failed: ${error.message}`);
      }
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
  const imageLinks = volumeInfo.imageLinks || {};
  
  // Get the best available image, preferring larger formats
  const thumbnail = imageLinks.thumbnail || imageLinks.smallThumbnail;
  const secureImage = thumbnail ? thumbnail.replace(/^http:/, 'https:') : '';

  return {
    id: item.id,
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors || [],
    description: volumeInfo.description || '',
    thumbnail: secureImage,
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories || [],
    averageRating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount
  };
}

// Enhanced cache configuration
const CACHE_CONFIG = {
  search: {
    duration: 24 * 60 * 60 * 1000, // 24 hours for search results
    maxEntries: 100 // Limit cache size
  },
  isbn: {
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days for ISBN lookups
    maxEntries: 1000 // ISBN cache can be larger
  }
};

// Cache cleanup helper
function cleanupCache(cache, maxEntries) {
  if (cache.size > maxEntries) {
    const entriesToDelete = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, cache.size - maxEntries);
    
    entriesToDelete.forEach(([key]) => cache.delete(key));
  }
}

// Update placeholder image constants
const PLACEHOLDER_IMAGES = {
  DEFAULT: 'https://dummyimage.com/200x300/e0e0e0/666666.jpg&text=No+Cover',
  ERROR: 'https://dummyimage.com/200x300/ffebee/c62828.jpg&text=Error',
  NOT_FOUND: 'https://dummyimage.com/200x300/eeeeee/999999.jpg&text=Not+Found',
  LOADING: 'https://dummyimage.com/200x300/e3f2fd/1976d2.jpg&text=Loading',
};

// Update processBookData function with better image handling
const processBookData = (item) => {
  if (!item?.volumeInfo) return null;

  const { volumeInfo } = item;
  const imageLinks = volumeInfo.imageLinks || {};
  
  // Only process books that have actual cover images from Google Books API
  if (!imageLinks.thumbnail && !imageLinks.smallThumbnail) {
    return null;
  }

  // Get the highest quality image available
  const thumbnail = imageLinks.thumbnail?.replace('http:', 'https:') ||
                   imageLinks.smallThumbnail?.replace('http:', 'https:');

  return {
    id: item.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || [],
    publisher: volumeInfo.publisher || 'Unknown Publisher',
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description || '',
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories || [],
    thumbnail,
    language: volumeInfo.language,
  };
};

// Update getAmazonCover function with the new URL format
function getAmazonCover(isbn) {
  if (!isbn) return null;
  return `https://m.media-amazon.com/images/P/${isbn}.01.L.jpg`;
}

// Add helper function to get Open Library cover URL
function getOpenLibraryCover(coverId, size = 'M') {
  if (!coverId) return null;
  // S = small, M = medium, L = large
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

// Add helper function for Open Library
async function searchOpenLibrary(query, maxResults = 10) {
  try {
    const url = `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=${maxResults}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.docs || !Array.isArray(data.docs)) {
      console.log('No results from Open Library');
      return [];
    }
    
    return data.docs.map(book => {
      return {
        id: book.key,
        title: book.title,
        authors: book.author_name || [],
        description: book.description || '',
        thumbnail: null, // We'll let the BookCard component handle the fallback
        publishedDate: book.first_publish_year?.toString(),
        pageCount: book.number_of_pages_median,
        categories: book.subject || [],
        publisher: book.publisher?.[0]
      };
    }).filter(book => book.title && book.authors.length > 0);
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return [];
  }
}

// Add helper function for Open Library ISBN lookup
async function lookupOpenLibrary(isbn) {
  if (!isbn) {
    console.log('No ISBN provided for Open Library lookup');
    return null;
  }

  try {
    // First try to get edition data which has better cover information
    const editionUrl = `${OPEN_LIBRARY_API}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const response = await fetch(editionUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];
    
    if (!bookData) {
      console.log(`No Open Library data found for ISBN: ${isbn}`);
      return null;
    }

    // Get cover ID from the edition data
    let thumbnail = null;
    let coverId = null;

    if (bookData.cover) {
      // Extract cover ID from the URL if available
      const coverUrl = bookData.cover.medium || bookData.cover.small || bookData.cover.large;
      if (coverUrl) {
        const match = coverUrl.match(/\/id\/(\d+)-/);
        if (match) {
          coverId = match[1];
          thumbnail = getOpenLibraryCover(coverId);
        }
      }
    }

    return {
      id: bookData.key,
      title: bookData.title,
      authors: bookData.authors?.map(author => author.name) || [],
      description: bookData.notes || bookData.description || '',
      thumbnail,
      publishedDate: bookData.publish_date,
      pageCount: bookData.number_of_pages,
      publisher: bookData.publishers?.[0]?.name,
      categories: bookData.subjects?.map(subject => subject.name) || [],
      coverId
    };
  } catch (error) {
    console.error('Error looking up ISBN in Open Library:', error);
    return null;
  }
}

// Wrapper function that uses Open Library directly
// export async function fetchBooksByQuery(query, maxResults = 10) {
//   try {
//     // First try to get NYT bestsellers that match the query
//     const nytBooks = await fetchNYTBestsellersList();
//     const matchingNytBooks = nytBooks.filter(book => 
//       book.title.toLowerCase().includes(query.toLowerCase()) ||
//       (book.authors[0] && book.authors[0].toLowerCase().includes(query.toLowerCase()))
//     ).slice(0, maxResults);

//     // If we found matching NYT books, return those
//     if (matchingNytBooks.length > 0) {
//       console.log('Found matching NYT books:', matchingNytBooks.length);
//       return matchingNytBooks;
//     }

//     // Otherwise, search Open Library
//     console.log('Searching Open Library for:', query);
//     const openLibraryResults = await searchOpenLibrary(query, maxResults);
    
//     // Process Open Library results to match our format
//     return openLibraryResults.map(book => ({
//       ...book,
//       // Add fallback image handling
//       thumbnail: book.thumbnail || (book.isbn ? getAmazonCover(book.isbn) : null)
//     }));
//   } catch (error) {
//     console.error('Search failed:', error);
//     return [];
//   }
// }

// Add helper to get cached NYT books
function getCachedNYTBooks() {
  // Check all cached lists
  const allBooks = [];
  for (const [_, cached] of NYT_CACHE.lists) {
    if (cached && cached.data) {
      allBooks.push(...cached.data);
    }
  }
  return allBooks;
}

// Update enrichBookFromGoogle to use the new placeholders
export async function enrichBookFromGoogle(isbn) {
  if (!isbn) {
    console.log('No ISBN provided for enrichment');
    return {
      id: 'no-isbn',
      title: 'Missing ISBN',
      authors: [],
      description: '',
      thumbnail: PLACEHOLDER_IMAGES.ERROR,
      primaryIsbn13: '',
      primaryIsbn10: '',
      buyLinks: []
    };
  }

  try {
    // First check cached NYT bestsellers for this ISBN
    const cachedNYTBooks = getCachedNYTBooks();
    const nytBook = cachedNYTBooks.find(book => 
      book.primaryIsbn13 === isbn || book.primaryIsbn10 === isbn
    );

    if (nytBook) {
      console.log('Found book in cached NYT bestsellers');
      return {
        ...nytBook,
        thumbnail: nytBook.thumbnail || getAmazonCover(isbn) || PLACEHOLDER_IMAGES.DEFAULT
      };
    }

    // If not in cache, try Open Library
    console.log('Looking up book in Open Library:', isbn);
    const openLibraryResult = await lookupOpenLibrary(isbn);
    
    if (openLibraryResult) {
      const thumbnail = openLibraryResult.thumbnail || getAmazonCover(isbn) || PLACEHOLDER_IMAGES.DEFAULT;
      
      return {
        ...openLibraryResult,
        thumbnail,
        primaryIsbn13: isbn,
        primaryIsbn10: '',
        buyLinks: []
      };
    }

    // If no results found, return basic info with ISBN
    return {
      id: isbn,
      title: 'Book Not Found',
      authors: [],
      description: '',
      thumbnail: PLACEHOLDER_IMAGES.NOT_FOUND,
      primaryIsbn13: isbn,
      primaryIsbn10: '',
      buyLinks: []
    };
  } catch (error) {
    console.error('Book enrichment failed:', error);
    // Return basic info on error
    return {
      id: isbn,
      title: 'Error Loading Book',
      authors: [],
      description: '',
      thumbnail: PLACEHOLDER_IMAGES.ERROR,
      primaryIsbn13: isbn,
      primaryIsbn10: '',
      buyLinks: []
    };
  }
}

// Add NYT cache configuration
const NYT_CACHE = {
  lists: new Map(),
  duration: 15 * 60 * 1000, // 15 minutes cache duration
  lastRequest: 0,
  minInterval: 6000, // 6 seconds between requests (10 requests per minute limit)
};

// Add NYT rate limiting helper
async function throttleNYTRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - NYT_CACHE.lastRequest;
  
  if (timeSinceLastRequest < NYT_CACHE.minInterval) {
    const waitTime = NYT_CACHE.minInterval - timeSinceLastRequest;
    console.log(`NYT rate limiting: waiting ${Math.round(waitTime)}ms`);
    await delay(waitTime);
  }
  
  NYT_CACHE.lastRequest = Date.now();
}

/**
 * Fetch NYT bestsellers list with caching and rate limiting
 */
export async function fetchNYTBestsellersList(list = 'hardcover-fiction') {
  try {
    console.log('Fetching NYT bestsellers list:', list);
    const url = `${BASE_URL}/nyt/books/lists?list=${encodeURIComponent(list)}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('NYT Books API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Found', data.results?.books?.length || 0, 'books in NYT list');
    
    return data.results?.books?.map(book => ({
      id: book.primary_isbn13 || book.primary_isbn10,
      title: book.title,
      authors: [book.author],
      publisher: book.publisher,
      description: book.description,
      thumbnail: book.book_image,
      rank: book.rank,
      weeksOnList: book.weeks_on_list
    })) || [];
  } catch (error) {
    console.error('Error fetching NYT bestsellers:', {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack,
      list: list
    });
    return [];
  }
}

/**
 * Test function for Open Library API
 */
export async function testGoogleBooksAPI() {
  try {
    console.log('\n=== Starting Open Library API Test ===\n');
    
    // Test 1: Simple search
    console.log('\nTest 1: Simple Search');
    const searchResults = await fetchBooksByQuery('Harry Potter', 1);
    console.log('Search results count:', searchResults?.length);
    if (searchResults?.length > 0) {
      console.log('First result:', {
        title: searchResults[0].title,
        authors: searchResults[0].authors,
        id: searchResults[0].id
      });
    }

    // Test 2: ISBN lookup
    console.log('\nTest 2: ISBN Lookup');
    const testISBN = '9780439064873'; // Harry Potter and the Chamber of Secrets
    const bookDetails = await enrichBookFromGoogle(testISBN);
    console.log('ISBN lookup result:', bookDetails ? {
      title: bookDetails.title,
      authors: bookDetails.authors,
      id: bookDetails.id
    } : 'No results');

    console.log('\n=== Open Library API Test Complete ===\n');
    
    return {
      success: true,
      message: 'All Open Library API tests completed successfully',
      details: {
        searchWorking: searchResults?.length > 0,
        isbnLookupWorking: !!bookDetails
      }
    };
  } catch (error) {
    console.error('\n=== Open Library API Test Failed ===\n');
    console.error('Error details:', error);
    return {
      success: false,
      message: `Open Library API test failed: ${error.message}`,
      error: {
        message: error.message,
        stack: error.stack
      }
    };
  }
}

/**
 * Test NYT Books API
 */
export async function testNYTBooksAPI() {
  try {
    console.log('\n=== Starting NYT Books API Test ===\n');
    
    const bestsellers = await fetchNYTBestsellersList();
    console.log(`Found ${bestsellers?.length || 0} bestsellers`);
    
    if (bestsellers?.length > 0) {
      console.log('First bestseller:', {
        title: bestsellers[0].title,
        author: bestsellers[0].authors?.[0],
        rank: bestsellers[0].rank
      });
    }

    console.log('\n=== NYT Books API Test Complete ===\n');
    
    return {
      success: true,
      message: `NYT Books API test successful - Found ${bestsellers?.length || 0} bestsellers`,
      data: bestsellers?.slice(0, 3) // Return first 3 books for verification
    };
  } catch (error) {
    console.error('\n=== NYT Books API Test Failed ===\n');
    console.error('Error details:', error);
    return {
      success: false,
      message: `NYT Books API test failed: ${error.message}`,
      error: error
    };
  }
}

/**
 * Test API configuration
 */
export async function testAPIKeys() {
  console.log('\n=== Starting API Configuration Test ===\n');
  
  const results = {
    nyt: { success: false, error: null },
    openLibrary: { success: false, error: null }
  };
  
  // Test NYT API
  try {
    console.log('Testing NYT API...');
    const { nytKey } = await getAPIKeys();
    if (!nytKey) {
      throw new Error('NYT API key not found in configuration');
    }
    const nytResults = await fetchNYTBestsellersList();
    results.nyt.success = nytResults && nytResults.length > 0;
    console.log('NYT API test:', results.nyt.success ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    results.nyt.error = error.message;
    console.error('NYT API test failed:', error.message);
  }
  
  // Test Open Library API (no key needed)
  try {
    console.log('Testing Open Library API...');
    const openLibraryResults = await searchOpenLibrary('The Hobbit', 1);
    results.openLibrary.success = openLibraryResults && openLibraryResults.length > 0;
    console.log('Open Library API test:', results.openLibrary.success ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    results.openLibrary.error = error.message;
    console.error('Open Library API test failed:', error.message);
  }
  
  console.log('\n=== API Configuration Test Complete ===\n');
  return results;
}

const handleGoogleBooksResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    console.error('Google Books API Error:', {
      status: response.status,
      error: error,
    });
    throw new Error(`Google Books API error: ${response.status}`);
  }
  return response.json();
};

export const fetchBooks = async () => {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=textbook&maxResults=10&key=${GOOGLE_BOOKS_API_KEY}`
    );
    const data = await handleGoogleBooksResponse(response);
    return data.items?.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      publisher: item.volumeInfo.publisher || 'Unknown Publisher',
      publishedDate: item.volumeInfo.publishedDate,
      description: item.volumeInfo.description,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
    })) || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

// Use localhost for iOS simulator, different IP for Android
const BASE_URL = Platform.OS === 'ios' 
  ? 'http://localhost:3001/api'
  : 'http://10.0.2.2:3001/api';

const processGoogleBooksResponse = (items) => {
  if (!items) return [];
  
  return items.map(item => {
    const id = item.id;
    const volumeInfo = item.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};
    
    console.log('Processing book:', {
      id,
      title: volumeInfo.title,
      imageLinks,
      publicImage: volumeInfo.publicImage,
      fallbackImages: volumeInfo.fallbackImages
    });
    
    // Get the best available image URL in order of preference
    const thumbnail = 
      volumeInfo.publicImage || // First try the public image URL
      imageLinks.thumbnail?.replace('http:', 'https:') || // Then try the thumbnail
      imageLinks.smallThumbnail?.replace('http:', 'https:') || // Then try small thumbnail
      volumeInfo.fallbackImages?.openLibrary || // Then try Open Library
      volumeInfo.fallbackImages?.amazon; // Finally try Amazon

    console.log('Selected thumbnail URL:', thumbnail);

    return {
      id,
      title: volumeInfo.title,
      authors: volumeInfo.authors || [],
      publisher: volumeInfo.publisher || 'Unknown Publisher',
      publishedDate: volumeInfo.publishedDate,
      description: volumeInfo.description || '',
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories || [],
      thumbnail: thumbnail || 
                `https://via.placeholder.com/300x400/211B32/FFFFFF?text=${encodeURIComponent(volumeInfo.title)}`,
      language: volumeInfo.language,
    };
  });
};

const fetchBooksWithRetry = async (endpoint, maxAttempts = 3) => {
  let allBooks = [];
  let attempt = 0;
  let startIndex = 0;

  while (allBooks.length < 10 && attempt < maxAttempts) {
    try {
      console.log(`Fetching books attempt ${attempt + 1} from index ${startIndex}`);
      const response = await fetch(
        `${endpoint}&startIndex=${startIndex}&maxResults=20`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Received ${data.items?.length || 0} items from API`);
      
      if (!data.items || data.items.length === 0) break;

      const booksWithCovers = processGoogleBooksResponse(data.items);
      console.log(`Processed ${booksWithCovers.length} books with covers`);
      
      allBooks = [...allBooks, ...booksWithCovers];
      startIndex += 20;
      attempt++;
    } catch (error) {
      console.error('Error fetching books:', error);
      attempt++;
    }
  }

  return allBooks.length > 0 ? allBooks : PLACEHOLDER_BOOKS;
};

export const fetchBooksByQuery = async (query) => {
  try {
    const endpoint = `${BASE_URL}/google/books?q=${encodeURIComponent(query)}`;
    const books = await fetchBooksWithRetry(endpoint);
    return books;
  } catch (error) {
    console.error('Error in fetchBooksByQuery:', error);
    return PLACEHOLDER_BOOKS;
  }
};

export const fetchBooksByCategory = async (category) => {
  try {
    const endpoint = `${BASE_URL}/google/books/category?category=${encodeURIComponent(category)}`;
    const books = await fetchBooksWithRetry(endpoint);
    
    // Ensure all thumbnails are HTTPS and valid
    return books.map(book => ({
      ...book,
      thumbnail: book.thumbnail 
        ? book.thumbnail.replace(/^http:/, 'https:').replace('&edge=curl', '')
        : null
    }));
  } catch (error) {
    console.error('Error in fetchBooksByCategory:', error);
    return PLACEHOLDER_BOOKS;
  }
};

export const fetchBookDetails = async (bookId) => {
  try {
    const response = await fetch(`${BASE_URL}/google/books/${bookId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      title: data.volumeInfo.title,
      authors: data.volumeInfo.authors || [],
      publisher: data.volumeInfo.publisher || 'Unknown Publisher',
      publishedDate: data.volumeInfo.publishedDate,
      description: data.volumeInfo.description,
      pageCount: data.volumeInfo.pageCount,
      categories: data.volumeInfo.categories || [],
      thumbnail: data.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      isbn: data.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier,
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
};

// Update PLACEHOLDER_BOOKS to ensure all have thumbnails
export const PLACEHOLDER_BOOKS = [
  {
    id: '1',
    title: 'Geografi Kelas XI',
    authors: ['Tim Erlangga'],
    publisher: 'Erlangga',
    color: '#4263EB',
    thumbnail: 'https://via.placeholder.com/300x400/4263EB/FFFFFF?text=Geografi+XI',
  },
  {
    id: '2',
    title: 'Fisika Kelas XI',
    authors: ['Tim Erlangga'],
    publisher: 'Erlangga',
    color: '#FF6B6B',
    thumbnail: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Fisika+XI',
  },
  {
    id: '3',
    title: 'Kimia Kelas 11',
    authors: ['Tim Erlangga'],
    publisher: 'Erlangga',
    color: '#20C997',
    thumbnail: 'https://via.placeholder.com/300x400/20C997/FFFFFF?text=Kimia+11',
  },
  {
    id: '4',
    title: 'Biologi Kelas XI',
    authors: ['Tim Erlangga'],
    publisher: 'Erlangga',
    color: '#845EF7',
    thumbnail: 'https://via.placeholder.com/300x400/845EF7/FFFFFF?text=Biologi+XI',
  },
  {
    id: '5',
    title: 'Matematika Kelas 11',
    authors: ['Tim Erlangga'],
    publisher: 'Erlangga',
    color: '#FF922B',
    thumbnail: 'https://via.placeholder.com/300x400/FF922B/FFFFFF?text=Matematika+11',
  },
  {
    id: '6',
    title: 'Sejarah Indonesia',
    authors: ['Tim Erlangga'],
    publisher: 'Erlangga',
    color: '#51CF66',
    thumbnail: 'https://via.placeholder.com/300x400/51CF66/FFFFFF?text=Sejarah+Indonesia',
  },
];

const getBookThumbnail = (book) => {
  if (!book.volumeInfo) return null;

  // Try publicImage first
  if (book.volumeInfo.publicImage) {
    return book.volumeInfo.publicImage;
  }

  // Then try the cleaned thumbnail
  if (book.volumeInfo.imageLinks?.thumbnail) {
    return book.volumeInfo.imageLinks.thumbnail;
  }

  // Finally try fallback images
  if (book.volumeInfo.fallbackImages) {
    return (
      book.volumeInfo.fallbackImages.openLibrary ||
      book.volumeInfo.fallbackImages.amazon
    );
  }

  return null;
}; 
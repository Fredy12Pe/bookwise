import { getAPIKeys } from './secureStorage.js';

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
  
  const { googleKey } = await getAPIKeys();
  if (!googleKey) {
    throw new Error('Google Books API key not found');
  }

  // Add throttling before making the request
  await throttleRequest();

  // Construct query parameters
  const queryParams = new URLSearchParams({
    ...params,
    key: googleKey
  });

  const url = `${GOOGLE_BOOKS_API}?${queryParams.toString()}`;
  console.log('Request URL (key hidden):', url.replace(googleKey, 'HIDDEN'));

  // Helper function to make a single request
  const makeRequest = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000
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
function processBookData(book) {
  if (!book) {
    console.log('Invalid book data received');
    return null;
  }

  // Get the best available image
  let thumbnail = null;
  
  try {
    // Try Google Books API format first (most reliable)
    if (book.primary_isbn13) {
      thumbnail = `https://books.google.com/books/content?vid=ISBN${book.primary_isbn13}&printsec=frontcover&img=1&zoom=1`;
      console.log('Using Google Books image for ISBN13:', book.primary_isbn13);
    } else if (book.primary_isbn10) {
      thumbnail = `https://books.google.com/books/content?vid=ISBN${book.primary_isbn10}&printsec=frontcover&img=1&zoom=1`;
      console.log('Using Google Books image for ISBN10:', book.primary_isbn10);
    }
    
    // If no ISBN, try NYT image if it's a valid HTTPS URL
    if (!thumbnail && book.book_image && 
        book.book_image.startsWith('https://') && 
        !book.book_image.includes('storage.googleapis.com')) {
      thumbnail = book.book_image;
      console.log('Using NYT image for:', book.title);
    }

    // If still no image, try WorldCat as last resort
    if (!thumbnail && (book.primary_isbn13 || book.primary_isbn10)) {
      const isbn = book.primary_isbn13 || book.primary_isbn10;
      thumbnail = `https://coverart.oclc.org/ImageWebSvc/oclc/+-+${isbn}_140.jpg`;
      console.log('Using WorldCat image for ISBN:', isbn);
    }
  } catch (error) {
    console.error('Error processing book image:', error);
    thumbnail = null;
  }
  
  // Log the final thumbnail URL
  console.log(`Final thumbnail for "${book.title}":`, thumbnail);
  
  return {
    id: book.primary_isbn13 || book.primary_isbn10 || String(book.rank),
    rank: book.rank,
    title: book.title || 'Unknown Title',
    authors: book.author ? [book.author] : [],
    description: book.description || '',
    publisher: book.publisher || '',
    primaryIsbn13: book.primary_isbn13 || '',
    primaryIsbn10: book.primary_isbn10 || '',
    amazonProductUrl: book.amazon_product_url || '',
    thumbnail: thumbnail,
    weeksOnList: book.weeks_on_list || 0,
    buyLinks: book.buy_links || []
  };
}

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
export async function fetchBooksByQuery(query, maxResults = 10) {
  try {
    // First try to get NYT bestsellers that match the query
    const nytBooks = await fetchNYTBestsellersList();
    const matchingNytBooks = nytBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      (book.authors[0] && book.authors[0].toLowerCase().includes(query.toLowerCase()))
    ).slice(0, maxResults);

    // If we found matching NYT books, return those
    if (matchingNytBooks.length > 0) {
      console.log('Found matching NYT books:', matchingNytBooks.length);
      return matchingNytBooks;
    }

    // Otherwise, search Open Library
    console.log('Searching Open Library for:', query);
    const openLibraryResults = await searchOpenLibrary(query, maxResults);
    
    // Process Open Library results to match our format
    return openLibraryResults.map(book => ({
      ...book,
      // Add fallback image handling
      thumbnail: book.thumbnail || (book.isbn ? getAmazonCover(book.isbn) : null)
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

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
  // Check cache first
  const cacheKey = list;
  const cached = NYT_CACHE.lists.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < NYT_CACHE.duration) {
    console.log(`Using cached NYT list: ${list}`);
    return cached.data;
  }

  const MAX_RETRIES = 3;
  let lastError = null;
  
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

      // Apply rate limiting
      await throttleNYTRequest();

      const url = `${NYT_BOOKS_API}/lists/current/${list}.json?api-key=${nytKey}`;
      console.log('Fetching NYT list:', list);
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Log raw data for debugging
      console.log('Raw NYT response for first book:', data.results?.books?.[0]);
      
      // Check for rate limiting response
      if (response.status === 429 || (data.status === 'ERROR' && data.fault?.faultstring?.includes('quota'))) {
        console.log('Rate limited by NYT API, waiting before retry...');
        lastError = new Error('NYT API rate limit exceeded');
        await delay(10000); // 10 seconds
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Validate the response data structure
      if (!data.results || !Array.isArray(data.results.books)) {
        console.error('Invalid NYT API response structure:', data);
        throw new Error('Invalid NYT API response structure');
      }
      
      // Process books with the new function
      const processedBooks = data.results.books.map(processBookData);

      // Cache the successful response
      NYT_CACHE.lists.set(cacheKey, {
        data: processedBooks,
        timestamp: Date.now()
      });

      return processedBooks;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === MAX_RETRIES - 1;
      
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      
      if (isLastAttempt) {
        console.error('All attempts to fetch NYT Bestsellers failed:', error);
        throw new Error(`Failed to fetch NYT Bestsellers: ${error.message}`);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
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
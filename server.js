require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// OpenAI API proxy
app.post('/api/openai/chat/completions', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google Books API proxy
app.get('/api/google/books', async (req, res) => {
  try {
    if (!process.env.GOOGLE_BOOKS_API_KEY) {
      throw new Error('Google Books API key is not configured');
    }

    const { q, maxResults = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Add projection=full to get more book details including high-res images
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${maxResults}&projection=full&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    console.log('Google Books API request:', url.replace(process.env.GOOGLE_BOOKS_API_KEY, 'HIDDEN'));
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Books API error response:', errorText);
      return res.status(response.status).json({ error: 'Google Books API request failed' });
    }
    
    const data = await response.json();

    // Process the response to enhance image handling
    if (data.items) {
      data.items = data.items.map(item => {
        const volumeInfo = item.volumeInfo;
        if (volumeInfo) {
          // Get all available image links
          const imageLinks = volumeInfo.imageLinks || {};
          console.log('Original image links:', imageLinks);
          
          // Get the best available image, preferring larger formats
          const bestImage = 
            imageLinks.extraLarge ||
            imageLinks.large ||
            imageLinks.medium ||
            imageLinks.small ||
            imageLinks.thumbnail ||
            imageLinks.smallThumbnail;

          console.log('Best image found:', bestImage);

          // Ensure HTTPS and clean up the URL
          if (bestImage) {
            const cleanedImage = bestImage
              .replace(/^http:/, 'https:')
              .replace(/&edge=curl/g, '')
              .replace(/&zoom=\d+/g, '')
              .replace(/&source=gbs_api/g, '')
              .replace(/&printsec=frontcover/g, '')
              .replace(/&img=\d+/g, '');
            
            console.log('Cleaned image URL:', cleanedImage);
            
            volumeInfo.imageLinks = {
              ...imageLinks,
              thumbnail: cleanedImage
            };
          }

          // Try to get ISBN if available
          const isbn = volumeInfo.industryIdentifiers?.find(id => 
            id.type === 'ISBN_13' || id.type === 'ISBN_10'
          )?.identifier;

          console.log('ISBN found:', isbn);

          // Add fallback image sources
          if (isbn) {
            const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            const amazonUrl = `https://images-na.ssl-images-amazon.com/images/P/${isbn}.01.L.jpg`;
            
            console.log('Fallback URLs:', { openLibraryUrl, amazonUrl });
            
            volumeInfo.fallbackImages = {
              openLibrary: openLibraryUrl,
              amazon: amazonUrl
            };
          }

          // Add a direct Google Books public image URL
          if (item.id) {
            const publicImageUrl = `https://books.google.com/books/publisher/content/images/frontcover/${item.id}?fife=w400-h600`;
            console.log('Public image URL:', publicImageUrl);
            volumeInfo.publicImage = publicImageUrl;
          }
        }
        return item;
      });
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Google Books proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// NYT Books API proxy
app.get('/api/nyt/lists/current/:list', async (req, res) => {
  try {
    if (!process.env.NYT_API_KEY) {
      throw new Error('NYT API key is not configured');
    }

    const list = req.params.list || 'hardcover-fiction';
    const url = `https://api.nytimes.com/svc/books/v3/lists/current/${list}.json?api-key=${process.env.NYT_API_KEY}`;
    console.log('NYT Books API request:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('NYT Books API error response:', errorText);
      return res.status(response.status).json({ error: 'NYT Books API request failed', details: errorText });
    }
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('NYT Books proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google Books API proxy for category search
app.get('/api/google/books/category', async (req, res) => {
  try {
    if (!process.env.GOOGLE_BOOKS_API_KEY) {
      throw new Error('Google Books API key is not configured');
    }

    const { category, maxResults = 10 } = req.query;
    if (!category) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(category)}&maxResults=${maxResults}&projection=full&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    console.log('Google Books API category request:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Books API error response:', errorText);
      return res.status(response.status).json({ error: 'Google Books API request failed' });
    }
    
    const data = await response.json();

    // Process the response to enhance image handling
    if (data.items) {
      data.items = data.items.map(item => {
        const volumeInfo = item.volumeInfo;
        if (volumeInfo) {
          // Get all available image links
          const imageLinks = volumeInfo.imageLinks || {};
          
          // Get the best available image, preferring larger formats
          const bestImage = 
            imageLinks.extraLarge ||
            imageLinks.large ||
            imageLinks.medium ||
            imageLinks.small ||
            imageLinks.thumbnail ||
            imageLinks.smallThumbnail;

          // Ensure HTTPS and clean up the URL
          if (bestImage) {
            volumeInfo.imageLinks = {
              ...imageLinks,
              thumbnail: bestImage
                .replace(/^http:/, 'https:')
                .replace(/&edge=curl/g, '')
                .replace(/&zoom=\d+/g, '')
                .replace(/&source=gbs_api/g, '')
                .replace(/&printsec=frontcover/g, '')
                .replace(/&img=\d+/g, ''),
            };
          }

          // Try to get ISBN if available
          const isbn = volumeInfo.industryIdentifiers?.find(id => 
            id.type === 'ISBN_13' || id.type === 'ISBN_10'
          )?.identifier;

          // Add fallback image sources
          if (isbn) {
            volumeInfo.fallbackImages = {
              openLibrary: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
              amazon: `https://images-na.ssl-images-amazon.com/images/P/${isbn}.01.L.jpg`
            };
          }

          // Add a direct Google Books public image URL
          if (item.id) {
            volumeInfo.publicImage = `https://books.google.com/books/publisher/content/images/frontcover/${item.id}?fife=w400-h600`;
          }
        }
        return item;
      });
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Google Books category proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('API Keys status:', {
    openai: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
    google: process.env.GOOGLE_BOOKS_API_KEY ? 'Configured' : 'Missing',
    nyt: process.env.NYT_API_KEY ? 'Configured' : 'Missing'
  });
}); 
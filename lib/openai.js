import { Platform } from 'react-native';
import { OPENAI_API_KEY } from '@env';

// Use localhost for iOS simulator, different IP for Android
const BASE_URL = Platform.OS === 'ios' 
  ? 'http://127.0.0.1:3000/api/openai'
  : 'http://10.0.2.2:3000/api/openai';

async function makeRequest(endpoint, body) {
  const url = `${BASE_URL}${endpoint}`;
  console.log('Making OpenAI request to:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('OpenAI error:', data.error);
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('OpenAI request failed:', {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack
    });
    throw error;
  }
}

export async function testConnection() {
  try {
    console.log('Testing OpenAI connection...');

    const data = await makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    
    console.log('Test connection successful:', data);
    return { success: true, message: 'Connection successful!' };
  } catch (error) {
    console.error('Test connection failed:', error);
    
    let errorMessage = 'Connection failed';
    
    if (error.message.includes('Network Error') || error.message.includes('network request failed')) {
      errorMessage = 'Network error - Please check your internet connection';
    } else if (error.message.includes('401')) {
      errorMessage = 'Invalid API key - Please check your API key configuration';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out - Please try again';
    }
    
    return { 
      success: false, 
      message: errorMessage,
      details: error.message
    };
  }
}

export async function generateSummary(book) {
  try {
    if (!book?.title) {
      throw new Error('No book title provided');
    }

    const data = await makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates concise summaries for educational textbooks. Focus on the main topics and learning objectives.' 
        },
        { 
          role: 'user', 
          content: `Please provide a brief summary for this educational textbook:\n\nTitle: ${book.title}\nPublisher: ${book.publisher}\n\nThis is a textbook used in Indonesian high schools. Please provide a general overview of what students might learn from this subject.` 
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw new Error(error.message || 'Failed to generate summary');
  }
}

export async function generateAnalysis(text) {
  try {
    if (!text) {
      throw new Error('No text provided for analysis');
    }

    const data = await makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that provides detailed analysis of text.' 
        },
        { 
          role: 'user', 
          content: `Please analyze the following text:\n\n${text}` 
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(error.message || 'Failed to generate analysis');
  }
}

export const generateFlashcards = async (text) => {
  try {
    if (!text) {
      return { success: false, error: 'No text provided for flashcard generation' };
    }

    const data = await makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Create 12 study cards in JSON format.'
        },
        {
          role: 'user',
          content: `Create 12 study cards based on this text: ${text}. Each card should have a type (concept, definition, example, or key_point), a front (question or concept), a back (answer or explanation), and tags. Return only a valid JSON array.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = data.choices[0].message.content;
    
    // Clean and parse the response
    const cleanContent = content
      .trim()
      .replace(/```json\n|\n```/g, '')
      .replace(/```\n|\n```/g, '')
      .trim();

    const flashcards = JSON.parse(cleanContent);
    
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return { success: false, error: 'Invalid flashcards format' };
    }

    return { success: true, data: flashcards };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate flashcards' 
    };
  }
};

export async function askBookQuestion(book, question) {
  try {
    const data = await makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational assistant that answers questions about books and study materials.'
        },
        {
          role: 'user',
          content: `Regarding the book "${book.title}": ${question}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(error.message || 'Failed to answer book question');
  }
}

const makeOpenAIRequest = async (endpoint, options) => {
  try {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return { success: false, error: 'OpenAI API key is missing' };
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return { 
        success: false, 
        error: errorData.error?.message || `HTTP error! status: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error making OpenAI request:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to make OpenAI request' 
    };
  }
}; 
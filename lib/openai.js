import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateSummary = async (title) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides book summaries. Provide three versions: short (1-2 sentences), medium (3-4 sentences), and long (5-6 sentences)."
        },
        {
          role: "user",
          content: `Please provide a summary of the book "${title}" in three different lengths.`
        }
      ],
    });

    const summary = response.choices[0].message.content;
    return {
      short: summary.split('\n')[0],
      medium: summary.split('\n')[1],
      long: summary.split('\n')[2],
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

export const generateFlashcards = async (summary) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates educational flashcards. Create 5 Q&A pairs based on the provided summary."
        },
        {
          role: "user",
          content: `Create 5 flashcards based on this summary: ${summary}`
        }
      ],
    });

    const flashcards = response.choices[0].message.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [question, answer] = line.split('Answer:').map(part => part.trim());
        return {
          question: question.replace('Question:', '').trim(),
          answer: answer.trim(),
        };
      });

    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}; 
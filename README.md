# Bookwise - AI-Powered Book Learning App

Bookwise is a mobile application designed to enhance your learning experience from books using AI technology. It provides features like book summaries, flashcards, audio learning, and personalized recommendations.

## Features

- 📚 Book Summaries: Get concise summaries of books you're reading
- 🎴 Flashcards: Create and study flashcards from book content
- 🔊 Audio Learning: Listen to book summaries and key concepts
- 📊 Learning Stats: Track your reading and learning progress
- 🔍 Book Recommendations: Get personalized book suggestions

## Tech Stack

- React Native with Expo
- Firebase for backend services
- OpenAI API for AI-powered features
- Expo Speech for text-to-speech functionality

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Firebase account
- OpenAI API key
- Google Books API key
- NYT Books API key

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bookwise.git
   cd bookwise
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your Firebase and OpenAI configuration:

   ```
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Create a `config.js` file in the root directory with your API keys:

   ```javascript
   export const API_KEYS = {
     googleKey: "your_google_books_api_key",
     nytKey: "your_nyt_api_key",
   };
   ```

   Note: This file is already in .gitignore and should not be committed to version control.

5. Initialize the API keys in secure storage:

   ```bash
   node scripts/initApiKeys.js
   ```

6. Start the development server:

   ```bash
   npx expo start
   ```

7. Run the app on your device:
   - Install the Expo Go app on your mobile device
   - Scan the QR code shown in the terminal with your device's camera
   - The app will open in Expo Go

## Project Structure

```
bookwise/
├── assets/             # Images, fonts, and other static assets
├── components/         # Reusable UI components
├── lib/               # Utility functions and API integrations
├── screens/           # App screens
├── navigation/        # Navigation configuration
├── services/          # Backend service integrations
└── App.js            # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/)
- [OpenAI](https://openai.com/)
- [React Native](https://reactnative.dev/)

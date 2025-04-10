import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LibraryScreen from './screens/LibraryScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import LearnScreen from './screens/LearnScreen';
import AudioScreen from './screens/AudioScreen';
import ProfileScreen from './screens/ProfileScreen';
import TestAPIScreen from './screens/TestAPIScreen';
import { initializeSecureStorage } from './lib/secureStorage';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    // Initialize secure storage with API keys
    const setupKeys = async () => {
      try {
        await initializeSecureStorage();
        console.log('API keys initialized successfully');
      } catch (error) {
        console.error('Error initializing API keys:', error);
      }
    };
    
    setupKeys();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Library') {
                iconName = focused ? 'library' : 'library-outline';
              } else if (route.name === 'Discover') {
                iconName = focused ? 'compass' : 'compass-outline';
              } else if (route.name === 'Learn') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Audio') {
                iconName = focused ? 'headset' : 'headset-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              } else if (route.name === 'Test APIs') {
                iconName = focused ? 'bug' : 'bug-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2F80ED',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Library" component={LibraryScreen} />
          <Tab.Screen name="Discover" component={DiscoverScreen} />
          <Tab.Screen name="Learn" component={LearnScreen} />
          <Tab.Screen name="Audio" component={AudioScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Test APIs" component={TestAPIScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LibraryScreen from './screens/LibraryScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import LearnScreen from './screens/LearnScreen';
import AudioScreen from './screens/AudioScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
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
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4263EB',
          tabBarInactiveTintColor: '#A0A0A0',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Learn" component={LearnScreen} />
        <Tab.Screen name="Audio" component={AudioScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 
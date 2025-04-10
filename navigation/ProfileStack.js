import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from '../screens/ProfileScreen';
import APITestScreen from '../screens/APITestScreen';

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="APITest" 
        component={APITestScreen}
        options={{ 
          title: 'API Settings',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#2F80ED',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
} 
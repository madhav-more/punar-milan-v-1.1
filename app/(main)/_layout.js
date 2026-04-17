import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Heart, MessageSquare, User } from 'lucide-react-native';
import { Colors } from '../../src/constants/Theme';

export default function MainLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      headerShown: true,
      headerTitleStyle: {
        fontWeight: 'bold',
        color: Colors.text,
      },
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Discovery',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

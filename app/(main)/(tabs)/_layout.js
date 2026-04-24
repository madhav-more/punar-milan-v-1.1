import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Heart, MessageSquare, User, Crown, Menu } from 'lucide-react-native';
import { Colors } from '../../../src/constants/Theme';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function TabsLayout() {
  const navigation = useNavigation();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ marginLeft: 16 }}
        >
          <Menu size={24} color={Colors.text} />
        </TouchableOpacity>
      ),
      headerTitleStyle: {
        fontWeight: 'bold',
        color: Colors.text,
        fontSize: 18,
      },
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      },
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: Colors.white,
      }
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
        name="premium"
        options={{
          title: 'Premium',
          tabBarIcon: ({ color }) => <Crown size={24} color={color} />,
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
      
      {/* Hidden from tabs but available in the stack */}
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="user-details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

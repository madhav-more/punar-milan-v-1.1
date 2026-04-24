import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { Colors, Spacing, Typography, Shadows } from '../../../src/constants/Theme';
import { Settings, LogOut, ChevronRight, Edit3, User as UserIcon, Heart, Shield } from 'lucide-react-native';
import Button from '../../../src/components/Button';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { 
      title: 'Personal Information', 
      icon: <UserIcon size={20} color={Colors.textSecondary} />,
      onPress: () => router.push('/edit-profile')
    },
    { 
      title: 'Partner Preferences', 
      icon: <Heart size={20} color={Colors.textSecondary} />,
      onPress: () => {} // Future implementation
    },
    { 
      title: 'Privacy Settings', 
      icon: <Shield size={20} color={Colors.textSecondary} />,
      onPress: () => {} // Future implementation
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.imageContainer, Shadows.medium]}>
          <Image
            source={{ uri: user?.profilePhoto || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => router.push('/edit-profile')}
          >
            <Edit3 size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.name || 'User Name'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        <View style={styles.completionContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${user?.profileCompletion || 30}%` }]} />
          </View>
          <Text style={styles.completionText}>Profile {user?.profileCompletion || 30}% Complete</Text>
        </View>
      </View>

      <View style={styles.section}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              {item.icon}
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <ChevronRight size={20} color={Colors.border} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Button 
          title="Logout" 
          type="secondary" 
          onPress={logout}
          textStyle={{ color: Colors.error }}
          style={{ borderColor: Colors.error }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: Spacing.m,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.border,
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  name: {
    ...Typography.h2,
  },
  email: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  completionContainer: {
    width: '100%',
    marginTop: Spacing.l,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  completionText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  section: {
    padding: Spacing.m,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  menuItemText: {
    ...Typography.body,
    fontWeight: '500',
  },
  footer: {
    padding: Spacing.l,
    marginTop: Spacing.xl,
  },
});

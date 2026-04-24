import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { 
  Home, 
  Heart, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, Shadows } from '../../constants/Theme';
import DrawerItem from './DrawerItem';

const CustomDrawer = (props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleNavigation = (route) => {
    router.push(route);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const isActive = (path) => pathname.includes(path);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => handleNavigation('/profile')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'User'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* --- Menu Section --- */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Main Menu</Text>
          <DrawerItem
            label="Discovery"
            icon={Home}
            onPress={() => handleNavigation('/home')}
            active={isActive('/home')}
          />
          <DrawerItem
            label="My Matches"
            icon={Heart}
            onPress={() => handleNavigation('/matches')}
            active={isActive('/matches')}
          />
          <DrawerItem
            label="Messages"
            icon={MessageSquare}
            onPress={() => handleNavigation('/messages')}
            active={isActive('/messages')}
          />
          <DrawerItem
            label="Premium Plans"
            icon={User}
            onPress={() => handleNavigation('/premium')}
            active={isActive('/premium')}
          />
          <DrawerItem
            label="My Profile"
            icon={User}
            onPress={() => handleNavigation('/profile')}
            active={isActive('/profile')}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account & Support</Text>
          <DrawerItem
            label="Settings"
            icon={Settings}
            onPress={() => {}}
            active={false}
          />
          <DrawerItem
            label="Privacy Policy"
            icon={ShieldCheck}
            onPress={() => {}}
            active={false}
          />
          <DrawerItem
            label="Help & Support"
            icon={HelpCircle}
            onPress={() => {}}
            active={false}
          />
        </View>
      </DrawerContentScrollView>

      {/* --- Footer Section --- */}
      <View style={styles.footer}>
        <DrawerItem
          label="Logout"
          icon={LogOut}
          onPress={handleLogout}
          color={Colors.error}
        />
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Punar Milan v1.1</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    paddingTop: 0,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.m,
    paddingHorizontal: Spacing.m,
    backgroundColor: '#FFF9FB', // Soft pink background
    borderBottomWidth: 1,
    borderBottomColor: '#FEEAF2',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
  },
  avatarContainer: {
    position: 'relative',
    ...Shadows.light,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  placeholderAvatar: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.m,
  },
  userName: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.text,
  },
  userEmail: {
    ...Typography.caption,
    marginTop: 2,
  },
  menuSection: {
    marginTop: Spacing.m,
  },
  sectionTitle: {
    ...Typography.caption,
    marginLeft: Spacing.xl,
    marginBottom: Spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: Spacing.m,
    marginHorizontal: Spacing.xl,
  },
  footer: {
    paddingBottom: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Spacing.s,
  },
  versionText: {
    ...Typography.caption,
    fontSize: 10,
    color: '#CCCCCC',
  },
});

export default CustomDrawer;

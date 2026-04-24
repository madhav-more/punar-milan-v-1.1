import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '../../constants/Theme';

const DrawerItem = ({ label, icon: Icon, onPress, active, color }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        active && styles.activeContainer
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Icon 
          size={22} 
          color={active ? Colors.primary : (color || Colors.textSecondary)} 
          strokeWidth={active ? 2.5 : 2}
        />
      </View>
      <Text style={[
        styles.label,
        active && styles.activeLabel,
        { color: active ? Colors.primary : (color || Colors.text) }
      ]}>
        {label}
      </Text>
      {active && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
    marginHorizontal: Spacing.s,
    marginVertical: 2,
    borderRadius: 12,
  },
  activeContainer: {
    backgroundColor: '#FFF1F6', // Very light pink
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s,
  },
  label: {
    ...Typography.body,
    fontWeight: '500',
    fontSize: 16,
  },
  activeLabel: {
    fontWeight: '700',
    color: Colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  }
});

export default DrawerItem;

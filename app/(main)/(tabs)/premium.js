import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '../../../src/constants/Theme';
import { Crown, CheckCircle2, Star, Zap, Diamond } from 'lucide-react-native';
import Animated, { 
  FadeInRight, 
  FadeInLeft, 
  Layout, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const PremiumScreen = () => {
  const [activePlan, setActivePlan] = useState('premium'); // 'premium' or 'vip'

  const plans = {
    premium: {
      title: 'Premium Plan',
      price: '₹4,000',
      discount: '₹1,000 OFF',
      finalPrice: '₹3,000',
      duration: '3 Months',
      icon: Crown,
      color: Colors.primary,
      features: [
        'See who likes you',
        'Unlimited Likes',
        '5 Super Likes per day',
        'Passport to any location',
        'Rewind your last swipe',
      ],
      buttonText: 'Upgrade to Premium',
    },
    vip: {
      title: 'VIP Exclusive',
      price: '₹6,00,000',
      duration: 'Lifetime Access',
      icon: Diamond,
      color: '#000000', // Elite Black
      features: [
        'Personal Relationship Manager',
        'Highest Priority Visibility',
        'Unlimited VIP Connects',
        'Exclusive Event Access',
        'Profile Verification Badge',
        'Full Privacy Controls',
      ],
      buttonText: 'Apply for VIP',
    },
  };

  const currentPlan = plans[activePlan];
  const PlanIcon = currentPlan.icon;

  const animatedSwitchStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(activePlan === 'premium' ? 0 : (width - 64) / 2) }],
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upgrade Your Experience</Text>
          <Text style={styles.headerSubtitle}>
            Choose the plan that fits your journey to finding the perfect match.
          </Text>
        </View>

        {/* --- Switcher --- */}
        <View style={styles.switcherContainer}>
          <View style={styles.switcherBackground}>
            <Animated.View style={[styles.activeIndicator, animatedSwitchStyle]} />
            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => setActivePlan('premium')}
            >
              <Text style={[styles.switchText, activePlan === 'premium' && styles.activeSwitchText]}>
                Premium
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => setActivePlan('vip')}
            >
              <Text style={[styles.switchText, activePlan === 'vip' && styles.activeSwitchText]}>
                VIP
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Plan Card --- */}
        <Animated.View 
          key={activePlan}
          entering={activePlan === 'premium' ? FadeInLeft : FadeInRight}
          layout={Layout.springify()}
          style={[
            styles.planCard, 
            { borderColor: activePlan === 'vip' ? '#FFD700' : Colors.primary + '30' }
          ]}
        >
          {activePlan === 'vip' && (
            <View style={styles.vipBadge}>
              <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.vipBadgeText}>ULTIMATE</Text>
            </View>
          )}

          <View style={[styles.iconBox, { backgroundColor: currentPlan.color + (activePlan === 'vip' ? '' : '10') }]}>
            <PlanIcon size={40} color={activePlan === 'vip' ? '#FFD700' : currentPlan.color} />
          </View>

          <Text style={styles.planTitle}>{currentPlan.title}</Text>
          
          <View style={styles.priceContainer}>
            {currentPlan.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{currentPlan.discount}</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={[styles.priceText, currentPlan.discount && styles.strikethrough]}>
                {currentPlan.price}
              </Text>
              {currentPlan.finalPrice && (
                <Text style={styles.finalPriceText}>{currentPlan.finalPrice}</Text>
              )}
            </View>
            <Text style={styles.durationText}>{currentPlan.duration}</Text>
          </View>

          <View style={styles.featuresList}>
            {currentPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle2 size={20} color={activePlan === 'vip' ? '#FFD700' : Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[
              styles.upgradeButton, 
              { backgroundColor: activePlan === 'vip' ? '#000000' : Colors.primary }
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>{currentPlan.buttonText}</Text>
            <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerNote}>
          Secure payment gateway integration coming soon. All plans are billed once.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.l,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: 26,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
    paddingHorizontal: Spacing.l,
    marginTop: Spacing.s,
    lineHeight: 20,
  },
  switcherContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  switcherBackground: {
    flexDirection: 'row',
    width: width - 64,
    height: 50,
    backgroundColor: '#E9E9EB',
    borderRadius: 25,
    padding: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (width - 64) / 2 - 4,
    height: 42,
    backgroundColor: Colors.white,
    borderRadius: 21,
    ...Shadows.light,
  },
  switchButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  switchText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeSwitchText: {
    color: Colors.text,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.l,
    borderWidth: 2,
    ...Shadows.medium,
    alignItems: 'center',
  },
  vipBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vipBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  planTitle: {
    ...Typography.h2,
    marginBottom: Spacing.m,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.l,
    backgroundColor: '#F8F9FA',
    width: '100%',
    padding: Spacing.m,
    borderRadius: 16,
  },
  discountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  discountText: {
    color: Colors.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    ...Typography.h1,
    fontSize: 32,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    fontSize: 20,
    color: Colors.textSecondary,
  },
  finalPriceText: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.primary,
  },
  durationText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  featuresList: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
    gap: 12,
  },
  featureText: {
    ...Typography.body,
    fontSize: 15,
    color: '#444',
  },
  upgradeButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Shadows.light,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerNote: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xl,
    color: '#AAA',
  }
});

export default PremiumScreen;

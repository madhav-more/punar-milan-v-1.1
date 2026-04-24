import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '../../../src/constants/Theme';
import api from '../../../src/services/api';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { SlidersHorizontal, Search, Bell } from 'lucide-react-native';

// ─── New unified card ───────────────────────────────────────────────────────
import ProfileCard from '../../../src/components/discovery/ProfileCard';

const { width, height } = Dimensions.get('window');

// ─── Constants ───────────────────────────────────────────────────────────────
const CARD_HEIGHT = height * 0.78;           // must match ProfileCard

const TABS = [
  { key: 'New',     label: 'New' },
  { key: 'Daily',   label: 'Daily' },
  { key: 'Matches', label: 'My Matches' },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  const [activeTab, setActiveTab]         = useState('New');
  const [newProfiles, setNewProfiles]     = useState([]);
  const [dailyProfiles, setDailyProfiles] = useState([]);
  const [matchProfiles, setMatchProfiles] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  /* counts shown on tabs */
  const counts = {
    New:     newProfiles.length,
    Daily:   dailyProfiles.length,
    Matches: matchProfiles.length,
  };

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [n, d, m] = await Promise.all([
        api.get('/discovery/new').catch(() => ({ data: [] })),
        api.get('/discovery/daily').catch(() => ({ data: [] })),
        api.get('/discovery/matches').catch(() => ({ data: [] })),
      ]);
      setNewProfiles(n.data);
      setDailyProfiles(d.data);
      setMatchProfiles(m.data);
    } catch (e) {
      console.error('Discovery fetch error:', e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAll();
      setLoading(false);
    })();
  }, [fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleConnect = useCallback(async (user) => {
    try {
      await api.post('/interests', { receiverId: user._id });
      Toast.show({ type: 'success', text1: 'Interest Sent!', text2: `Waiting for ${user.name} to respond…` });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Could not send interest' });
    }
  }, []);

  const goToDetails = useCallback((user) => {
    router.push({ pathname: '/user-details', params: { userId: user._id } });
  }, [router]);

  // ── Layout helpers ─────────────────────────────────────────────────────────
  const getItemLayout = useCallback((_, index) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index,
  }), []);

  const currentData = activeTab === 'New'
    ? newProfiles
    : activeTab === 'Daily'
      ? dailyProfiles
      : matchProfiles;

  // ── Render card ────────────────────────────────────────────────────────────
  const renderCard = useCallback(({ item }) => (
    <ProfileCard
      user={item}
      onConnect={handleConnect}
      onDetails={goToDetails}
    />
  ), [handleConnect, goToDetails]);

  // ── Empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🌸</Text>
      <Text style={styles.emptyText}>No profiles here yet.</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
        <Text style={styles.refreshBtnText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

// ── Daily Card Inline Component ──────────────────────────────────────────────
  const DailyCard = require('../../../src/components/discovery/DailyCard').default;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Static Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Top row: title + icons */}
        {/* <View style={styles.titleRow}>
          <TouchableOpacity style={styles.iconBtn}>
            <SlidersHorizontal size={22} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchBox}>
            <Search size={16} color={Colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search profiles…</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View> */}

        {/* Pill tab row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = counts[tab.key];
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.pill, isActive && styles.pillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {tab.label}
                  {count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ───────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : activeTab === 'Daily' ? (
        <ScrollView 
            style={styles.dailyContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Curated for Today</Text>
              <Text style={styles.sectionSubtitle}>Handpicked profiles matching your vibe</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={200}
            >
              {dailyProfiles.length > 0 ? (
                dailyProfiles.map(item => (
                  <DailyCard 
                    key={item._id} 
                    user={item} 
                    onPress={goToDetails}
                    onConnect={handleConnect}
                  />
                ))
              ) : (
                <Text style={styles.emptyTextInline}>Check back soon for new picks!</Text>
              )}
            </ScrollView>
            
            <View style={styles.dailyExplainer}>
              <Text style={styles.explainerTitle}>Why segmented?</Text>
              <Text style={styles.explainerText}>
                We analyze thousands of profiles to bring you only the most compatible matches every day. Quality over quantity.
              </Text>
            </View>
          </ScrollView>
      ) : (
        <FlatList
          key={activeTab} // Fixes invariant violation by enforcing fresh render list per tab
          data={currentData}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          pagingEnabled={false}
          snapToInterval={CARD_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          windowSize={3}
          removeClippedSubviews
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={currentData.length === 0 && styles.emptyList}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },

  // ── Header ──
  header: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.s,
    paddingBottom: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    ...Shadows.light,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.s,
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // ── Pill tabs ──
  pillRow: {
    paddingHorizontal: Spacing.m,
    paddingBottom: 6,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    ...Shadows.light,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
  },

  // ── Loader / Empty ──
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 28,
    ...Shadows.light,
  },
  refreshBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  dailyContainer: {
    flex: 1,
    padding: Spacing.m,
  },
  sectionHeader: {
    marginBottom: Spacing.m,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 20,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  horizontalList: {
    paddingVertical: Spacing.m,
    paddingRight: 20,
  },
  emptyTextInline: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 40,
    marginLeft: 20,
  },
  dailyExplainer: {
    marginTop: 30,
    backgroundColor: '#FFF9FB',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE4EE',
  },
  explainerTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  explainerText: {
    ...Typography.bodySmall,
    lineHeight: 20,
    color: Colors.textSecondary,
  }
});

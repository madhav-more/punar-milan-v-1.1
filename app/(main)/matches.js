import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '../../src/constants/Theme';
import { Check, X, Clock } from 'lucide-react-native';
import api from '../../src/services/api';
import Toast from 'react-native-toast-message';

export default function Matches() {
  const [activeTab, setActiveTab] = useState('received');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, [activeTab]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'received' ? '/interests/received' : '/interests/sent';
      const response = await api.get(endpoint);
      setInterests(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch interests',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/interests/${id}`, { status });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Interest ${status}`,
      });
      fetchInterests();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update status',
      });
    }
  };

  const renderInterestItem = ({ item }) => {
    const profile = activeTab === 'received' ? item.sender : item.receiver;
    if (!profile) return null;

    return (
      <View style={[styles.itemCard, Shadows.light]}>
        <Image 
          source={{ uri: profile.profilePhoto || 'https://via.placeholder.com/100' }} 
          style={styles.itemImage} 
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{profile.name}, {profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'N/A'}</Text>
          <Text style={styles.itemSub}>{profile.city || 'Location Hidden'}</Text>
          
          {(activeTab === 'sent' || item.status !== 'pending') && (
            <View style={styles.statusBadge}>
              <Clock size={14} color={item.status === 'accepted' ? Colors.success : Colors.warning} />
              <Text style={[styles.statusText, item.status === 'accepted' && { color: Colors.success }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          )}
        </View>
        
        {activeTab === 'received' && item.status === 'pending' && (
          <View style={styles.itemActions}>
            <TouchableOpacity 
              style={styles.rejectBtn}
              onPress={() => handleUpdateStatus(item._id, 'rejected')}
            >
              <X size={20} color={Colors.error} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptBtn}
              onPress={() => handleUpdateStatus(item._id, 'accepted')}
            >
              <Check size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>Sent</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={interests}
          keyExtractor={(item) => item._id}
          renderItem={renderInterestItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInterests(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No interests to show</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: Spacing.m,
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.s,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.white,
    ...Shadows.light,
  },
  tabText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.m,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.m,
    borderRadius: 16,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.m,
  },
  itemName: {
    ...Typography.body,
    fontWeight: '700',
  },
  itemSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});

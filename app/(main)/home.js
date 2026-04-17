import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '../../src/constants/Theme';
import api from '../../src/services/api';
import { Heart, UserX } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch profiles',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInterest = async (userId) => {
    try {
      await api.post('/interests', { receiverId: userId });
      Toast.show({
        type: 'success',
        text1: 'Interest Sent',
        text2: 'Waiting for response...',
      });
      // Optionally remove the user from the list or mark as sent
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Could not send interest',
      });
    }
  };

  const handleReject = (userId) => {
    // Local UI dismissal
    setUsers(prev => prev.filter(u => u._id !== userId));
  };

  const getFallbackUri = (item) =>
    item.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=E91E63&color=fff&size=400`;

  const renderUserCard = ({ item }) => (
    <View style={[styles.card, Shadows.medium]}>
      <Image
        source={{ uri: getFallbackUri(item) }}
        style={styles.image}
        resizeMode="cover"
      />
      {/* Gradient-like overlay at the bottom of image */}
      <View style={styles.imageOverlay} />

      <View style={styles.cardContent}>
        <Text style={styles.name}>
          {item.name},{' '}
          {item.dob ? new Date().getFullYear() - new Date(item.dob).getFullYear() : 'N/A'}
        </Text>
        {(item.city || item.state) && (
          <Text style={styles.details}>
            📍 {[item.city, item.state].filter(Boolean).join(', ')}
          </Text>
        )}
        {(item.religion || item.caste) && (
          <Text style={styles.religion}>
            {[item.religion, item.caste].filter(Boolean).join(' • ')}
          </Text>
        )}
        {item.occupation && (
          <Text style={styles.occupation}>💼 {item.occupation}</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtnReject}
            onPress={() => handleReject(item._id)}
          >
            <UserX size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtnAccept}
            onPress={() => sendInterest(item._id)}
          >
            <Heart size={24} color={Colors.white} fill={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeaderTitle}>Discover</Text>
        <Text style={styles.screenHeaderSub}>{users.length} profiles nearby</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyText}>No new profiles right now.</Text>
            <Text style={styles.emptySubText}>Check back soon!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenHeader: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.m,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  screenHeaderTitle: {
    ...Typography.h2,
    fontSize: 22,
    color: Colors.primary,
  },
  screenHeaderSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.m,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: Spacing.l,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 380,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
  },
  cardContent: {
    padding: Spacing.m,
  },
  name: {
    ...Typography.h3,
    fontSize: 22,
    marginBottom: 4,
  },
  details: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 2,
    fontSize: 14,
  },
  religion: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  occupation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.m,
  },
  actionBtnReject: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnAccept: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light,
  },
  emptyContainer: {
    marginTop: 120,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.m,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  emptySubText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

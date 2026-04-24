import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Shadows } from '../../../src/constants/Theme';
import { ArrowLeft, Heart, MapPin, Briefcase, GraduationCap, Info } from 'lucide-react-native';
import { Image } from 'expo-image';
import api from '../../../src/services/api';
import Toast from 'react-native-toast-message';

export default function UserDetails() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load profile details',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await api.post('/interests', { receiverId: userId });
      Toast.show({
        type: 'success',
        text1: 'Interest Sent',
        text2: 'Waiting for response...',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Could not send interest',
      });
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: user.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&size=600' }}
            style={styles.image}
            contentFit="cover"
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <Text style={styles.name}>{user.name}, {user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : 'N/A'}</Text>
            <View style={styles.row}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.location}>{[user.city, user.state].filter(Boolean).join(', ')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text style={styles.bio}>{user.bio || 'No bio provided.'}</Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <DetailItem icon={<Briefcase size={18} color={Colors.primary} />} label="Occupation" value={user.occupation} />
            <DetailItem icon={<GraduationCap size={18} color={Colors.primary} />} label="Education" value={user.education} />
            <DetailItem label="Religion" value={user.religion} />
            <DetailItem label="Caste" value={user.caste} />
            <DetailItem label="Diet" value={user.diet} />
            <DetailItem label="Height" value={user.height ? `${user.height} cm` : null} />
          </View>

          {user.gallery && user.gallery.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
                {user.gallery.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={styles.galleryImage} contentFit="cover" />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.connectBtn} onPress={handleConnect}>
          <Heart size={24} color={Colors.white} fill={Colors.white} />
          <Text style={styles.connectBtnText}>Connect Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DetailItem = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.detailItem}>
      {icon}
      <View style={{ marginLeft: icon ? 10 : 0 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 450,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.l,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.white,
    marginTop: -30,
  },
  mainInfo: {
    marginBottom: Spacing.m,
  },
  name: {
    ...Typography.h1,
    fontSize: 26,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  location: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.m,
  },
  section: {
    marginBottom: Spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 18,
    marginLeft: 10,
  },
  bio: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
  },
  gallery: {
    marginTop: 10,
  },
  galleryImage: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: Spacing.m,
    backgroundColor: 'transparent',
  },
  connectBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    ...Shadows.medium,
  },
  connectBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

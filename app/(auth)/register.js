import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Shadows } from '../../src/constants/Theme';
import logo from '../../assets/images/logo.png';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { useAuth } from '../../src/context/AuthContext';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera } from 'lucide-react-native';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: new Date(),
    gender: 'male',
  });
  const [photoData, setPhotoData] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      handleInputChange('dob', selectedDate);
    }
  };

  const handlePickImage = () => {
    Alert.alert('Profile Photo', 'Select an option', [
      { text: 'Camera', onPress: () => openPicker('camera') },
      { text: 'Gallery', onPress: () => openPicker('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openPicker = async (source) => {
    const options = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };

    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Camera permission denied' });
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Gallery permission denied' });
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotoData({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: `photo-${Date.now()}.jpg`,
      });
    }
  };

  const handleRegister = async () => {
    const { name, email, password, phone, dob } = formData;
    if (!name || !email || !password || !phone || !dob) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all required fields',
      });
      return;
    }
    
    if (!photoData) {
      Toast.show({
        type: 'error',
        text1: 'Profile Photo Required',
        text2: 'Please tap the avatar to add a photo',
      });
      return;
    }

    try {
      setLoading(true);
      // Format DOB to YYYY-MM-DD
      const formattedDob = dob.toISOString().split('T')[0];
      await register(name, email, password, phone, formattedDob, formData.gender, photoData);
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Account created successfully',
      });
      router.replace('/home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Enter your details to start your journey</Text>
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
            {photoData ? (
              <Image source={{ uri: photoData.uri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Camera size={32} color={Colors.textSecondary} />
                <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Camera size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChangeText={(v) => handleInputChange('name', v)}
          />
          <Input
            label="Email Address"
            placeholder="example@mail.com"
            value={formData.email}
            onChangeText={(v) => handleInputChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone Number"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChangeText={(v) => handleInputChange('phone', v)}
            keyboardType="phone-pad"
          />

          <View style={styles.dateContainer}>
             <Text style={styles.dateLabel}>Date of Birth</Text>
             <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>
                  {formData.dob.toISOString().split('T')[0]}
                </Text>
             </TouchableOpacity>
             {showDatePicker && (
                <DateTimePicker
                  value={formData.dob}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
             )}
             {Platform.OS === 'ios' && showDatePicker && (
               <Button title="Confirm" onPress={() => setShowDatePicker(false)} style={{marginTop: Spacing.s}} />
             )}
          </View>

          <Input
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(v) => handleInputChange('password', v)}
            secureTextEntry
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              {['male', 'female', 'other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    formData.gender === g && styles.genderButtonActive,
                  ]}
                  onPress={() => handleInputChange('gender', g)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === g && styles.genderButtonTextActive,
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLinkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.l,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.m,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.s,
  },
  title: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.light,
  },
  form: {
    flex: 1,
  },
  dateContainer: {
    marginBottom: Spacing.m,
  },
  dateLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: Spacing.s,
    color: Colors.text,
  },
  dateSelector: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.m,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  dateText: {
    fontSize: 15,
    color: Colors.text,
  },
  genderContainer: {
    marginBottom: Spacing.l,
    marginTop: Spacing.s,
  },
  genderLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: Spacing.s,
    color: Colors.text,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  genderButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  genderButtonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  registerButton: {
    marginTop: Spacing.s,
    height: 52,
    borderRadius: 12,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  loginText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginLinkText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
});

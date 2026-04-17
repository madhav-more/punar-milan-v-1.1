import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../../src/constants/Theme';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { useAuth } from '../../src/context/AuthContext';
import Toast from 'react-native-toast-message';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: 'male',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    try {
      setLoading(true);
      await register(name, email, password, phone, dob, formData.gender);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Enter your details to start your journey</Text>
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
          <Input
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={formData.dob}
            onChangeText={(v) => handleInputChange('dob', v)}
          />
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
    marginBottom: Spacing.l,
  },
  title: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.primary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    flex: 1,
  },
  genderContainer: {
    marginBottom: Spacing.l,
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
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  genderButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // Light pink background
  },
  genderButtonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  genderButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  registerButton: {
    marginTop: Spacing.m,
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

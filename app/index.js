import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../src/constants/Theme';
import Button from '../src/components/Button';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Punar Milan</Text>
          <Text style={styles.subtitle}>Where connections begin for a lifetime</Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Login"
            onPress={() => router.push('/login')}
            style={styles.button}
          />
          <Button
            title="Create Account"
            type="secondary"
            onPress={() => router.push('/register')}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.l,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Spacing.xxl * 2,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    fontSize: 40,
    color: Colors.primary,
  },
  subtitle: {
    ...Typography.body,
    marginTop: Spacing.s,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  footer: {
    marginBottom: Spacing.xl,
  },
  button: {
    marginVertical: Spacing.s,
  },
});

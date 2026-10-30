import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../src/lib/supabase';
import { useAppStore } from '../src/store/useAppStore';
import { useSamsungTheme } from '../src/theme/useSamsungTheme';

export default function RootLayout() {
  const session = useAppStore((s) => s.session);
  const isLoadingAuth = useAppStore((s) => s.isLoadingAuth);
  const setSession = useAppStore((s) => s.setSession);
  const theme = useSamsungTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    if (isLoadingAuth) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoadingAuth, segments, router]);

  if (isLoadingAuth) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface.background }]}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.surface.background }]}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <Slot />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

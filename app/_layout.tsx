import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
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
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const w = window as any;
      w.__deferredPwaPrompt = null;
      window.addEventListener('beforeinstallprompt', (e: any) => {
        e.preventDefault();
        w.__deferredPwaPrompt = e;
        window.dispatchEvent(new Event('pwa-install-available'));
      });
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }

    const fallbackTimer = setTimeout(() => {
      if (useAppStore.getState().isLoadingAuth) {
        setSession(null);
      }
    }, 2500);

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        clearTimeout(fallbackTimer);
        setSession(currentSession);
      })
      .catch(() => {
        clearTimeout(fallbackTimer);
        setSession(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession);
    });

    return () => {
      clearTimeout(fallbackTimer);
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
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: 64, height: 64, borderRadius: 18, marginBottom: 16 }}
          resizeMode="cover"
        />
        <View style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color={theme.accent.primary} />
        </View>
        <Text style={{ color: theme.text.secondary, fontSize: 13, marginTop: 10, fontWeight: '600' }}>
          Cargando MisAhorros...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.surface.background }]}>
      <Head>
        <title>MisAhorros — Finanzas Personales y Negocios</title>
        <meta name="theme-color" content="#0B0F19" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MisAhorros" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Head>
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

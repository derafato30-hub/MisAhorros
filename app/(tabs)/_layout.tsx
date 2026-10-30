import React from 'react';
import { Tabs } from 'expo-router';
import { CreditCard, Home, PieChart, Sparkles, UserCog } from 'lucide-react-native';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';

export default function TabsLayout() {
  const theme = useSamsungTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent.primary,
        tabBarInactiveTintColor: theme.surface.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface.surface1,
          borderTopColor: theme.surface.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Cuentas',
          tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Asistente IA',
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Metas y Deudas',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Perfil y Tema',
          tabBarIcon: ({ color, size }) => <UserCog size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

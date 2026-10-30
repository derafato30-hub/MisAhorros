import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { ProfileSwitcherPill } from '../../src/components/ui/ProfileSwitcherPill';

export default function AssistantTabScreen() {
  const theme = useSamsungTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileSwitcherPill />
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
          ]}
        >
          <Sparkles size={28} color={theme.accent.primary} />
          <Text style={[styles.title, { color: theme.surface.textPrimary }]}>
            Asistente Financiero IA (Google Gemini)
          </Text>
          <Text style={[styles.sub, { color: theme.surface.textSecondary }]}>
            Listo para conectar con Function Calling en la Fase 6 para registrar gastos, ingresos, configurar presupuestos y resolver dudas financieras en lenguaje natural.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: 18,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
  },
  title: { fontSize: 20, fontWeight: '800' },
  sub: { fontSize: 14, lineHeight: 20 },
});

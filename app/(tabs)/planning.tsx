import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Landmark, PiggyBank } from 'lucide-react-native';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { ProfileSwitcherPill } from '../../src/components/ui/ProfileSwitcherPill';

export default function PlanningTabScreen() {
  const theme = useSamsungTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileSwitcherPill />
        <Text style={[styles.title, { color: theme.surface.textPrimary }]}>
          Tarjetas, Préstamos, Metas e Inversiones
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <CreditCard size={22} color={theme.accent.primary} />
          <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
            Tarjetas de Crédito y Cortes
          </Text>
          <Text style={{ color: theme.surface.textSecondary, fontSize: 13 }}>
            Control de fecha de corte, pago de contado, límite disponible y múltiples tarjetas.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <Landmark size={22} color={theme.accent.primary} />
          <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
            Préstamos (Recibidos y Otorgados) y Cuentas por Pagar
          </Text>
          <Text style={{ color: theme.surface.textSecondary, fontSize: 13 }}>
            Control de cuotas, suscripciones, recordatorios y cálculo de intereses por mora.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <PiggyBank size={22} color={theme.accent.primary} />
          <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
            Ahorros, Presupuestos e Instrumentos (CDP / Pensión)
          </Text>
          <Text style={{ color: theme.surface.textSecondary, fontSize: 13 }}>
            Presupuestos diarios/semanales/quincenales/mensuales, Depósitos a Plazo y Fondos de Pensión.
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
    gap: 14,
  },
  title: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  card: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
});

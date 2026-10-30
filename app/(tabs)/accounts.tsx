import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { formatMoney } from '../../src/theme/samsungOneUI';
import { ProfileSwitcherPill } from '../../src/components/ui/ProfileSwitcherPill';

export default function AccountsTabScreen() {
  const theme = useSamsungTheme();
  const accounts = useAppStore((s) => s.accounts);
  const financialProfiles = useAppStore((s) => s.financialProfiles);
  const activeProfileType = useAppStore((s) => s.activeProfileType);
  const hideBalances = useAppStore((s) => s.hideBalances);

  const activeProfile = financialProfiles.find((p) => p.profile_type === activeProfileType);
  const filteredAccounts = activeProfile
    ? accounts.filter((a) => a.profile_id === activeProfile.id)
    : accounts;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileSwitcherPill />
        <Text style={[styles.title, { color: theme.surface.textPrimary }]}>
          Cuentas y Movimientos
        </Text>
        <Text style={[styles.sub, { color: theme.surface.textSecondary }]}>
          Efectivo, bancos, ingresos por nómina, gastos y transferencias multi-moneda
        </Text>

        {filteredAccounts.map((acc) => (
          <View
            key={acc.id}
            style={[
              styles.card,
              { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
            ]}
          >
            <View style={styles.row}>
              <Wallet size={22} color={acc.color_hex || theme.accent.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.accName, { color: theme.surface.textPrimary }]}>
                  {acc.name}
                </Text>
                <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                  {acc.account_type.toUpperCase()} • {acc.currency}
                </Text>
              </View>
              <Text style={[styles.accBalance, { color: theme.surface.textPrimary }]}>
                {formatMoney(acc.current_balance, acc.currency, hideBalances)}
              </Text>
            </View>
          </View>
        ))}
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
  title: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  sub: { fontSize: 13, marginBottom: 6 },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accName: { fontSize: 15, fontWeight: '700' },
  accBalance: { fontSize: 17, fontWeight: '800', fontVariant: ['tabular-nums'] },
});

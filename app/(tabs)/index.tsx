import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  Eye,
  EyeOff,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { formatMoney } from '../../src/theme/samsungOneUI';
import { ProfileSwitcherPill } from '../../src/components/ui/ProfileSwitcherPill';
import { PressableScale } from '../../src/components/ui/PressableScale';

export default function DashboardHomeScreen() {
  const theme = useSamsungTheme();
  const router = useRouter();
  const preferences = useAppStore((s) => s.preferences);
  const activeProfileType = useAppStore((s) => s.activeProfileType);
  const financialProfiles = useAppStore((s) => s.financialProfiles);
  const accounts = useAppStore((s) => s.accounts);
  const recentTransactions = useAppStore((s) => s.recentTransactions);
  const hideBalances = useAppStore((s) => s.hideBalances);
  const toggleHideBalances = useAppStore((s) => s.toggleHideBalances);

  const activeProfile = useMemo(
    () => financialProfiles.find((p) => p.profile_type === activeProfileType),
    [financialProfiles, activeProfileType]
  );

  const profileAccounts = useMemo(() => {
    if (!activeProfile) return accounts;
    return accounts.filter((a) => a.profile_id === activeProfile.id);
  }, [accounts, activeProfile]);

  const totalInBaseCurrency = useMemo(() => {
    return profileAccounts
      .filter((a) => a.include_in_total)
      .reduce((acc, item) => {
        if (item.currency === preferences.default_currency) {
          return acc + item.current_balance;
        }
        // Conversión automática aproximada HNL <-> USD
        if (item.currency === 'USD' && preferences.default_currency === 'HNL') {
          return acc + item.current_balance * 25.0;
        }
        if (item.currency === 'HNL' && preferences.default_currency === 'USD') {
          return acc + item.current_balance / 25.0;
        }
        return acc + item.current_balance;
      }, 0);
  }, [profileAccounts, preferences.default_currency]);

  const secondaryEquivalent = useMemo(() => {
    if (preferences.default_currency === 'HNL') {
      return formatMoney(totalInBaseCurrency / 25.0, 'USD', hideBalances) + ' USD';
    }
    return formatMoney(totalInBaseCurrency * 25.0, 'HNL', hideBalances) + ' HNL';
  }, [totalInBaseCurrency, preferences.default_currency, hideBalances]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector Superior: Personal vs Mi Negocio */}
        <View style={styles.topRow}>
          <ProfileSwitcherPill />
          <PressableScale
            onPress={toggleHideBalances}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.surface.surface1,
                borderColor: theme.surface.border,
              },
            ]}
          >
            {hideBalances ? (
              <EyeOff size={18} color={theme.surface.textSecondary} />
            ) : (
              <Eye size={18} color={theme.accent.primary} />
            )}
          </PressableScale>
        </View>

        {/* Área de Visualización Superior 30% (Samsung One UI Reachability) */}
        <View style={styles.heroBalanceBox}>
          <Text
            style={[
              styles.greetingText,
              { color: theme.surface.textSecondary, fontFamily: theme.font.cssFont },
            ]}
          >
            {activeProfileType === 'business'
              ? `Caja Consolidada • ${activeProfile?.display_name || 'Mi Negocio'}`
              : `Hola, ${preferences.full_name || 'Usuario'} • Balance Total`}
          </Text>

          <Text
            style={[
              styles.heroAmount,
              { color: theme.surface.textPrimary, fontFamily: theme.font.cssFont },
            ]}
          >
            {formatMoney(totalInBaseCurrency, preferences.default_currency, hideBalances)}
          </Text>

          <Text style={[styles.secondaryAmount, { color: theme.surface.textSecondary }]}>
            ≈ {secondaryEquivalent}
          </Text>

          {/* Etiquetas de estado del perfil */}
          <View style={styles.badgesRow}>
            {preferences.is_salaried && activeProfileType === 'personal' && (
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: theme.accent.softBg, borderColor: theme.accent.primary },
                ]}
              >
                <TrendingUp size={13} color={theme.accent.primary} />
                <Text style={[styles.statusChipText, { color: theme.accent.primary }]}>
                  Modo Asalariado Activo
                </Text>
              </View>
            )}
            {activeProfileType === 'business' && (
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: theme.accent.softBg, borderColor: theme.accent.primary },
                ]}
              >
                <Sparkles size={13} color={theme.accent.primary} />
                <Text style={[styles.statusChipText, { color: theme.accent.primary }]}>
                  Contabilidad de Negocio
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tarjetas Rápidas de Cuentas (Efectivo, Bancos) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.surface.textPrimary }]}>
            Mis Cuentas ({profileAccounts.length})
          </Text>
          <PressableScale onPress={() => router.push('/(tabs)/accounts')}>
            <Text style={[styles.linkText, { color: theme.accent.primary }]}>
              Gestionar +
            </Text>
          </PressableScale>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountsCarousel}
        >
          {profileAccounts.map((acc) => (
            <PressableScale
              key={acc.id}
              onPress={() => router.push('/(tabs)/accounts')}
              style={[
                styles.accountCard,
                {
                  backgroundColor: theme.surface.surface1,
                  borderColor: theme.surface.border,
                },
              ]}
            >
              <View
                style={[
                  styles.accountIconCircle,
                  { backgroundColor: `${acc.color_hex}22` },
                ]}
              >
                <Wallet size={20} color={acc.color_hex || theme.accent.primary} />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.accountName, { color: theme.surface.textPrimary }]}
              >
                {acc.name}
              </Text>
              <Text style={[styles.accountType, { color: theme.surface.textSecondary }]}>
                {acc.currency} • {acc.account_type.toUpperCase()}
              </Text>
              <Text style={[styles.accountBalance, { color: theme.surface.textPrimary }]}>
                {formatMoney(acc.current_balance, acc.currency, hideBalances)}
              </Text>
            </PressableScale>
          ))}

          <PressableScale
            onPress={() => router.push('/(tabs)/accounts')}
            style={[
              styles.addAccountCard,
              {
                backgroundColor: theme.surface.surface1,
                borderColor: theme.accent.primary,
              },
            ]}
          >
            <Plus size={24} color={theme.accent.primary} />
            <Text style={[styles.addAccountText, { color: theme.accent.primary }]}>
              Nueva Cuenta
            </Text>
          </PressableScale>
        </ScrollView>

        {/* Acciones Rápidas (Zona de Pulgar Samsung One UI) */}
        <View style={styles.quickActionsGrid}>
          <PressableScale
            onPress={() => router.push('/(tabs)/accounts')}
            style={[
              styles.quickActionCard,
              { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
            ]}
          >
            <ArrowDownLeft size={20} color={theme.surface.success} />
            <Text style={[styles.quickActionLabel, { color: theme.surface.textPrimary }]}>
              Registrar Ingreso
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => router.push('/(tabs)/accounts')}
            style={[
              styles.quickActionCard,
              { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
            ]}
          >
            <ArrowUpRight size={20} color={theme.surface.danger} />
            <Text style={[styles.quickActionLabel, { color: theme.surface.textPrimary }]}>
              Registrar Gasto
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => router.push('/(tabs)/planning')}
            style={[
              styles.quickActionCard,
              { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
            ]}
          >
            <CreditCard size={20} color={theme.accent.primary} />
            <Text style={[styles.quickActionLabel, { color: theme.surface.textPrimary }]}>
              Tarjetas y Deudas
            </Text>
          </PressableScale>
        </View>

        {/* Tarjeta de Consejo Financiero con IA */}
        <PressableScale
          onPress={() => router.push('/(tabs)/assistant')}
          style={[
            styles.aiTipCard,
            {
              backgroundColor: theme.surface.surface1,
              borderColor: theme.accent.primary,
            },
          ]}
        >
          <View style={styles.aiTipHeader}>
            <Sparkles size={18} color={theme.accent.primary} />
            <Text style={[styles.aiTipTitle, { color: theme.surface.textPrimary }]}>
              Consejo Financiero Inteligente (Gemini IA)
            </Text>
          </View>
          <Text style={[styles.aiTipBody, { color: theme.surface.textSecondary }]}>
            {activeProfileType === 'business'
              ? 'Mantén separados los retiros personales del flujo operativo de tu negocio. Toca aquí para simular tu punto de equilibrio mensual.'
              : 'Destina al menos el 15% de tu ingreso por nómina a un Certificado de Depósito a Plazo o Fondo de Emergencia antes de gastar en ocio.'}
          </Text>
        </PressableScale>

        {/* Próximos Pagos y Agenda */}
        <View
          style={[
            styles.upcomingCard,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CalendarClock size={18} color={theme.accent.primary} />
              <Text style={[styles.sectionTitle, { color: theme.surface.textPrimary }]}>
                Próximos Pagos y Cortes
              </Text>
            </View>
            <Text style={[styles.linkText, { color: theme.surface.textSecondary }]}>
              {recentTransactions.length} movs.
            </Text>
          </View>
          <Text style={[styles.emptyHint, { color: theme.surface.textSecondary }]}>
            Tus suscripciones, fechas de corte de tarjetas de crédito y cuotas de préstamos aparecerán aquí ordenadas por prioridad.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 36,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBalanceBox: {
    paddingVertical: 14,
    gap: 4,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  secondaryAmount: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  accountsCarousel: {
    gap: 12,
    paddingRight: 12,
  },
  accountCard: {
    width: 175,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  accountIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
  },
  accountType: {
    fontSize: 11,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  addAccountCard: {
    width: 135,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addAccountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  aiTipCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    gap: 8,
  },
  aiTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiTipTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  aiTipBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  upcomingCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 19,
  },
});

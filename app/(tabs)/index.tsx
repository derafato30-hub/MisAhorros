import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  CreditCard,
  Eye,
  EyeOff,
  Landmark,
  PiggyBank,
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
  const creditCards = useAppStore((s) => s.creditCards);
  const payables = useAppStore((s) => s.payables);
  const loans = useAppStore((s) => s.loans);
  const instruments = useAppStore((s) => s.instruments);
  const savingsGoals = useAppStore((s) => s.savingsGoals);
  const budgets = useAppStore((s) => s.budgets);
  const recentTransactions = useAppStore((s) => s.recentTransactions);
  const hideBalances = useAppStore((s) => s.hideBalances);
  const toggleHideBalances = useAppStore((s) => s.toggleHideBalances);

  const activeProfile = useMemo(
    () => financialProfiles.find((p) => p.profile_type === activeProfileType),
    [financialProfiles, activeProfileType]
  );

  const profileAccounts = useMemo(
    () => (activeProfile ? accounts.filter((a) => a.profile_id === activeProfile.id) : accounts),
    [accounts, activeProfile]
  );

  const profileCards = useMemo(
    () =>
      activeProfile
        ? creditCards.filter((c) => c.profile_id === activeProfile.id)
        : creditCards,
    [creditCards, activeProfile]
  );

  const profilePayables = useMemo(
    () =>
      activeProfile
        ? payables.filter((p) => p.profile_id === activeProfile.id && p.status !== 'paid')
        : payables,
    [payables, activeProfile]
  );

  const profileLoans = useMemo(
    () => (activeProfile ? loans.filter((l) => l.profile_id === activeProfile.id) : loans),
    [loans, activeProfile]
  );

  const profileTransactions = useMemo(
    () =>
      activeProfile
        ? recentTransactions.filter((t) => t.profile_id === activeProfile.id)
        : recentTransactions,
    [recentTransactions, activeProfile]
  );

  const totalInBaseCurrency = useMemo(() => {
    return profileAccounts
      .filter((a) => a.include_in_total)
      .reduce((acc, item) => {
        if (item.currency === preferences.default_currency) {
          return acc + item.current_balance;
        }
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

  // Métricas Contables de Flujo de Caja (Ingresos vs Gastos = Utilidad Neta)
  const cashflowMetrics = useMemo(() => {
    const incomes = profileTransactions
      .filter((t) => t.transaction_type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expenses = profileTransactions
      .filter((t) => t.transaction_type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return {
      incomes,
      expenses,
      netProfit: incomes - expenses,
    };
  }, [profileTransactions]);

  // Consejo financiero inteligente calculado sobre los datos actuales del usuario
  const dynamicFinancialTip = useMemo(() => {
    const totalCardDebt = profileCards.reduce(
      (s, c) => s + c.statement_balance + c.unbilled_balance,
      0
    );
    const totalCreditLimit = profileCards.reduce((s, c) => s + c.credit_limit, 0);
    const utilization = totalCreditLimit > 0 ? (totalCardDebt / totalCreditLimit) * 100 : 0;

    if (activeProfileType === 'business') {
      if (cashflowMetrics.netProfit > 0) {
        return `Tu negocio presenta una Utilidad Neta positiva de ${formatMoney(
          cashflowMetrics.netProfit,
          preferences.default_currency,
          hideBalances
        )}. Te sugerimos reservar el 20% en un Depósito a Plazo para capital de trabajo e impuestos.`;
      }
      return 'Registra tus ventas y costos operativos separados de tu cuenta personal para calcular tu margen de utilidad neta en tiempo real.';
    }

    if (utilization > 40) {
      return `Alerta de Crédito: Estás utilizando el ${utilization.toFixed(
        0
      )}% del límite de tus tarjetas. Pagar el saldo al corte antes del vencimiento evitará cargos por intereses rotativos.`;
    }

    if (profilePayables.length > 0) {
      return `Tienes ${profilePayables.length} pago(s) fijo(s) o cuotas próximas a vencer. Liquídalas a tiempo para evitar recargos por tasa moratoria.`;
    }

    return `Tu liquidez actual es de ${formatMoney(
      totalInBaseCurrency,
      preferences.default_currency,
      hideBalances
    )}. Excelente momento para programar un aporte automático a tu Fondo de Emergencia o Certificado a Plazo.`;
  }, [
    activeProfileType,
    cashflowMetrics.netProfit,
    hideBalances,
    preferences.default_currency,
    profileCards,
    profilePayables.length,
    totalInBaseCurrency,
  ]);

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
              ? `Liquidez del Negocio • ${activeProfile?.display_name || 'Mi Negocio'}`
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
                  Asalariado / Nómina
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
                <Briefcase size={13} color={theme.accent.primary} />
                <Text style={[styles.statusChipText, { color: theme.accent.primary }]}>
                  Contabilidad Pyme Activa
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tarjeta Especial de Contabilidad Básica cuando está activo "Mi Negocio" o Resumen de Flujo */}
        <View
          style={[
            styles.cashflowCard,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.surface.textPrimary }]}>
            {activeProfileType === 'business'
              ? 'Estado de Resultados & Flujo de Caja del Negocio'
              : 'Flujo de Ingresos vs. Gastos del Período'}
          </Text>
          <View style={styles.cashflowRow}>
            <View style={styles.cashflowCol}>
              <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                {activeProfileType === 'business' ? 'Ventas e Ingresos' : 'Ingresos / Nómina'}
              </Text>
              <Text style={[styles.cashflowVal, { color: theme.surface.success }]}>
                +{formatMoney(cashflowMetrics.incomes, preferences.default_currency, hideBalances)}
              </Text>
            </View>
            <View style={styles.cashflowCol}>
              <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                {activeProfileType === 'business' ? 'Costos Operativos' : 'Gastos Totales'}
              </Text>
              <Text style={[styles.cashflowVal, { color: theme.surface.danger }]}>
                -{formatMoney(cashflowMetrics.expenses, preferences.default_currency, hideBalances)}
              </Text>
            </View>
            <View style={styles.cashflowCol}>
              <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                {activeProfileType === 'business' ? 'Utilidad Neta' : 'Balance Neto'}
              </Text>
              <Text
                style={[
                  styles.cashflowVal,
                  {
                    color:
                      cashflowMetrics.netProfit >= 0
                        ? theme.accent.primary
                        : theme.surface.danger,
                  },
                ]}
              >
                {formatMoney(cashflowMetrics.netProfit, preferences.default_currency, hideBalances)}
              </Text>
            </View>
          </View>
        </View>

        {/* Carrusel de Cuentas (Efectivo, Banco X, Banco Y) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.surface.textPrimary }]}>
            Cuentas Activas ({profileAccounts.length})
          </Text>
          <PressableScale onPress={() => router.push('/(tabs)/accounts')}>
            <Text style={[styles.linkText, { color: theme.accent.primary }]}>
              Ver Movimientos →
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
              + Cuenta
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
              Ingreso / Nómina
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
              Tarjetas y Cuotas
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => router.push('/(tabs)/assistant')}
            style={[
              styles.quickActionCard,
              { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
            ]}
          >
            <Sparkles size={20} color={theme.accent.primary} />
            <Text style={[styles.quickActionLabel, { color: theme.surface.textPrimary }]}>
              Chatbot IA
            </Text>
          </PressableScale>
        </View>

        {/* Consejo Financiero Dinámico Basado en los Datos Actuales */}
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
              Diagnóstico y Consejo Financiero en Vivo
            </Text>
          </View>
          <Text style={[styles.aiTipBody, { color: theme.surface.textSecondary }]}>
            {dynamicFinancialTip}
          </Text>
        </PressableScale>

        {/* Próximos Pagos, Cortes de Tarjetas y Cuotas de Préstamos */}
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
                Próximos Pagos, Suscripciones y Cortes
              </Text>
            </View>
            <PressableScale onPress={() => router.push('/(tabs)/planning')}>
              <Text style={[styles.linkText, { color: theme.accent.primary }]}>
                Ver Agenda
              </Text>
            </PressableScale>
          </View>

          {profilePayables.length === 0 && profileCards.length === 0 && profileLoans.length === 0 ? (
            <Text style={[styles.emptyHint, { color: theme.surface.textSecondary }]}>
              No tienes pagos próximos vencidos. Agrega tus suscripciones, tarjetas de crédito o préstamos en la pestaña "Metas y Deudas".
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {profilePayables.slice(0, 3).map((p) => (
                <View
                  key={p.id}
                  style={[
                    styles.upcomingRow,
                    { backgroundColor: theme.surface.surface2, borderColor: theme.surface.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.surface.textPrimary, fontWeight: '700', fontSize: 13 }}>
                      📌 {p.title}
                    </Text>
                    <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                      Vence: {p.next_due_date} • {p.frequency.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ color: theme.surface.warning, fontWeight: '800', fontSize: 14 }}>
                    {formatMoney(p.amount, p.currency, hideBalances)}
                  </Text>
                </View>
              ))}

              {profileCards.slice(0, 2).map((c) => (
                <View
                  key={c.id}
                  style={[
                    styles.upcomingRow,
                    { backgroundColor: theme.surface.surface2, borderColor: theme.surface.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.surface.textPrimary, fontWeight: '700', fontSize: 13 }}>
                      💳 {c.card_name} ({c.bank_name})
                    </Text>
                    <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                      Día de Corte: {c.closing_day} • Día Máximo Pago: {c.due_day}
                    </Text>
                  </View>
                  <Text style={{ color: theme.accent.primary, fontWeight: '800', fontSize: 14 }}>
                    {formatMoney(c.statement_balance, c.currency, hideBalances)}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
    gap: 16,
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
    paddingVertical: 10,
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
    marginTop: 6,
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
  cashflowCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  cashflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cashflowCol: {
    flex: 1,
    gap: 4,
  },
  cashflowVal: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
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
    width: 125,
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
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionLabel: {
    fontSize: 11,
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
    gap: 12,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 19,
  },
});

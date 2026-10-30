import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Calendar,
  Check,
  CreditCard,
  HandCoins,
  Landmark,
  PieChart,
  PiggyBank,
  Plus,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { CURRENCIES, CurrencyCode, formatMoney } from '../../src/theme/samsungOneUI';
import { ProfileSwitcherPill } from '../../src/components/ui/ProfileSwitcherPill';
import { PressableScale } from '../../src/components/ui/PressableScale';

type ModuleSubTab = 'cards' | 'payables' | 'loans' | 'wealth' | 'budgets';

export default function PlanningTabScreen() {
  const theme = useSamsungTheme();
  const activeProfileType = useAppStore((s) => s.activeProfileType);
  const financialProfiles = useAppStore((s) => s.financialProfiles);
  const hideBalances = useAppStore((s) => s.hideBalances);
  const defaultCurrency = useAppStore((s) => s.preferences.default_currency);

  const accounts = useAppStore((s) => s.accounts);
  const creditCards = useAppStore((s) => s.creditCards);
  const payables = useAppStore((s) => s.payables);
  const loans = useAppStore((s) => s.loans);
  const instruments = useAppStore((s) => s.instruments);
  const savingsGoals = useAppStore((s) => s.savingsGoals);
  const budgets = useAppStore((s) => s.budgets);
  const reminders = useAppStore((s) => s.reminders);
  const recentTransactions = useAppStore((s) => s.recentTransactions);

  const createCreditCard = useAppStore((s) => s.createCreditCard);
  const payCreditCard = useAppStore((s) => s.payCreditCard);
  const createPayable = useAppStore((s) => s.createPayable);
  const markPayableAsPaid = useAppStore((s) => s.markPayableAsPaid);
  const createLoan = useAppStore((s) => s.createLoan);
  const registerLoanPayment = useAppStore((s) => s.registerLoanPayment);
  const createBudget = useAppStore((s) => s.createBudget);
  const createSavingsGoal = useAppStore((s) => s.createSavingsGoal);
  const contributeToSavingsGoal = useAppStore((s) => s.contributeToSavingsGoal);
  const createFinancialInstrument = useAppStore((s) => s.createFinancialInstrument);
  const createReminder = useAppStore((s) => s.createReminder);
  const toggleReminderCompleted = useAppStore((s) => s.toggleReminderCompleted);

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
    () => (activeProfile ? payables.filter((p) => p.profile_id === activeProfile.id) : payables),
    [payables, activeProfile]
  );

  const profileLoans = useMemo(
    () => (activeProfile ? loans.filter((l) => l.profile_id === activeProfile.id) : loans),
    [loans, activeProfile]
  );

  const profileInstruments = useMemo(
    () =>
      activeProfile
        ? instruments.filter((i) => i.profile_id === activeProfile.id)
        : instruments,
    [instruments, activeProfile]
  );

  const profileGoals = useMemo(
    () =>
      activeProfile
        ? savingsGoals.filter((g) => g.profile_id === activeProfile.id)
        : savingsGoals,
    [savingsGoals, activeProfile]
  );

  const profileBudgets = useMemo(
    () => (activeProfile ? budgets.filter((b) => b.profile_id === activeProfile.id) : budgets),
    [budgets, activeProfile]
  );

  const profileReminders = useMemo(
    () =>
      activeProfile ? reminders.filter((r) => r.profile_id === activeProfile.id) : reminders,
    [reminders, activeProfile]
  );

  const [subTab, setSubTab] = useState<ModuleSubTab>('cards');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados Formulario Tarjeta de Crédito
  const [cardName, setCardName] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardNetwork, setCardNetwork] = useState<'visa' | 'mastercard' | 'amex'>('visa');
  const [cardLimit, setCardLimit] = useState('');
  const [cardStatement, setCardStatement] = useState('');
  const [cardClosingDay, setCardClosingDay] = useState('15');
  const [cardDueDay, setCardDueDay] = useState('5');
  const [cardRate, setCardRate] = useState('36');

  // Estados Formulario Cuentas por Pagar / Suscripciones
  const [payTitle, setPayTitle] = useState('');
  const [payType, setPayType] = useState<'subscription' | 'fixed_expense' | 'payable_debt'>(
    'subscription'
  );
  const [payAmount, setPayAmount] = useState('');
  const [payFreq, setPayFreq] = useState<'weekly' | 'biweekly' | 'monthly' | 'once'>('monthly');
  const [payDueDate, setPayDueDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [payTotalInstallments, setPayTotalInstallments] = useState('');
  const [payLateRate, setPayLateRate] = useState('18');
  const [payPaidDate, setPayPaidDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados Formulario Préstamos
  const [loanDir, setLoanDir] = useState<'received' | 'granted'>('received');
  const [loanPerson, setLoanPerson] = useState('');
  const [loanPrincipal, setLoanPrincipal] = useState('');
  const [loanRate, setLoanRate] = useState('14');
  const [loanMonths, setLoanMonths] = useState('12');
  const [loanInstallment, setLoanInstallment] = useState('');

  // Estados Formulario Ahorros e Instrumentos Financieros
  const [wealthMode, setWealthMode] = useState<'goal' | 'instrument'>('goal');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalInitial, setGoalInitial] = useState('');
  const [instType, setInstType] = useState<'term_deposit' | 'pension_fund' | 'stocks_etf'>(
    'term_deposit'
  );
  const [instBank, setInstBank] = useState('');
  const [instName, setInstName] = useState('');
  const [instCapital, setInstCapital] = useState('');
  const [instYield, setInstYield] = useState('8.5');
  const [instMaturity, setInstMaturity] = useState('2027-06-30');

  // Estados Formulario Presupuestos y Agenda
  const [budgetMode, setBudgetMode] = useState<'budget' | 'reminder'>('budget');
  const [budgetName, setBudgetName] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>(
    'monthly'
  );
  const [budgetLimit, setBudgetLimit] = useState('');
  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState(new Date().toISOString().split('T')[0]);
  const [remAmount, setRemAmount] = useState('');

  const handleSaveCard = async () => {
    if (!cardName.trim() || !cardLimit) return;
    setLoading(true);
    try {
      await createCreditCard({
        card_name: cardName.trim(),
        bank_name: cardBank.trim() || 'Banco',
        network: cardNetwork,
        last4_digits: '4829',
        currency: defaultCurrency,
        credit_limit: parseFloat(cardLimit) || 0,
        statement_balance: parseFloat(cardStatement || '0') || 0,
        unbilled_balance: 0,
        closing_day: parseInt(cardClosingDay, 10) || 15,
        due_day: parseInt(cardDueDay, 10) || 5,
        interest_rate_annual: parseFloat(cardRate || '0') || 0,
      });
      setCardName('');
      setCardLimit('');
      setCardStatement('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayable = async () => {
    if (!payTitle.trim() || !payAmount) return;
    setLoading(true);
    try {
      await createPayable({
        title: payTitle.trim(),
        payable_type: payType,
        amount: parseFloat(payAmount) || 0,
        currency: defaultCurrency,
        frequency: payFreq,
        next_due_date: payDueDate,
        current_installment: 1,
        total_installments: payTotalInstallments ? parseInt(payTotalInstallments, 10) : null,
        late_interest_rate: parseFloat(payLateRate || '0') || 0,
      });
      setPayTitle('');
      setPayAmount('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLoan = async () => {
    if (!loanPerson.trim() || !loanPrincipal) return;
    const p = parseFloat(loanPrincipal) || 0;
    const n = parseInt(loanMonths || '12', 10) || 12;
    const r = (parseFloat(loanRate || '0') || 0) / 100 / 12;
    const autoPmt =
      r > 0 ? (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : p / n;

    setLoading(true);
    try {
      await createLoan({
        loan_direction: loanDir,
        counterparty_name: loanPerson.trim(),
        principal_amount: p,
        currency: defaultCurrency,
        annual_interest_rate: parseFloat(loanRate || '0') || 0,
        term_months: n,
        installment_amount: parseFloat(loanInstallment) || Math.round(autoPmt * 100) / 100,
        frequency: 'monthly',
        next_payment_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        disburse_or_deposit_account_id: profileAccounts[0]?.id || null,
      });
      setLoanPerson('');
      setLoanPrincipal('');
      setLoanInstallment('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWealth = async () => {
    setLoading(true);
    try {
      if (wealthMode === 'goal') {
        if (!goalName.trim() || !goalTarget) return;
        await createSavingsGoal({
          name: goalName.trim(),
          target_amount: parseFloat(goalTarget) || 0,
          current_amount: parseFloat(goalInitial || '0') || 0,
          currency: defaultCurrency,
          color_hex: theme.accent.primary,
        });
        setGoalName('');
        setGoalTarget('');
      } else {
        if (!instName.trim() || !instCapital) return;
        const cap = parseFloat(instCapital) || 0;
        await createFinancialInstrument({
          instrument_type: instType,
          institution_name: instBank.trim() || 'Institución Financiera',
          name: instName.trim(),
          currency: defaultCurrency,
          invested_capital: cap,
          current_value: cap,
          annual_yield_rate: parseFloat(instYield || '0') || 0,
          maturity_date: instMaturity || null,
        });
        setInstName('');
        setInstCapital('');
      }
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudgetOrReminder = async () => {
    setLoading(true);
    try {
      if (budgetMode === 'budget') {
        if (!budgetName.trim() || !budgetLimit) return;
        await createBudget({
          name: budgetName.trim(),
          period_type: budgetPeriod,
          limit_amount: parseFloat(budgetLimit) || 0,
          currency: defaultCurrency,
        });
        setBudgetName('');
        setBudgetLimit('');
      } else {
        if (!remTitle.trim()) return;
        await createReminder({
          title: remTitle.trim(),
          event_date: remDate,
          reminder_type: 'custom',
          amount: remAmount ? parseFloat(remAmount) : null,
        });
        setRemTitle('');
        setRemAmount('');
      }
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  // Gasto acumulado en el perfil actual para comparar con los presupuestos
  const totalProfileSpent = useMemo(() => {
    return recentTransactions
      .filter(
        (t) =>
          (!activeProfile || t.profile_id === activeProfile.id) &&
          t.transaction_type === 'expense'
      )
      .reduce((acc, item) => acc + item.amount, 0);
  }, [recentTransactions, activeProfile]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSwitcherPill />

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.surface.textPrimary }]}>
              Centro Financiero 360°
            </Text>
            <Text style={[styles.sub, { color: theme.surface.textSecondary }]}>
              Tarjetas, Deudas, Préstamos, Inversiones (CDP/AFP), Presupuestos y Agenda
            </Text>
          </View>
          <PressableScale
            onPress={() => setShowForm(!showForm)}
            style={[styles.newBtn, { backgroundColor: theme.accent.primary }]}
          >
            {showForm ? <X size={18} color="#0B0F19" /> : <Plus size={18} color="#0B0F19" />}
            <Text style={styles.newBtnText}>{showForm ? 'Cerrar' : 'Agregar'}</Text>
          </PressableScale>
        </View>

        {/* Sub-navegación estilo Samsung One UI */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabsRow}
        >
          {(
            [
              { k: 'cards', l: 'Tarjetas Crédito', icon: CreditCard },
              { k: 'payables', l: 'Por Pagar / Cuotas', icon: AlertTriangle },
              { k: 'loans', l: 'Préstamos 360°', icon: HandCoins },
              { k: 'wealth', l: 'Ahorros & CDP/AFP', icon: PiggyBank },
              { k: 'budgets', l: 'Presupuestos & Agenda', icon: Calendar },
            ] as const
          ).map((tab) => {
            const IconComp = tab.icon;
            const active = subTab === tab.k;
            return (
              <PressableScale
                key={tab.k}
                onPress={() => {
                  setSubTab(tab.k);
                  setShowForm(false);
                }}
                style={[
                  styles.subTabPill,
                  {
                    backgroundColor: active ? theme.accent.softBg : theme.surface.surface1,
                    borderColor: active ? theme.accent.primary : theme.surface.border,
                  },
                ]}
              >
                <IconComp
                  size={15}
                  color={active ? theme.accent.primary : theme.surface.textSecondary}
                />
                <Text
                  style={{
                    color: active ? theme.accent.primary : theme.surface.textSecondary,
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  {tab.l}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* ===================================================================
            SECCIÓN 1: TARJETAS DE CRÉDITO (Multi-Tarjeta, Cortes y Pagos)
        =================================================================== */}
        {subTab === 'cards' && (
          <View style={styles.sectionStack}>
            {showForm && (
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
                ]}
              >
                <Text style={[styles.formTitle, { color: theme.surface.textPrimary }]}>
                  Agregar Nueva Tarjeta de Crédito
                </Text>
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Nombre (Ej. Visa Infinite BAC, Mastercard Oro)"
                  placeholderTextColor={theme.surface.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface.surface2,
                      color: theme.surface.textPrimary,
                      borderColor: theme.surface.border,
                    },
                  ]}
                />
                <TextInput
                  value={cardBank}
                  onChangeText={setCardBank}
                  placeholder="Banco Emisor (Ej. BAC Credomatic, Ficohsa, Atlántida)"
                  placeholderTextColor={theme.surface.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface.surface2,
                      color: theme.surface.textPrimary,
                      borderColor: theme.surface.border,
                    },
                  ]}
                />
                <View style={styles.twoCols}>
                  <TextInput
                    value={cardLimit}
                    onChangeText={setCardLimit}
                    keyboardType="numeric"
                    placeholder="Límite Total (Ej. 65000)"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                  <TextInput
                    value={cardStatement}
                    onChangeText={setCardStatement}
                    keyboardType="numeric"
                    placeholder="Saldo al Corte Actual"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                </View>
                <View style={styles.twoCols}>
                  <TextInput
                    value={cardClosingDay}
                    onChangeText={setCardClosingDay}
                    keyboardType="numeric"
                    placeholder="Día de Corte (1-31)"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                  <TextInput
                    value={cardDueDay}
                    onChangeText={setCardDueDay}
                    keyboardType="numeric"
                    placeholder="Día Máx. Pago (1-31)"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                </View>
                <PressableScale
                  disabled={loading}
                  onPress={handleSaveCard}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  <Text style={styles.submitBtnText}>Guardar Tarjeta de Crédito</Text>
                </PressableScale>
              </View>
            )}

            {profileCards.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
                ]}
              >
                <CreditCard size={28} color={theme.accent.primary} />
                <Text style={{ color: theme.surface.textPrimary, fontWeight: '800' }}>
                  Sin Tarjetas de Crédito Configuradas
                </Text>
                <Text
                  style={{ color: theme.surface.textSecondary, fontSize: 13, textAlign: 'center' }}
                >
                  Toca el botón superior "Agregar" para registrar una o múltiples tarjetas, controlar sus fechas de corte, límite disponible y pagos de contado.
                </Text>
              </View>
            ) : (
              profileCards.map((card) => {
                const used = card.statement_balance + card.unbilled_balance;
                const available = Math.max(0, card.credit_limit - used);
                const availPercent =
                  card.credit_limit > 0
                    ? Math.round((available / card.credit_limit) * 100)
                    : 100;

                return (
                  <View
                    key={card.id}
                    style={[
                      styles.creditCardVisual,
                      {
                        backgroundColor: theme.surface.surface1,
                        borderColor: theme.accent.primary,
                      },
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View>
                        <Text style={[styles.cardBankLabel, { color: theme.accent.primary }]}>
                          {card.bank_name.toUpperCase()} • {card.network.toUpperCase()}
                        </Text>
                        <Text style={[styles.cardTitleText, { color: theme.surface.textPrimary }]}>
                          {card.card_name}
                        </Text>
                      </View>
                      <View style={styles.cutoffBadge}>
                        <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                          Corte: Día {card.closing_day} • Pago: Día {card.due_day}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBalancesGrid}>
                      <View>
                        <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                          Pago de Contado (Al Corte)
                        </Text>
                        <Text style={[styles.cardMainAmount, { color: theme.surface.warning }]}>
                          {formatMoney(card.statement_balance, card.currency, hideBalances)}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                          Compras Flotantes
                        </Text>
                        <Text
                          style={[styles.cardMainAmount, { color: theme.surface.textPrimary }]}
                        >
                          {formatMoney(card.unbilled_balance, card.currency, hideBalances)}
                        </Text>
                      </View>
                    </View>

                    {/* Barra de progreso de límite disponible */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${availPercent}%`,
                            backgroundColor: theme.accent.primary,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.cardBottomRow}>
                      <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                        Disponible: {formatMoney(available, card.currency, hideBalances)} (
                        {availPercent}%)
                      </Text>
                      {used > 0 && profileAccounts.length > 0 && (
                        <PressableScale
                          onPress={() =>
                            payCreditCard({
                              source_account_id: profileAccounts[0].id,
                              credit_card_id: card.id,
                              amount: card.statement_balance > 0 ? card.statement_balance : used,
                            })
                          }
                          style={[
                            styles.miniActionBtn,
                            { backgroundColor: theme.accent.softBg, borderColor: theme.accent.primary },
                          ]}
                        >
                          <Text style={{ color: theme.accent.primary, fontWeight: '800', fontSize: 12 }}>
                            Pagar Contado desde {profileAccounts[0].name}
                          </Text>
                        </PressableScale>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ===================================================================
            SECCIÓN 2: CUENTAS POR PAGAR, SUSCRIPCIONES, CUOTAS Y MORA
        =================================================================== */}
        {subTab === 'payables' && (
          <View style={styles.sectionStack}>
            {showForm && (
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
                ]}
              >
                <Text style={[styles.formTitle, { color: theme.surface.textPrimary }]}>
                  Registrar Cuenta por Pagar, Suscripción o Gasto Fijo
                </Text>
                <TextInput
                  value={payTitle}
                  onChangeText={setPayTitle}
                  placeholder="Concepto (Ej. Netflix, Alquiler Local, Proveedor X)"
                  placeholderTextColor={theme.surface.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface.surface2,
                      color: theme.surface.textPrimary,
                      borderColor: theme.surface.border,
                    },
                  ]}
                />
                <View style={styles.twoCols}>
                  <TextInput
                    value={payAmount}
                    onChangeText={setPayAmount}
                    keyboardType="numeric"
                    placeholder="Monto Cuota (Ej. 2500)"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                  <TextInput
                    value={payTotalInstallments}
                    onChangeText={setPayTotalInstallments}
                    keyboardType="numeric"
                    placeholder="Total Cuotas (Vacío=Fijo)"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                </View>
                <View style={styles.twoCols}>
                  <TextInput
                    value={payDueDate}
                    onChangeText={setPayDueDate}
                    placeholder="Vencimiento YYYY-MM-DD"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                  <TextInput
                    value={payLateRate}
                    onChangeText={setPayLateRate}
                    keyboardType="numeric"
                    placeholder="% Interés Mora Anual"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                </View>
                <PressableScale
                  disabled={loading}
                  onPress={handleSavePayable}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  <Text style={styles.submitBtnText}>Guardar Compromiso de Pago</Text>
                </PressableScale>
              </View>
            )}

            {profilePayables.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
                ]}
              >
                <AlertTriangle size={28} color={theme.accent.primary} />
                <Text style={{ color: theme.surface.textPrimary, fontWeight: '800' }}>
                  Sin Cuentas por Pagar o Suscripciones Activas
                </Text>
                <Text
                  style={{ color: theme.surface.textSecondary, fontSize: 13, textAlign: 'center' }}
                >
                  Registra tus suscripciones, servicios fijos o deudas en cuotas con cálculo automático de intereses por atraso.
                </Text>
              </View>
            ) : (
              profilePayables.map((item) => {
                const today = new Date();
                const due = new Date(item.next_due_date);
                const diffDays = Math.floor((today.getTime() - due.getTime()) / 86400000);
                const isOverdue = diffDays > 0 && item.status !== 'paid';
                const lateFee = isOverdue
                  ? Math.round(
                      item.amount * ((item.late_interest_rate || 0) / 100 / 360) * diffDays * 100
                    ) /
                      100 +
                    (item.late_fixed_fee || 0)
                  : 0;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: theme.surface.surface1,
                        borderColor: isOverdue ? theme.surface.danger : theme.surface.border,
                      },
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitleText, { color: theme.surface.textPrimary }]}>
                          {item.title}
                        </Text>
                        <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                          Vence: {item.next_due_date} • Frecuencia: {item.frequency.toUpperCase()}
                          {item.total_installments
                            ? ` • Cuota ${item.current_installment} de ${item.total_installments}`
                            : ''}
                        </Text>
                      </View>
                      <Text style={[styles.cardMainAmount, { color: theme.surface.textPrimary }]}>
                        {formatMoney(item.amount, item.currency, hideBalances)}
                      </Text>
                    </View>

                    {isOverdue && (
                      <View style={styles.overdueBanner}>
                        <Text style={{ color: theme.surface.danger, fontSize: 12, fontWeight: '700' }}>
                          ⚠️ Atraso de {diffDays} días • Interés por mora estimado:{' '}
                          {formatMoney(lateFee, item.currency, hideBalances)}
                        </Text>
                      </View>
                    )}

                    {item.status !== 'paid' && profileAccounts.length > 0 && (
                      <View style={styles.payNowRow}>
                        <TextInput
                          value={payPaidDate}
                          onChangeText={setPayPaidDate}
                          placeholder="Día pagado YYYY-MM-DD"
                          style={[
                            styles.miniDateInput,
                            {
                              backgroundColor: theme.surface.surface2,
                              color: theme.surface.textPrimary,
                              borderColor: theme.surface.border,
                            },
                          ]}
                        />
                        <PressableScale
                          onPress={() =>
                            markPayableAsPaid({
                              payable_id: item.id,
                              account_id: profileAccounts[0].id,
                              paid_date: payPaidDate,
                              late_fee_applied: lateFee,
                            })
                          }
                          style={[
                            styles.miniActionBtn,
                            { backgroundColor: theme.accent.primary },
                          ]}
                        >
                          <Check size={14} color="#0B0F19" />
                          <Text style={{ color: '#0B0F19', fontWeight: '800', fontSize: 12 }}>
                            Marcar Pagado
                          </Text>
                        </PressableScale>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ===================================================================
            SECCIÓN 3: PRÉSTAMOS 360° (Recibidos = Pasivo | Otorgados = Activo)
        =================================================================== */}
        {subTab === 'loans' && (
          <View style={styles.sectionStack}>
            {showForm && (
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
                ]}
              >
                <Text style={[styles.formTitle, { color: theme.surface.textPrimary }]}>
                  Registrar Préstamo (Otorgado a un Tercero o Recibido de un Banco)
                </Text>
                <View style={styles.twoCols}>
                  <PressableScale
                    onPress={() => setLoanDir('granted')}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor:
                          loanDir === 'granted' ? theme.accent.softBg : theme.surface.surface2,
                        borderColor:
                          loanDir === 'granted' ? theme.accent.primary : theme.surface.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          loanDir === 'granted'
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      🤝 Otorgar Préstamo (Por Cobrar)
                    </Text>
                  </PressableScale>

                  <PressableScale
                    onPress={() => setLoanDir('received')}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor:
                          loanDir === 'received' ? theme.accent.softBg : theme.surface.surface2,
                        borderColor:
                          loanDir === 'received' ? theme.accent.primary : theme.surface.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          loanDir === 'received'
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      🏦 Préstamo Recibido (Deuda)
                    </Text>
                  </PressableScale>
                </View>

                <TextInput
                  value={loanPerson}
                  onChangeText={setLoanPerson}
                  placeholder={
                    loanDir === 'granted'
                      ? 'Nombre del Deudor / Cliente (Ej. Juan Pérez)'
                      : 'Institución o Acreedor (Ej. Banco Atlántida)'
                  }
                  placeholderTextColor={theme.surface.textMuted}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface.surface2,
                      color: theme.surface.textPrimary,
                      borderColor: theme.surface.border,
                    },
                  ]}
                />
                <View style={styles.twoCols}>
                  <TextInput
                    value={loanPrincipal}
                    onChangeText={setLoanPrincipal}
                    keyboardType="numeric"
                    placeholder="Capital Principal"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                  <TextInput
                    value={loanRate}
                    onChangeText={setLoanRate}
                    keyboardType="numeric"
                    placeholder="Tasa Anual %"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                </View>
                <View style={styles.twoCols}>
                  <TextInput
                    value={loanMonths}
                    onChangeText={setLoanMonths}
                    keyboardType="numeric"
                    placeholder="Plazo en Meses (Ej. 12)"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                  <TextInput
                    value={loanInstallment}
                    onChangeText={setLoanInstallment}
                    keyboardType="numeric"
                    placeholder="Cuota Mensual (Opcional)"
                    placeholderTextColor={theme.surface.textMuted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: theme.surface.surface2,
                        color: theme.surface.textPrimary,
                        borderColor: theme.surface.border,
                      },
                    ]}
                  />
                </View>
                <PressableScale
                  disabled={loading}
                  onPress={handleSaveLoan}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  <Text style={styles.submitBtnText}>Registrar Préstamo y Desembolso</Text>
                </PressableScale>
              </View>
            )}

            {profileLoans.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
                ]}
              >
                <HandCoins size={28} color={theme.accent.primary} />
                <Text style={{ color: theme.surface.textPrimary, fontWeight: '800' }}>
                  Sin Préstamos Activos
                </Text>
                <Text
                  style={{ color: theme.surface.textSecondary, fontSize: 13, textAlign: 'center' }}
                >
                  Gestiona tanto el dinero que prestas a terceros (con cobro de cuotas e intereses) como tus préstamos bancarios.
                </Text>
              </View>
            ) : (
              profileLoans.map((loan) => {
                const isGranted = loan.loan_direction === 'granted';
                const paidPct =
                  loan.principal_amount > 0
                    ? Math.round(
                        ((loan.principal_amount - loan.remaining_balance) /
                          loan.principal_amount) *
                          100
                      )
                    : 0;

                return (
                  <View
                    key={loan.id}
                    style={[
                      styles.itemCard,
                      { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: isGranted ? theme.surface.success : theme.surface.warning,
                            fontSize: 11,
                            fontWeight: '800',
                          }}
                        >
                          {isGranted
                            ? '🤝 PRÉSTAMO OTORGADO (ACTIVO POR COBRAR)'
                            : '🏦 PRÉSTAMO RECIBIDO (PASIVO)'}
                        </Text>
                        <Text style={[styles.cardTitleText, { color: theme.surface.textPrimary }]}>
                          {loan.counterparty_name}
                        </Text>
                        <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                          Tasa: {loan.annual_interest_rate}% anual • Cuota:{' '}
                          {formatMoney(loan.installment_amount, loan.currency, hideBalances)} •
                          Abonos: {loan.paid_installments}/{loan.term_months}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                          Saldo Pendiente
                        </Text>
                        <Text style={[styles.cardMainAmount, { color: theme.surface.textPrimary }]}>
                          {formatMoney(loan.remaining_balance, loan.currency, hideBalances)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${paidPct}%`,
                            backgroundColor: isGranted
                              ? theme.surface.success
                              : theme.accent.primary,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.cardBottomRow}>
                      <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                        Amortizado: {paidPct}% de{' '}
                        {formatMoney(loan.principal_amount, loan.currency, hideBalances)}
                      </Text>
                      {loan.remaining_balance > 0 && profileAccounts.length > 0 && (
                        <PressableScale
                          onPress={() =>
                            registerLoanPayment({
                              loan_id: loan.id,
                              account_id: profileAccounts[0].id,
                              amount: loan.installment_amount,
                            })
                          }
                          style={[
                            styles.miniActionBtn,
                            { backgroundColor: theme.accent.softBg, borderColor: theme.accent.primary },
                          ]}
                        >
                          <Text style={{ color: theme.accent.primary, fontWeight: '800', fontSize: 12 }}>
                            {isGranted ? '+ Registrar Cobro de Cuota' : 'Pagar Cuota'}
                          </Text>
                        </PressableScale>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ===================================================================
            SECCIÓN 4: AHORROS, METAS E INSTRUMENTOS (CDP, Pensión, Inversiones)
        =================================================================== */}
        {subTab === 'wealth' && (
          <View style={styles.sectionStack}>
            {showForm && (
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
                ]}
              >
                <View style={styles.twoCols}>
                  <PressableScale
                    onPress={() => setWealthMode('goal')}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor:
                          wealthMode === 'goal' ? theme.accent.softBg : theme.surface.surface2,
                        borderColor:
                          wealthMode === 'goal' ? theme.accent.primary : theme.surface.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          wealthMode === 'goal'
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      🎯 Meta / Fondo de Ahorro
                    </Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => setWealthMode('instrument')}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor:
                          wealthMode === 'instrument'
                            ? theme.accent.softBg
                            : theme.surface.surface2,
                        borderColor:
                          wealthMode === 'instrument'
                            ? theme.accent.primary
                            : theme.surface.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          wealthMode === 'instrument'
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      📈 Instrumento (CDP / Pensión)
                    </Text>
                  </PressableScale>
                </View>

                {wealthMode === 'goal' ? (
                  <>
                    <TextInput
                      value={goalName}
                      onChangeText={setGoalName}
                      placeholder="Nombre de la Meta (Ej. Fondo de Emergencia, Viaje)"
                      placeholderTextColor={theme.surface.textMuted}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.surface.surface2,
                          color: theme.surface.textPrimary,
                          borderColor: theme.surface.border,
                        },
                      ]}
                    />
                    <View style={styles.twoCols}>
                      <TextInput
                        value={goalTarget}
                        onChangeText={setGoalTarget}
                        keyboardType="numeric"
                        placeholder="Meta Total (Ej. 50000)"
                        placeholderTextColor={theme.surface.textMuted}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.surface.surface2,
                            color: theme.surface.textPrimary,
                            borderColor: theme.surface.border,
                          },
                        ]}
                      />
                      <TextInput
                        value={goalInitial}
                        onChangeText={setGoalInitial}
                        keyboardType="numeric"
                        placeholder="Ahorro Actual"
                        placeholderTextColor={theme.surface.textMuted}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.surface.surface2,
                            color: theme.surface.textPrimary,
                            borderColor: theme.surface.border,
                          },
                        ]}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.twoCols}>
                      {(
                        [
                          { k: 'term_deposit', l: 'Depósito a Plazo (CDP)' },
                          { k: 'pension_fund', l: 'Fondo Pensión / AFP' },
                          { k: 'stocks_etf', l: 'Inversión / ETF' },
                        ] as const
                      ).map((it) => (
                        <PressableScale
                          key={it.k}
                          onPress={() => setInstType(it.k)}
                          style={[
                            styles.choiceBtn,
                            {
                              backgroundColor:
                                instType === it.k ? theme.accent.softBg : theme.surface.surface2,
                              borderColor:
                                instType === it.k ? theme.accent.primary : theme.surface.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                instType === it.k
                                  ? theme.accent.primary
                                  : theme.surface.textSecondary,
                              fontSize: 11,
                              fontWeight: '700',
                            }}
                          >
                            {it.l}
                          </Text>
                        </PressableScale>
                      ))}
                    </View>
                    <TextInput
                      value={instName}
                      onChangeText={setInstName}
                      placeholder="Nombre (Ej. Certificado Plazo Fijo 12M, Fondo RAP/AFP)"
                      placeholderTextColor={theme.surface.textMuted}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.surface.surface2,
                          color: theme.surface.textPrimary,
                          borderColor: theme.surface.border,
                        },
                      ]}
                    />
                    <TextInput
                      value={instBank}
                      onChangeText={setInstBank}
                      placeholder="Institución (Ej. Banco Atlántida, AFP Atlántida)"
                      placeholderTextColor={theme.surface.textMuted}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.surface.surface2,
                          color: theme.surface.textPrimary,
                          borderColor: theme.surface.border,
                        },
                      ]}
                    />
                    <View style={styles.twoCols}>
                      <TextInput
                        value={instCapital}
                        onChangeText={setInstCapital}
                        keyboardType="numeric"
                        placeholder="Capital Invertido"
                        placeholderTextColor={theme.surface.textMuted}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.surface.surface2,
                            color: theme.surface.textPrimary,
                            borderColor: theme.surface.border,
                          },
                        ]}
                      />
                      <TextInput
                        value={instYield}
                        onChangeText={setInstYield}
                        keyboardType="numeric"
                        placeholder="Tasa Rendimiento % Anual"
                        placeholderTextColor={theme.surface.textMuted}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.surface.surface2,
                            color: theme.surface.textPrimary,
                            borderColor: theme.surface.border,
                          },
                        ]}
                      />
                    </View>
                  </>
                )}

                <PressableScale
                  disabled={loading}
                  onPress={handleSaveWealth}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  <Text style={styles.submitBtnText}>Guardar en Portafolio</Text>
                </PressableScale>
              </View>
            )}

            <Text style={[styles.subHeader, { color: theme.surface.textPrimary }]}>
              Instrumentos Financieros (Depósitos a Plazo, Fondos de Pensión e Inversiones)
            </Text>
            {profileInstruments.map((inst) => {
              const annualNetGain =
                inst.invested_capital *
                (inst.annual_yield_rate / 100) *
                (1 - (inst.tax_withholding_rate || 10) / 100);
              return (
                <View
                  key={inst.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.accent.primary, fontSize: 11, fontWeight: '800' }}>
                        {inst.instrument_type.toUpperCase()} • {inst.institution_name}
                      </Text>
                      <Text style={[styles.cardTitleText, { color: theme.surface.textPrimary }]}>
                        {inst.name}
                      </Text>
                      <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                        Rendimiento: {inst.annual_yield_rate}% anual • Ganancia neta anual est.:{' '}
                        {formatMoney(annualNetGain, inst.currency, hideBalances)}
                      </Text>
                    </View>
                    <Text style={[styles.cardMainAmount, { color: theme.surface.success }]}>
                      {formatMoney(inst.current_value, inst.currency, hideBalances)}
                    </Text>
                  </View>
                </View>
              );
            })}

            <Text style={[styles.subHeader, { color: theme.surface.textPrimary }]}>
              Metas y Fondos de Ahorro
            </Text>
            {profileGoals.map((goal) => {
              const pct =
                goal.target_amount > 0
                  ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                  : 0;
              return (
                <View
                  key={goal.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitleText, { color: theme.surface.textPrimary }]}>
                        {goal.name}
                      </Text>
                      <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                        Meta: {formatMoney(goal.target_amount, goal.currency, hideBalances)} ({pct}
                        % completado)
                      </Text>
                    </View>
                    <Text style={[styles.cardMainAmount, { color: theme.accent.primary }]}>
                      {formatMoney(goal.current_amount, goal.currency, hideBalances)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: theme.accent.primary },
                      ]}
                    />
                  </View>
                  {profileAccounts.length > 0 && (
                    <View style={styles.cardBottomRow}>
                      <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                        Aportar desde {profileAccounts[0].name}
                      </Text>
                      <PressableScale
                        onPress={() =>
                          contributeToSavingsGoal({
                            goal_id: goal.id,
                            account_id: profileAccounts[0].id,
                            amount: 500,
                          })
                        }
                        style={[
                          styles.miniActionBtn,
                          { backgroundColor: theme.accent.softBg, borderColor: theme.accent.primary },
                        ]}
                      >
                        <Text style={{ color: theme.accent.primary, fontWeight: '800', fontSize: 12 }}>
                          + Aportar 500
                        </Text>
                      </PressableScale>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ===================================================================
            SECCIÓN 5: PRESUPUESTOS (Diario, Semanal, Quincenal, Mensual) & AGENDA
        =================================================================== */}
        {subTab === 'budgets' && (
          <View style={styles.sectionStack}>
            {showForm && (
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
                ]}
              >
                <View style={styles.twoCols}>
                  <PressableScale
                    onPress={() => setBudgetMode('budget')}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor:
                          budgetMode === 'budget' ? theme.accent.softBg : theme.surface.surface2,
                        borderColor:
                          budgetMode === 'budget' ? theme.accent.primary : theme.surface.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          budgetMode === 'budget'
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      📊 Crear Presupuesto
                    </Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => setBudgetMode('reminder')}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor:
                          budgetMode === 'reminder' ? theme.accent.softBg : theme.surface.surface2,
                        borderColor:
                          budgetMode === 'reminder' ? theme.accent.primary : theme.surface.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          budgetMode === 'reminder'
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      🗓️ Nuevo Recordatorio Agenda
                    </Text>
                  </PressableScale>
                </View>

                {budgetMode === 'budget' ? (
                  <>
                    <TextInput
                      value={budgetName}
                      onChangeText={setBudgetName}
                      placeholder="Nombre (Ej. Presupuesto Quincenal, Gasto Diario)"
                      placeholderTextColor={theme.surface.textMuted}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.surface.surface2,
                          color: theme.surface.textPrimary,
                          borderColor: theme.surface.border,
                        },
                      ]}
                    />
                    <View style={styles.twoCols}>
                      {(
                        [
                          { k: 'daily', l: 'Diario' },
                          { k: 'weekly', l: 'Semanal' },
                          { k: 'biweekly', l: 'Quincenal' },
                          { k: 'monthly', l: 'Mensual' },
                        ] as const
                      ).map((p) => (
                        <PressableScale
                          key={p.k}
                          onPress={() => setBudgetPeriod(p.k)}
                          style={[
                            styles.choiceBtn,
                            {
                              backgroundColor:
                                budgetPeriod === p.k ? theme.accent.softBg : theme.surface.surface2,
                              borderColor:
                                budgetPeriod === p.k ? theme.accent.primary : theme.surface.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                budgetPeriod === p.k
                                  ? theme.accent.primary
                                  : theme.surface.textSecondary,
                              fontWeight: '700',
                              fontSize: 11,
                            }}
                          >
                            {p.l}
                          </Text>
                        </PressableScale>
                      ))}
                    </View>
                    <TextInput
                      value={budgetLimit}
                      onChangeText={setBudgetLimit}
                      keyboardType="numeric"
                      placeholder="Monto Límite del Presupuesto"
                      placeholderTextColor={theme.surface.textMuted}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.surface.surface2,
                          color: theme.surface.textPrimary,
                          borderColor: theme.surface.border,
                        },
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <TextInput
                      value={remTitle}
                      onChangeText={setRemTitle}
                      placeholder="Título del Recordatorio (Ej. Pagar Impuestos SAR, Cobrar Alquiler)"
                      placeholderTextColor={theme.surface.textMuted}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.surface.surface2,
                          color: theme.surface.textPrimary,
                          borderColor: theme.surface.border,
                        },
                      ]}
                    />
                    <View style={styles.twoCols}>
                      <TextInput
                        value={remDate}
                        onChangeText={setRemDate}
                        placeholder="Fecha YYYY-MM-DD"
                        placeholderTextColor={theme.surface.textMuted}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.surface.surface2,
                            color: theme.surface.textPrimary,
                            borderColor: theme.surface.border,
                          },
                        ]}
                      />
                      <TextInput
                        value={remAmount}
                        onChangeText={setRemAmount}
                        keyboardType="numeric"
                        placeholder="Monto Opcional"
                        placeholderTextColor={theme.surface.textMuted}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.surface.surface2,
                            color: theme.surface.textPrimary,
                            borderColor: theme.surface.border,
                          },
                        ]}
                      />
                    </View>
                  </>
                )}

                <PressableScale
                  disabled={loading}
                  onPress={handleSaveBudgetOrReminder}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  <Text style={styles.submitBtnText}>Guardar</Text>
                </PressableScale>
              </View>
            )}

            <Text style={[styles.subHeader, { color: theme.surface.textPrimary }]}>
              Presupuestos Activos (Diarios, Semanales, Quincenales, Mensuales)
            </Text>
            {profileBudgets.map((b) => {
              const ratio =
                b.limit_amount > 0
                  ? Math.min(100, Math.round((totalProfileSpent / b.limit_amount) * 100))
                  : 0;
              const barColor =
                ratio >= 90
                  ? theme.surface.danger
                  : ratio >= 70
                  ? theme.surface.warning
                  : theme.surface.success;

              return (
                <View
                  key={b.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={{ color: theme.accent.primary, fontSize: 11, fontWeight: '800' }}>
                        PRESUPUESTO {b.period_type.toUpperCase()}
                      </Text>
                      <Text style={[styles.cardTitleText, { color: theme.surface.textPrimary }]}>
                        {b.name}
                      </Text>
                    </View>
                    <Text style={[styles.cardMainAmount, { color: barColor }]}>
                      {formatMoney(totalProfileSpent, b.currency, hideBalances)} /{' '}
                      {formatMoney(b.limit_amount, b.currency, hideBalances)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${ratio}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                </View>
              );
            })}

            <Text style={[styles.subHeader, { color: theme.surface.textPrimary }]}>
              Agenda Financiera y Recordatorios
            </Text>
            {profileReminders.map((rem) => (
              <PressableScale
                key={rem.id}
                onPress={() => toggleReminderCompleted(rem.id, rem.is_completed)}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: theme.surface.surface1,
                    borderColor: rem.is_completed ? theme.surface.success : theme.surface.border,
                  },
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cardTitleText,
                        {
                          color: theme.surface.textPrimary,
                          textDecorationLine: rem.is_completed ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {rem.title}
                    </Text>
                    <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                      📅 Fecha: {rem.event_date}
                    </Text>
                  </View>
                  {rem.amount !== null && (
                    <Text style={[styles.cardMainAmount, { color: theme.accent.primary }]}>
                      {formatMoney(rem.amount, defaultCurrency, hideBalances)}
                    </Text>
                  )}
                </View>
              </PressableScale>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 44,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  title: { fontSize: 23, fontWeight: '800' },
  sub: { fontSize: 12 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  newBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 13,
  },
  subTabsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  subTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  sectionStack: {
    gap: 12,
  },
  formCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  submitBtn: {
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyBox: {
    borderRadius: 26,
    padding: 26,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  creditCardVisual: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    gap: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardBankLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  cutoffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardBalancesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMainAmount: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  itemCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  overdueBanner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  payNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  miniDateInput: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
});

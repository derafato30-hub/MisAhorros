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
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Check,
  CreditCard,
  Filter,
  Landmark,
  Plus,
  Tag,
  Wallet,
  X,
} from 'lucide-react-native';
import { BankAccount, useAppStore } from '../../src/store/useAppStore';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { CURRENCIES, CurrencyCode, formatMoney } from '../../src/theme/samsungOneUI';
import { ProfileSwitcherPill } from '../../src/components/ui/ProfileSwitcherPill';
import { PressableScale } from '../../src/components/ui/PressableScale';

type ActiveActionSheet =
  | 'none'
  | 'new_account'
  | 'new_income'
  | 'new_expense'
  | 'new_transfer'
  | 'new_category';

const ACCOUNT_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function AccountsTabScreen() {
  const theme = useSamsungTheme();
  const accounts = useAppStore((s) => s.accounts);
  const creditCards = useAppStore((s) => s.creditCards);
  const categories = useAppStore((s) => s.categories);
  const recentTransactions = useAppStore((s) => s.recentTransactions);
  const financialProfiles = useAppStore((s) => s.financialProfiles);
  const activeProfileType = useAppStore((s) => s.activeProfileType);
  const hideBalances = useAppStore((s) => s.hideBalances);
  const defaultCurrency = useAppStore((s) => s.preferences.default_currency);

  const createAccount = useAppStore((s) => s.createAccount);
  const createCategory = useAppStore((s) => s.createCategory);
  const registerTransaction = useAppStore((s) => s.registerTransaction);
  const transferBetweenAccounts = useAppStore((s) => s.transferBetweenAccounts);

  const activeProfile = useMemo(
    () => financialProfiles.find((p) => p.profile_type === activeProfileType),
    [financialProfiles, activeProfileType]
  );

  const profileAccounts = useMemo(
    () =>
      activeProfile
        ? accounts.filter((a) => a.profile_id === activeProfile.id)
        : accounts,
    [accounts, activeProfile]
  );

  const profileCategories = useMemo(
    () =>
      activeProfile
        ? categories.filter((c) => c.profile_id === activeProfile.id)
        : categories,
    [categories, activeProfile]
  );

  const profileCards = useMemo(
    () =>
      activeProfile
        ? creditCards.filter((c) => c.profile_id === activeProfile.id)
        : creditCards,
    [creditCards, activeProfile]
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string | 'all'>('all');
  const [activeSheet, setActiveSheet] = useState<ActiveActionSheet>('none');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Estado para Nueva Cuenta
  const [accName, setAccName] = useState('');
  const [accBank, setAccBank] = useState('');
  const [accType, setAccType] = useState<BankAccount['account_type']>('checking');
  const [accCurrency, setAccCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [accInitialBalance, setAccInitialBalance] = useState('');
  const [accColor, setAccColor] = useState(ACCOUNT_COLORS[0]);

  // Estado para Ingreso / Gasto
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txAccountId, setTxAccountId] = useState<string>('');
  const [txCardId, setTxCardId] = useState<string>('');
  const [txCategoryId, setTxCategoryId] = useState<string>('');
  const [incomeSubtype, setIncomeSubtype] = useState<'payroll' | 'regular' | 'irregular'>('payroll');
  const [payWithCard, setPayWithCard] = useState(false);

  // Estado para Transferencia
  const [transferSourceId, setTransferSourceId] = useState<string>('');
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRate, setTransferRate] = useState('1.00');
  const [transferNotes, setTransferNotes] = useState('');

  // Estado para Nueva Categoría
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  const [catNature, setCatNature] = useState<'fixed' | 'variable' | 'discretionary'>('variable');

  const filteredTransactions = useMemo(() => {
    const byProfile = activeProfile
      ? recentTransactions.filter((t) => t.profile_id === activeProfile.id)
      : recentTransactions;
    if (selectedAccountId === 'all') return byProfile;
    return byProfile.filter(
      (t) =>
        t.account_id === selectedAccountId || t.target_account_id === selectedAccountId
    );
  }, [recentTransactions, activeProfile, selectedAccountId]);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleCreateAccount = async () => {
    if (!accName.trim()) return;
    setSubmitting(true);
    try {
      await createAccount({
        name: accName.trim(),
        account_type: accType,
        currency: accCurrency,
        initial_balance: parseFloat(accInitialBalance || '0') || 0,
        bank_name: accBank.trim() || undefined,
        color_hex: accColor,
      });
      setAccName('');
      setAccBank('');
      setAccInitialBalance('');
      setActiveSheet('none');
      showToast('¡Cuenta creada exitosamente!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterTransaction = async (type: 'income' | 'expense') => {
    const numericAmount = parseFloat(txAmount);
    if (!numericAmount || numericAmount <= 0) return;

    const chosenAccountId =
      txAccountId || (selectedAccountId !== 'all' ? selectedAccountId : profileAccounts[0]?.id);
    const chosenAcc = profileAccounts.find((a) => a.id === chosenAccountId);

    setSubmitting(true);
    try {
      await registerTransaction({
        account_id: type === 'expense' && payWithCard ? null : chosenAccountId,
        credit_card_id: type === 'expense' && payWithCard ? txCardId || profileCards[0]?.id : null,
        category_id: txCategoryId || null,
        transaction_type: type,
        income_subtype: type === 'income' ? incomeSubtype : null,
        amount: numericAmount,
        currency: chosenAcc?.currency || defaultCurrency,
        description:
          txDescription.trim() ||
          (type === 'income' ? `Ingreso (${incomeSubtype})` : 'Gasto registrado'),
      });
      setTxAmount('');
      setTxDescription('');
      setActiveSheet('none');
      showToast(
        type === 'income' ? '¡Ingreso acreditado en tu cuenta!' : '¡Gasto registrado con éxito!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    const numericAmount = parseFloat(transferAmount);
    const sourceId = transferSourceId || profileAccounts[0]?.id;
    const targetId = transferTargetId || accounts.find((a) => a.id !== sourceId)?.id;
    if (!numericAmount || numericAmount <= 0 || !sourceId || !targetId || sourceId === targetId) {
      return;
    }

    setSubmitting(true);
    try {
      await transferBetweenAccounts({
        source_account_id: sourceId,
        target_account_id: targetId,
        amount: numericAmount,
        exchange_rate: parseFloat(transferRate || '1') || 1,
        description: transferNotes.trim() || 'Transferencia entre cuentas',
      });
      setTransferAmount('');
      setTransferNotes('');
      setActiveSheet('none');
      showToast('¡Transferencia ejecutada atómicamente!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!catName.trim()) return;
    setSubmitting(true);
    try {
      await createCategory({
        name: catName.trim(),
        category_type: catType,
        spending_nature: catNature,
        color_hex: theme.accent.primary,
      });
      setCatName('');
      setActiveSheet('none');
      showToast('¡Categoría personalizada creada!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSwitcherPill />

        <View style={styles.headerBox}>
          <Text style={[styles.title, { color: theme.surface.textPrimary }]}>
            Cuentas, Nómina, Gastos y Transferencias
          </Text>
          <Text style={[styles.sub, { color: theme.surface.textSecondary }]}>
            Toca cualquier cuenta para filtrar su libro mayor de movimientos
          </Text>
        </View>

        {feedbackMsg && (
          <View
            style={[
              styles.toastBanner,
              { backgroundColor: theme.accent.softBg, borderColor: theme.accent.primary },
            ]}
          >
            <Check size={16} color={theme.accent.primary} />
            <Text style={{ color: theme.accent.primary, fontWeight: '700', fontSize: 13 }}>
              {feedbackMsg}
            </Text>
          </View>
        )}

        {/* Botonera de Acciones Principales Fase 2 */}
        <View style={styles.actionButtonsRow}>
          <PressableScale
            onPress={() => {
              setTxAccountId(
                selectedAccountId !== 'all' ? selectedAccountId : profileAccounts[0]?.id || ''
              );
              setActiveSheet(activeSheet === 'new_income' ? 'none' : 'new_income');
            }}
            style={[
              styles.actionBtn,
              {
                backgroundColor:
                  activeSheet === 'new_income'
                    ? 'rgba(16, 185, 129, 0.22)'
                    : theme.surface.surface1,
                borderColor: theme.surface.success,
              },
            ]}
          >
            <ArrowDownLeft size={18} color={theme.surface.success} />
            <Text style={[styles.actionBtnText, { color: theme.surface.textPrimary }]}>
              + Ingreso / Nómina
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              setTxAccountId(
                selectedAccountId !== 'all' ? selectedAccountId : profileAccounts[0]?.id || ''
              );
              setActiveSheet(activeSheet === 'new_expense' ? 'none' : 'new_expense');
            }}
            style={[
              styles.actionBtn,
              {
                backgroundColor:
                  activeSheet === 'new_expense'
                    ? 'rgba(239, 68, 68, 0.22)'
                    : theme.surface.surface1,
                borderColor: theme.surface.danger,
              },
            ]}
          >
            <ArrowUpRight size={18} color={theme.surface.danger} />
            <Text style={[styles.actionBtnText, { color: theme.surface.textPrimary }]}>
              - Registrar Gasto
            </Text>
          </PressableScale>
        </View>

        <View style={styles.actionButtonsRow}>
          <PressableScale
            onPress={() => {
              setTransferSourceId(profileAccounts[0]?.id || '');
              setTransferTargetId(accounts[1]?.id || accounts[0]?.id || '');
              setActiveSheet(activeSheet === 'new_transfer' ? 'none' : 'new_transfer');
            }}
            style={[
              styles.actionBtn,
              { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
            ]}
          >
            <ArrowLeftRight size={17} color={theme.accent.primary} />
            <Text style={[styles.actionBtnText, { color: theme.surface.textPrimary }]}>
              Transferir
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => setActiveSheet(activeSheet === 'new_account' ? 'none' : 'new_account')}
            style={[
              styles.actionBtn,
              { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
            ]}
          >
            <Landmark size={17} color={theme.accent.primary} />
            <Text style={[styles.actionBtnText, { color: theme.surface.textPrimary }]}>
              + Nueva Cuenta
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() =>
              setActiveSheet(activeSheet === 'new_category' ? 'none' : 'new_category')
            }
            style={[
              styles.actionBtn,
              { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
            ]}
          >
            <Tag size={17} color={theme.accent.primary} />
            <Text style={[styles.actionBtnText, { color: theme.surface.textPrimary }]}>
              + Categoría
            </Text>
          </PressableScale>
        </View>

        {/* PANEL INTERACTIVO DESPLEGABLE SEGÚN LA ACCIÓN SELECCIONADA */}
        {activeSheet !== 'none' && (
          <View
            style={[
              styles.sheetCard,
              { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.surface.textPrimary }]}>
                {activeSheet === 'new_account' && 'Crear Nueva Cuenta (Efectivo / Banco)'}
                {activeSheet === 'new_income' &&
                  'Registrar Ingreso (Nómina, Regular o Irregular)'}
                {activeSheet === 'new_expense' && 'Registrar Gasto Detallado'}
                {activeSheet === 'new_transfer' &&
                  'Transferencia entre Cuentas (o hacia Mi Negocio)'}
                {activeSheet === 'new_category' && 'Nueva Categoría Personalizada'}
              </Text>
              <PressableScale onPress={() => setActiveSheet('none')}>
                <X size={20} color={theme.surface.textSecondary} />
              </PressableScale>
            </View>

            {/* FORMULARIO: NUEVA CUENTA */}
            {activeSheet === 'new_account' && (
              <View style={styles.formStack}>
                <TextInput
                  value={accName}
                  onChangeText={setAccName}
                  placeholder="Nombre (Ej. Banco BAC Planilla, Efectivo, Banco Y 2)"
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
                  value={accBank}
                  onChangeText={setAccBank}
                  placeholder="Institución Bancaria (Opcional: BAC, Atlántida, Ficohsa...)"
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

                <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                  Tipo de Cuenta
                </Text>
                <View style={styles.pillsWrap}>
                  {(
                    [
                      { k: 'cash', l: 'Efectivo' },
                      { k: 'payroll', l: 'Nómina / Planilla' },
                      { k: 'savings', l: 'Ahorro Bancario' },
                      { k: 'checking', l: 'Cheques / Corriente' },
                      { k: 'digital_wallet', l: 'Billetera Digital' },
                    ] as const
                  ).map((item) => (
                    <PressableScale
                      key={item.k}
                      onPress={() => setAccType(item.k)}
                      style={[
                        styles.choicePill,
                        {
                          backgroundColor:
                            accType === item.k ? theme.accent.softBg : theme.surface.surface2,
                          borderColor:
                            accType === item.k ? theme.accent.primary : theme.surface.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            accType === item.k
                              ? theme.accent.primary
                              : theme.surface.textSecondary,
                          fontWeight: '700',
                          fontSize: 12,
                        }}
                      >
                        {item.l}
                      </Text>
                    </PressableScale>
                  ))}
                </View>

                <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                  Moneda y Saldo Inicial
                </Text>
                <View style={styles.pillsWrap}>
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                    <PressableScale
                      key={c}
                      onPress={() => setAccCurrency(c)}
                      style={[
                        styles.choicePill,
                        {
                          backgroundColor:
                            accCurrency === c ? theme.accent.softBg : theme.surface.surface2,
                          borderColor:
                            accCurrency === c ? theme.accent.primary : theme.surface.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            accCurrency === c
                              ? theme.accent.primary
                              : theme.surface.textSecondary,
                          fontWeight: '700',
                          fontSize: 12,
                        }}
                      >
                        {CURRENCIES[c].symbol} {c}
                      </Text>
                    </PressableScale>
                  ))}
                </View>

                <TextInput
                  value={accInitialBalance}
                  onChangeText={setAccInitialBalance}
                  keyboardType="numeric"
                  placeholder="Saldo Inicial (Ej. 15000.00)"
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

                <View style={styles.colorRow}>
                  {ACCOUNT_COLORS.map((hex) => (
                    <PressableScale
                      key={hex}
                      onPress={() => setAccColor(hex)}
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor: hex,
                          borderWidth: accColor === hex ? 3 : 0,
                          borderColor: '#FFFFFF',
                        },
                      ]}
                    />
                  ))}
                </View>

                <PressableScale
                  disabled={submitting}
                  onPress={handleCreateAccount}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#0B0F19" />
                  ) : (
                    <Text style={styles.submitBtnText}>Guardar Cuenta</Text>
                  )}
                </PressableScale>
              </View>
            )}

            {/* FORMULARIO: INGRESO O GASTO */}
            {(activeSheet === 'new_income' || activeSheet === 'new_expense') && (
              <View style={styles.formStack}>
                {activeSheet === 'new_income' && (
                  <>
                    <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                      Clasificación del Ingreso
                    </Text>
                    <View style={styles.pillsWrap}>
                      {(
                        [
                          { k: 'payroll', l: '💼 Por Nómina / Salario' },
                          { k: 'regular', l: '🔄 Ingreso Regular' },
                          { k: 'irregular', l: '⚡ Ingreso Irregular / Extra' },
                        ] as const
                      ).map((sub) => (
                        <PressableScale
                          key={sub.k}
                          onPress={() => setIncomeSubtype(sub.k)}
                          style={[
                            styles.choicePill,
                            {
                              backgroundColor:
                                incomeSubtype === sub.k
                                  ? theme.accent.softBg
                                  : theme.surface.surface2,
                              borderColor:
                                incomeSubtype === sub.k
                                  ? theme.accent.primary
                                  : theme.surface.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                incomeSubtype === sub.k
                                  ? theme.accent.primary
                                  : theme.surface.textSecondary,
                              fontWeight: '700',
                              fontSize: 12,
                            }}
                          >
                            {sub.l}
                          </Text>
                        </PressableScale>
                      ))}
                    </View>
                  </>
                )}

                {activeSheet === 'new_expense' && profileCards.length > 0 && (
                  <View style={styles.pillsWrap}>
                    <PressableScale
                      onPress={() => setPayWithCard(false)}
                      style={[
                        styles.choicePill,
                        {
                          backgroundColor: !payWithCard
                            ? theme.accent.softBg
                            : theme.surface.surface2,
                          borderColor: !payWithCard
                            ? theme.accent.primary
                            : theme.surface.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: !payWithCard
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                          fontWeight: '700',
                          fontSize: 12,
                        }}
                      >
                        Salir de Cuenta / Efectivo
                      </Text>
                    </PressableScale>
                    <PressableScale
                      onPress={() => setPayWithCard(true)}
                      style={[
                        styles.choicePill,
                        {
                          backgroundColor: payWithCard
                            ? theme.accent.softBg
                            : theme.surface.surface2,
                          borderColor: payWithCard
                            ? theme.accent.primary
                            : theme.surface.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: payWithCard
                            ? theme.accent.primary
                            : theme.surface.textSecondary,
                          fontWeight: '700',
                          fontSize: 12,
                        }}
                      >
                        Pagar con Tarjeta de Crédito
                      </Text>
                    </PressableScale>
                  </View>
                )}

                <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                  {activeSheet === 'new_income'
                    ? '¿A qué cuenta ingresa el dinero?'
                    : payWithCard
                    ? 'Selecciona la Tarjeta de Crédito'
                    : '¿De qué cuenta salió el dinero?'}
                </Text>

                <View style={styles.pillsWrap}>
                  {(!payWithCard || activeSheet === 'new_income') &&
                    profileAccounts.map((acc) => {
                      const selected =
                        (txAccountId || profileAccounts[0]?.id) === acc.id;
                      return (
                        <PressableScale
                          key={acc.id}
                          onPress={() => setTxAccountId(acc.id)}
                          style={[
                            styles.choicePill,
                            {
                              backgroundColor: selected
                                ? theme.accent.softBg
                                : theme.surface.surface2,
                              borderColor: selected
                                ? theme.accent.primary
                                : theme.surface.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: selected
                                ? theme.accent.primary
                                : theme.surface.textSecondary,
                              fontWeight: '700',
                              fontSize: 12,
                            }}
                          >
                            {acc.name} ({acc.currency})
                          </Text>
                        </PressableScale>
                      );
                    })}

                  {activeSheet === 'new_expense' &&
                    payWithCard &&
                    profileCards.map((card) => {
                      const selected = (txCardId || profileCards[0]?.id) === card.id;
                      return (
                        <PressableScale
                          key={card.id}
                          onPress={() => setTxCardId(card.id)}
                          style={[
                            styles.choicePill,
                            {
                              backgroundColor: selected
                                ? theme.accent.softBg
                                : theme.surface.surface2,
                              borderColor: selected
                                ? theme.accent.primary
                                : theme.surface.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: selected
                                ? theme.accent.primary
                                : theme.surface.textSecondary,
                              fontWeight: '700',
                              fontSize: 12,
                            }}
                          >
                            💳 {card.card_name} ({card.currency})
                          </Text>
                        </PressableScale>
                      );
                    })}
                </View>

                <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                  Categoría
                </Text>
                <View style={styles.pillsWrap}>
                  {profileCategories
                    .filter((c) =>
                      activeSheet === 'new_income'
                        ? c.category_type === 'income'
                        : c.category_type === 'expense'
                    )
                    .map((cat) => {
                      const selected = txCategoryId === cat.id;
                      return (
                        <PressableScale
                          key={cat.id}
                          onPress={() => setTxCategoryId(cat.id)}
                          style={[
                            styles.choicePill,
                            {
                              backgroundColor: selected
                                ? theme.accent.softBg
                                : theme.surface.surface2,
                              borderColor: selected
                                ? theme.accent.primary
                                : theme.surface.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: selected
                                ? theme.accent.primary
                                : theme.surface.textSecondary,
                              fontWeight: '700',
                              fontSize: 12,
                            }}
                          >
                            {cat.name}
                          </Text>
                        </PressableScale>
                      );
                    })}
                </View>

                <TextInput
                  value={txAmount}
                  onChangeText={setTxAmount}
                  keyboardType="numeric"
                  placeholder="Monto (Ej. 1250.00)"
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
                  value={txDescription}
                  onChangeText={setTxDescription}
                  placeholder="Motivo o descripción del movimiento (Ej. Quincena Octubre, Gasolina...)"
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

                <PressableScale
                  disabled={submitting}
                  onPress={() =>
                    handleRegisterTransaction(
                      activeSheet === 'new_income' ? 'income' : 'expense'
                    )
                  }
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        activeSheet === 'new_income'
                          ? theme.surface.success
                          : theme.surface.danger,
                    },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#0B0F19" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {activeSheet === 'new_income'
                        ? 'Confirmar Ingreso'
                        : 'Confirmar Gasto'}
                    </Text>
                  )}
                </PressableScale>
              </View>
            )}

            {/* FORMULARIO: TRANSFERENCIA ENTRE CUENTAS */}
            {activeSheet === 'new_transfer' && (
              <View style={styles.formStack}>
                <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                  Cuenta Origen (Sale de)
                </Text>
                <View style={styles.pillsWrap}>
                  {accounts.map((acc) => {
                    const selected = transferSourceId === acc.id;
                    return (
                      <PressableScale
                        key={`src-${acc.id}`}
                        onPress={() => setTransferSourceId(acc.id)}
                        style={[
                          styles.choicePill,
                          {
                            backgroundColor: selected
                              ? theme.accent.softBg
                              : theme.surface.surface2,
                            borderColor: selected
                              ? theme.accent.primary
                              : theme.surface.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected
                              ? theme.accent.primary
                              : theme.surface.textSecondary,
                            fontWeight: '700',
                            fontSize: 12,
                          }}
                        >
                          {acc.name} ({acc.currency})
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>

                <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                  Cuenta Destino (Entra a — incluye cuentas de Personal y Mi Negocio)
                </Text>
                <View style={styles.pillsWrap}>
                  {accounts
                    .filter((a) => a.id !== transferSourceId)
                    .map((acc) => {
                      const selected = transferTargetId === acc.id;
                      return (
                        <PressableScale
                          key={`dst-${acc.id}`}
                          onPress={() => setTransferTargetId(acc.id)}
                          style={[
                            styles.choicePill,
                            {
                              backgroundColor: selected
                                ? theme.accent.softBg
                                : theme.surface.surface2,
                              borderColor: selected
                                ? theme.accent.primary
                                : theme.surface.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: selected
                                ? theme.accent.primary
                                : theme.surface.textSecondary,
                              fontWeight: '700',
                              fontSize: 12,
                            }}
                          >
                            {acc.name} ({acc.currency})
                          </Text>
                        </PressableScale>
                      );
                    })}
                </View>

                <TextInput
                  value={transferAmount}
                  onChangeText={setTransferAmount}
                  keyboardType="numeric"
                  placeholder="Monto a transferir"
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
                  value={transferRate}
                  onChangeText={setTransferRate}
                  keyboardType="numeric"
                  placeholder="Tasa de conversión (1.00 si es misma moneda)"
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
                  value={transferNotes}
                  onChangeText={setTransferNotes}
                  placeholder="Motivo (Ej. Aporte a caja negocio, Ahorro...)"
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

                <PressableScale
                  disabled={submitting}
                  onPress={handleTransfer}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  <Text style={styles.submitBtnText}>Ejecutar Transferencia</Text>
                </PressableScale>
              </View>
            )}

            {/* FORMULARIO: NUEVA CATEGORÍA */}
            {activeSheet === 'new_category' && (
              <View style={styles.formStack}>
                <TextInput
                  value={catName}
                  onChangeText={setCatName}
                  placeholder="Nombre de la Categoría (Ej. Mascotas, Proveedor Café...)"
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

                <View style={styles.pillsWrap}>
                  {(
                    [
                      { k: 'expense', l: 'Categoría de Gasto' },
                      { k: 'income', l: 'Categoría de Ingreso' },
                    ] as const
                  ).map((item) => (
                    <PressableScale
                      key={item.k}
                      onPress={() => setCatType(item.k)}
                      style={[
                        styles.choicePill,
                        {
                          backgroundColor:
                            catType === item.k ? theme.accent.softBg : theme.surface.surface2,
                          borderColor:
                            catType === item.k ? theme.accent.primary : theme.surface.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            catType === item.k
                              ? theme.accent.primary
                              : theme.surface.textSecondary,
                          fontWeight: '700',
                          fontSize: 12,
                        }}
                      >
                        {item.l}
                      </Text>
                    </PressableScale>
                  ))}
                </View>

                <PressableScale
                  disabled={submitting}
                  onPress={handleCreateCategory}
                  style={[styles.submitBtn, { backgroundColor: theme.accent.primary }]}
                >
                  <Text style={styles.submitBtnText}>Crear Categoría</Text>
                </PressableScale>
              </View>
            )}
          </View>
        )}

        {/* LISTA DE CUENTAS (Permite seleccionar una cuenta para ver sus movimientos) */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.surface.textPrimary }]}>
            Mis Cuentas ({profileAccounts.length})
          </Text>
          {selectedAccountId !== 'all' && (
            <PressableScale onPress={() => setSelectedAccountId('all')}>
              <Text style={{ color: theme.accent.primary, fontWeight: '700', fontSize: 12 }}>
                Ver todas las cuentas
              </Text>
            </PressableScale>
          )}
        </View>

        <View style={styles.accountsList}>
          {profileAccounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <PressableScale
                key={acc.id}
                onPress={() =>
                  setSelectedAccountId(isSelected ? 'all' : acc.id)
                }
                style={[
                  styles.accCard,
                  {
                    backgroundColor: theme.surface.surface1,
                    borderColor: isSelected ? theme.accent.primary : theme.surface.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.accRow}>
                  <View
                    style={[
                      styles.accIconBox,
                      { backgroundColor: `${acc.color_hex || theme.accent.primary}22` },
                    ]}
                  >
                    <Wallet size={20} color={acc.color_hex || theme.accent.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accName, { color: theme.surface.textPrimary }]}>
                      {acc.name}
                    </Text>
                    <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                      {acc.bank_name ? `${acc.bank_name} • ` : ''}
                      {acc.account_type.toUpperCase()} • {acc.currency}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.accBalance, { color: theme.surface.textPrimary }]}>
                      {formatMoney(acc.current_balance, acc.currency, hideBalances)}
                    </Text>
                    <Text style={{ color: theme.accent.primary, fontSize: 11, fontWeight: '700' }}>
                      {isSelected ? 'Filtrando movs.' : 'Ver movimientos'}
                    </Text>
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>

        {/* HISTORIAL Y REGISTRO DE MOVIMIENTOS DE LA CUENTA SELECCIONADA */}
        <View style={styles.sectionRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Filter size={16} color={theme.accent.primary} />
            <Text style={[styles.sectionTitle, { color: theme.surface.textPrimary }]}>
              {selectedAccountId === 'all'
                ? 'Todos los Movimientos Recientes'
                : `Movimientos de: ${
                    profileAccounts.find((a) => a.id === selectedAccountId)?.name || 'Cuenta'
                  }`}
            </Text>
          </View>
          <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
            {filteredTransactions.length} registros
          </Text>
        </View>

        {filteredTransactions.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
            ]}
          >
            <Banknote size={28} color={theme.surface.textMuted} />
            <Text style={{ color: theme.surface.textSecondary, fontSize: 13, textAlign: 'center' }}>
              Aún no hay movimientos registrados en esta vista. Usa los botones superiores para registrar tu primer ingreso por nómina, gasto o transferencia.
            </Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {filteredTransactions.map((tx) => {
              const isIncome = tx.transaction_type === 'income';
              const isTransfer = tx.transaction_type === 'transfer';
              const accObj = accounts.find((a) => a.id === tx.account_id);
              const catObj = categories.find((c) => c.id === tx.category_id);

              return (
                <View
                  key={tx.id}
                  style={[
                    styles.txItem,
                    {
                      backgroundColor: theme.surface.surface1,
                      borderColor: theme.surface.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.txIconCircle,
                      {
                        backgroundColor: isIncome
                          ? 'rgba(16, 185, 129, 0.14)'
                          : isTransfer
                          ? 'rgba(59, 130, 246, 0.14)'
                          : 'rgba(239, 68, 68, 0.14)',
                      },
                    ]}
                  >
                    {isIncome ? (
                      <ArrowDownLeft size={18} color={theme.surface.success} />
                    ) : isTransfer ? (
                      <ArrowLeftRight size={18} color={theme.accent.primary} />
                    ) : (
                      <ArrowUpRight size={18} color={theme.surface.danger} />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txDesc, { color: theme.surface.textPrimary }]}>
                      {tx.description}
                    </Text>
                    <Text style={{ color: theme.surface.textSecondary, fontSize: 11 }}>
                      {accObj?.name || 'Tarjeta de Crédito'}
                      {catObj ? ` • ${catObj.name}` : ''}
                      {tx.income_subtype ? ` • ${tx.income_subtype.toUpperCase()}` : ''}
                      {' • '}
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.txAmount,
                      {
                        color: isIncome
                          ? theme.surface.success
                          : isTransfer
                          ? theme.accent.primary
                          : theme.surface.danger,
                      },
                    ]}
                  >
                    {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                    {formatMoney(tx.amount, tx.currency, hideBalances)}
                  </Text>
                </View>
              );
            })}
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
    paddingBottom: 42,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  headerBox: { gap: 4, marginTop: 4 },
  title: { fontSize: 23, fontWeight: '800' },
  sub: { fontSize: 13 },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sheetCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1.5,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  formStack: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  input: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choicePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
  },
  submitBtn: {
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  accountsList: {
    gap: 10,
  },
  accCard: {
    borderRadius: 24,
    padding: 16,
  },
  accRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accName: {
    fontSize: 15,
    fontWeight: '800',
  },
  accBalance: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  txList: {
    gap: 8,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '700',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});

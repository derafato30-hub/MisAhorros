import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  AccentColorKey,
  CurrencyCode,
  FontFamilyKey,
  ProfileType,
  ThemeMode,
} from '../theme/samsungOneUI';

export interface UserProfilePreferences {
  id: string;
  email: string;
  full_name: string;
  theme_mode: ThemeMode;
  accent_color: AccentColorKey;
  font_family: FontFamilyKey;
  default_currency: CurrencyCode;
  is_salaried: boolean;
  has_business: boolean;
  hide_balances_default: boolean;
  onboarding_completed: boolean;
}

export interface FinancialProfile {
  id: string;
  user_id: string;
  profile_type: ProfileType;
  display_name: string;
  base_currency: CurrencyCode;
  tax_id: string | null;
  is_active: boolean;
}

export interface BankAccount {
  id: string;
  profile_id: string;
  name: string;
  account_type: 'cash' | 'checking' | 'savings' | 'payroll' | 'digital_wallet';
  currency: CurrencyCode;
  current_balance: number;
  bank_name: string | null;
  color_hex: string;
  icon_name: string;
  include_in_total: boolean;
}

export interface CategoryItem {
  id: string;
  profile_id: string;
  name: string;
  category_type: 'income' | 'expense';
  spending_nature: 'fixed' | 'variable' | 'discretionary';
  color_hex: string;
  icon_name: string;
}

export interface TransactionItem {
  id: string;
  profile_id: string;
  account_id: string | null;
  credit_card_id: string | null;
  target_account_id: string | null;
  category_id: string | null;
  transaction_type:
    | 'income'
    | 'expense'
    | 'transfer'
    | 'card_payment'
    | 'loan_payment'
    | 'loan_disbursement'
    | 'savings_contribution';
  income_subtype: 'payroll' | 'regular' | 'irregular' | null;
  amount: number;
  currency: CurrencyCode;
  exchange_rate: number;
  target_amount: number | null;
  late_fee_applied: number;
  description: string;
  transaction_date: string;
  created_by_ai: boolean;
}

export interface CreditCardItem {
  id: string;
  profile_id: string;
  card_name: string;
  bank_name: string;
  network: 'visa' | 'mastercard' | 'amex' | 'other';
  last4_digits: string;
  currency: CurrencyCode;
  credit_limit: number;
  statement_balance: number;
  unbilled_balance: number;
  minimum_payment: number;
  closing_day: number;
  due_day: number;
  interest_rate_annual: number;
  default_interest_rate: number;
  color_theme: string;
}

export interface PayableSubscriptionItem {
  id: string;
  profile_id: string;
  category_id: string | null;
  preferred_account_id: string | null;
  preferred_card_id: string | null;
  title: string;
  payable_type: 'subscription' | 'fixed_expense' | 'payable_debt';
  amount: number;
  currency: CurrencyCode;
  frequency: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  next_due_date: string;
  current_installment: number;
  total_installments: number | null;
  late_interest_rate: number;
  late_fixed_fee: number;
  remind_days_before: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  last_paid_at: string | null;
  notes: string | null;
}

export interface LoanItem {
  id: string;
  profile_id: string;
  loan_direction: 'received' | 'granted';
  counterparty_name: string;
  principal_amount: number;
  remaining_balance: number;
  currency: CurrencyCode;
  annual_interest_rate: number;
  late_interest_rate: number;
  term_months: number;
  paid_installments: number;
  installment_amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  start_date: string;
  next_payment_date: string;
  linked_account_id: string | null;
  status: 'active' | 'paid_off' | 'defaulted';
  notes: string | null;
}

export interface FinancialInstrumentItem {
  id: string;
  profile_id: string;
  instrument_type:
    | 'term_deposit'
    | 'pension_fund'
    | 'investment_fund'
    | 'stocks_etf'
    | 'crypto'
    | 'real_estate';
  institution_name: string;
  name: string;
  currency: CurrencyCode;
  invested_capital: number;
  current_value: number;
  annual_yield_rate: number;
  tax_withholding_rate: number;
  start_date: string;
  maturity_date: string | null;
  auto_renew: boolean;
  notes: string | null;
}

export interface SavingsGoalItem {
  id: string;
  profile_id: string;
  linked_account_id: string | null;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: CurrencyCode;
  target_date: string | null;
  color_hex: string;
  icon_name: string;
}

export interface BudgetItem {
  id: string;
  profile_id: string;
  category_id: string | null;
  name: string;
  period_type: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  limit_amount: number;
  currency: CurrencyCode;
  alert_threshold_percent: number;
  is_active: boolean;
}

export interface AgendaReminderItem {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string;
  reminder_type:
    | 'payable'
    | 'card_cutoff'
    | 'card_due'
    | 'loan'
    | 'payroll'
    | 'cdp_maturity'
    | 'custom';
  amount: number | null;
  is_completed: boolean;
}

export interface AiChatMessageItem {
  id: string;
  profile_id: string;
  sender: 'user' | 'assistant';
  message_text: string;
  action_payload: any;
  created_at: string;
}

interface AppState {
  session: Session | null;
  user: User | null;
  isLoadingAuth: boolean;
  preferences: UserProfilePreferences;
  financialProfiles: FinancialProfile[];
  activeProfileType: ProfileType;
  hideBalances: boolean;

  accounts: BankAccount[];
  categories: CategoryItem[];
  recentTransactions: TransactionItem[];
  creditCards: CreditCardItem[];
  payables: PayableSubscriptionItem[];
  loans: LoanItem[];
  instruments: FinancialInstrumentItem[];
  savingsGoals: SavingsGoalItem[];
  budgets: BudgetItem[];
  reminders: AgendaReminderItem[];
  chatMessages: AiChatMessageItem[];

  setSession: (session: Session | null) => void;
  setActiveProfileType: (type: ProfileType) => void;
  toggleHideBalances: () => void;
  updatePreferences: (partial: Partial<UserProfilePreferences>) => Promise<void>;
  loadUserWorkspace: () => Promise<void>;
  getActiveProfileId: () => string | null;

  // Acciones Fase 2: Cuentas, Categorías, Ingresos, Gastos, Transferencias
  createAccount: (payload: {
    name: string;
    account_type: BankAccount['account_type'];
    currency: CurrencyCode;
    initial_balance: number;
    bank_name?: string;
    color_hex: string;
  }) => Promise<void>;
  createCategory: (payload: {
    name: string;
    category_type: 'income' | 'expense';
    spending_nature?: 'fixed' | 'variable' | 'discretionary';
    color_hex: string;
  }) => Promise<void>;
  registerTransaction: (payload: {
    account_id?: string | null;
    credit_card_id?: string | null;
    category_id?: string | null;
    transaction_type: 'income' | 'expense';
    income_subtype?: 'payroll' | 'regular' | 'irregular' | null;
    amount: number;
    currency: CurrencyCode;
    description: string;
    transaction_date?: string;
    created_by_ai?: boolean;
  }) => Promise<void>;
  transferBetweenAccounts: (payload: {
    source_account_id: string;
    target_account_id: string;
    amount: number;
    exchange_rate: number;
    description: string;
  }) => Promise<void>;

  // Acciones Fase 3: Tarjetas de Crédito, Cuentas por Pagar/Deudas, Préstamos
  createCreditCard: (payload: {
    card_name: string;
    bank_name: string;
    network: CreditCardItem['network'];
    last4_digits: string;
    currency: CurrencyCode;
    credit_limit: number;
    statement_balance: number;
    unbilled_balance: number;
    closing_day: number;
    due_day: number;
    interest_rate_annual: number;
  }) => Promise<void>;
  payCreditCard: (payload: {
    source_account_id: string;
    credit_card_id: string;
    amount: number;
    exchange_rate?: number;
    description?: string;
  }) => Promise<void>;
  createPayable: (payload: {
    title: string;
    payable_type: PayableSubscriptionItem['payable_type'];
    amount: number;
    currency: CurrencyCode;
    frequency: PayableSubscriptionItem['frequency'];
    next_due_date: string;
    current_installment?: number;
    total_installments?: number | null;
    late_interest_rate?: number;
    late_fixed_fee?: number;
    remind_days_before?: number;
  }) => Promise<void>;
  markPayableAsPaid: (payload: {
    payable_id: string;
    account_id: string;
    paid_date: string;
    late_fee_applied?: number;
  }) => Promise<void>;
  createLoan: (payload: {
    loan_direction: 'received' | 'granted';
    counterparty_name: string;
    principal_amount: number;
    currency: CurrencyCode;
    annual_interest_rate: number;
    late_interest_rate?: number;
    term_months: number;
    installment_amount: number;
    frequency: LoanItem['frequency'];
    next_payment_date: string;
    disburse_or_deposit_account_id?: string | null;
  }) => Promise<void>;
  registerLoanPayment: (payload: {
    loan_id: string;
    account_id: string;
    amount: number;
  }) => Promise<void>;

  // Acciones Fase 4: Presupuestos, Metas de Ahorro, Instrumentos y Agenda
  createBudget: (payload: {
    name: string;
    period_type: BudgetItem['period_type'];
    limit_amount: number;
    currency: CurrencyCode;
    category_id?: string | null;
  }) => Promise<void>;
  createSavingsGoal: (payload: {
    name: string;
    target_amount: number;
    current_amount: number;
    currency: CurrencyCode;
    target_date?: string | null;
    color_hex: string;
  }) => Promise<void>;
  contributeToSavingsGoal: (payload: {
    goal_id: string;
    account_id: string;
    amount: number;
  }) => Promise<void>;
  createFinancialInstrument: (payload: {
    instrument_type: FinancialInstrumentItem['instrument_type'];
    institution_name: string;
    name: string;
    currency: CurrencyCode;
    invested_capital: number;
    current_value: number;
    annual_yield_rate: number;
    tax_withholding_rate?: number;
    maturity_date?: string | null;
  }) => Promise<void>;
  createReminder: (payload: {
    title: string;
    description?: string;
    event_date: string;
    reminder_type: AgendaReminderItem['reminder_type'];
    amount?: number | null;
  }) => Promise<void>;
  toggleReminderCompleted: (reminder_id: string, currentStatus: boolean) => Promise<void>;

  // Acciones Fase 6: Chatbot IA
  addChatMessage: (payload: {
    sender: 'user' | 'assistant';
    message_text: string;
    action_payload?: any;
  }) => Promise<void>;

  signOut: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserProfilePreferences = {
  id: '',
  email: '',
  full_name: 'Usuario',
  theme_mode: 'dark',
  accent_color: 'emerald',
  font_family: 'jakarta',
  default_currency: 'HNL',
  is_salaried: true,
  has_business: true,
  hide_balances_default: false,
  onboarding_completed: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  session: null,
  user: null,
  isLoadingAuth: true,
  preferences: DEFAULT_PREFERENCES,
  financialProfiles: [],
  activeProfileType: 'personal',
  hideBalances: false,
  accounts: [],
  categories: [],
  recentTransactions: [],
  creditCards: [],
  payables: [],
  loans: [],
  instruments: [],
  savingsGoals: [],
  budgets: [],
  reminders: [],
  chatMessages: [],

  setSession: (session) => {
    set({ session, user: session?.user ?? null, isLoadingAuth: false });
    if (session?.user) {
      get().loadUserWorkspace();
    }
  },

  setActiveProfileType: (type) => {
    set({ activeProfileType: type });
  },

  toggleHideBalances: () => {
    set((state) => ({ hideBalances: !state.hideBalances }));
  },

  getActiveProfileId: () => {
    const state = get();
    const found = state.financialProfiles.find(
      (p) => p.profile_type === state.activeProfileType
    );
    return found?.id || state.financialProfiles[0]?.id || null;
  },

  updatePreferences: async (partial) => {
    const current = get().preferences;
    const updated = { ...current, ...partial };
    set({
      preferences: updated,
      hideBalances:
        partial.hide_balances_default !== undefined
          ? partial.hide_balances_default
          : get().hideBalances,
    });

    const userId = get().user?.id;
    if (!userId) return;

    await supabase
      .from('users_profiles')
      .update({
        full_name: updated.full_name,
        theme_mode: updated.theme_mode,
        accent_color: updated.accent_color,
        font_family: updated.font_family,
        default_currency: updated.default_currency,
        is_salaried: updated.is_salaried,
        has_business: updated.has_business,
        hide_balances_default: updated.hide_balances_default,
        onboarding_completed: updated.onboarding_completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  },

  loadUserWorkspace: async () => {
    const userId = get().user?.id;
    if (!userId) return;

    const [
      profileRes,
      finProfilesRes,
      accountsRes,
      categoriesRes,
      txRes,
      cardsRes,
      payablesRes,
      loansRes,
      instrumentsRes,
      goalsRes,
      budgetsRes,
      remindersRes,
      chatRes,
    ] = await Promise.all([
      supabase.from('users_profiles').select('*').eq('id', userId).single(),
      supabase.from('financial_profiles').select('*').eq('user_id', userId),
      supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true }),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(100),
      supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('payables_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('next_due_date', { ascending: true }),
      supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('next_payment_date', { ascending: true }),
      supabase
        .from('financial_instruments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('agenda_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true }),
      supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(60),
    ]);

    if (profileRes.data) {
      set({
        preferences: profileRes.data as UserProfilePreferences,
        hideBalances: Boolean(profileRes.data.hide_balances_default),
      });
    }

    if (finProfilesRes.data) {
      set({ financialProfiles: finProfilesRes.data as FinancialProfile[] });
    }

    if (accountsRes.data) {
      set({
        accounts: accountsRes.data.map((a) => ({
          ...a,
          current_balance: Number(a.current_balance || 0),
        })) as BankAccount[],
      });
    }

    if (categoriesRes.data) {
      set({ categories: categoriesRes.data as CategoryItem[] });
    }

    if (txRes.data) {
      set({
        recentTransactions: txRes.data.map((t) => ({
          ...t,
          amount: Number(t.amount || 0),
          exchange_rate: Number(t.exchange_rate || 1),
          late_fee_applied: Number(t.late_fee_applied || 0),
        })) as TransactionItem[],
      });
    }

    if (cardsRes.data) {
      set({
        creditCards: cardsRes.data.map((c) => ({
          ...c,
          credit_limit: Number(c.credit_limit || 0),
          statement_balance: Number(c.statement_balance || 0),
          unbilled_balance: Number(c.unbilled_balance || 0),
          minimum_payment: Number(c.minimum_payment || 0),
          interest_rate_annual: Number(c.interest_rate_annual || 0),
          default_interest_rate: Number(c.default_interest_rate || 0),
        })) as CreditCardItem[],
      });
    }

    if (payablesRes.data) {
      set({
        payables: payablesRes.data.map((p) => ({
          ...p,
          amount: Number(p.amount || 0),
          late_interest_rate: Number(p.late_interest_rate || 0),
          late_fixed_fee: Number(p.late_fixed_fee || 0),
        })) as PayableSubscriptionItem[],
      });
    }

    if (loansRes.data) {
      set({
        loans: loansRes.data.map((l) => ({
          ...l,
          principal_amount: Number(l.principal_amount || 0),
          remaining_balance: Number(l.remaining_balance || 0),
          annual_interest_rate: Number(l.annual_interest_rate || 0),
          late_interest_rate: Number(l.late_interest_rate || 0),
          installment_amount: Number(l.installment_amount || 0),
        })) as LoanItem[],
      });
    }

    if (instrumentsRes.data) {
      set({
        instruments: instrumentsRes.data.map((i) => ({
          ...i,
          invested_capital: Number(i.invested_capital || 0),
          current_value: Number(i.current_value || 0),
          annual_yield_rate: Number(i.annual_yield_rate || 0),
          tax_withholding_rate: Number(i.tax_withholding_rate || 0),
        })) as FinancialInstrumentItem[],
      });
    }

    if (goalsRes.data) {
      set({
        savingsGoals: goalsRes.data.map((g) => ({
          ...g,
          target_amount: Number(g.target_amount || 0),
          current_amount: Number(g.current_amount || 0),
        })) as SavingsGoalItem[],
      });
    }

    if (budgetsRes.data) {
      set({
        budgets: budgetsRes.data.map((b) => ({
          ...b,
          limit_amount: Number(b.limit_amount || 0),
          alert_threshold_percent: Number(b.alert_threshold_percent || 80),
        })) as BudgetItem[],
      });
    }

    if (remindersRes.data) {
      set({
        reminders: remindersRes.data.map((r) => ({
          ...r,
          amount: r.amount !== null ? Number(r.amount) : null,
        })) as AgendaReminderItem[],
      });
    }

    if (chatRes.data) {
      set({ chatMessages: chatRes.data as AiChatMessageItem[] });
    }
  },

  createAccount: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('accounts').insert({
      user_id: userId,
      profile_id: profileId,
      name: payload.name,
      account_type: payload.account_type,
      currency: payload.currency,
      current_balance: payload.initial_balance,
      bank_name: payload.bank_name || null,
      color_hex: payload.color_hex,
      icon_name: 'Wallet',
    });

    await get().loadUserWorkspace();
  },

  createCategory: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('categories').insert({
      user_id: userId,
      profile_id: profileId,
      name: payload.name,
      category_type: payload.category_type,
      spending_nature: payload.spending_nature || 'variable',
      color_hex: payload.color_hex,
      icon_name: 'Tag',
    });

    await get().loadUserWorkspace();
  },

  registerTransaction: async (payload) => {
    const profileId = get().getActiveProfileId();
    if (!profileId) return;

    const { error } = await supabase.rpc('rpc_register_transaction', {
      p_profile_id: profileId,
      p_account_id: payload.account_id || null,
      p_credit_card_id: payload.credit_card_id || null,
      p_category_id: payload.category_id || null,
      p_transaction_type: payload.transaction_type,
      p_income_subtype: payload.income_subtype || null,
      p_amount: payload.amount,
      p_currency: payload.currency,
      p_description: payload.description,
      p_transaction_date: payload.transaction_date || new Date().toISOString(),
      p_created_by_ai: Boolean(payload.created_by_ai),
    });

    if (error) throw error;
    await get().loadUserWorkspace();
  },

  transferBetweenAccounts: async (payload) => {
    const { error } = await supabase.rpc('rpc_transfer_between_accounts', {
      p_source_account_id: payload.source_account_id,
      p_target_account_id: payload.target_account_id,
      p_amount: payload.amount,
      p_exchange_rate: payload.exchange_rate || 1.0,
      p_description: payload.description || 'Transferencia entre cuentas',
    });

    if (error) throw error;
    await get().loadUserWorkspace();
  },

  createCreditCard: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('credit_cards').insert({
      user_id: userId,
      profile_id: profileId,
      card_name: payload.card_name,
      bank_name: payload.bank_name,
      network: payload.network,
      last4_digits: payload.last4_digits || '0000',
      currency: payload.currency,
      credit_limit: payload.credit_limit,
      statement_balance: payload.statement_balance,
      unbilled_balance: payload.unbilled_balance,
      closing_day: payload.closing_day,
      due_day: payload.due_day,
      interest_rate_annual: payload.interest_rate_annual,
    });

    await get().loadUserWorkspace();
  },

  payCreditCard: async (payload) => {
    const { error } = await supabase.rpc('rpc_pay_credit_card', {
      p_source_account_id: payload.source_account_id,
      p_credit_card_id: payload.credit_card_id,
      p_amount: payload.amount,
      p_exchange_rate: payload.exchange_rate || 1.0,
      p_description: payload.description || 'Pago de tarjeta de crédito',
    });

    if (error) throw error;
    await get().loadUserWorkspace();
  },

  createPayable: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('payables_subscriptions').insert({
      user_id: userId,
      profile_id: profileId,
      title: payload.title,
      payable_type: payload.payable_type,
      amount: payload.amount,
      currency: payload.currency,
      frequency: payload.frequency,
      next_due_date: payload.next_due_date,
      current_installment: payload.current_installment || 1,
      total_installments: payload.total_installments ?? null,
      late_interest_rate: payload.late_interest_rate || 0,
      late_fixed_fee: payload.late_fixed_fee || 0,
      remind_days_before: payload.remind_days_before ?? 3,
      status: 'pending',
    });

    await get().loadUserWorkspace();
  },

  markPayableAsPaid: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    const payable = get().payables.find((p) => p.id === payload.payable_id);
    if (!userId || !profileId || !payable) return;

    const totalPaid = payable.amount + (payload.late_fee_applied || 0);

    // Registrar el gasto desde la cuenta seleccionada
    await supabase.rpc('rpc_register_transaction', {
      p_profile_id: profileId,
      p_account_id: payload.account_id,
      p_credit_card_id: null,
      p_category_id: payable.category_id,
      p_transaction_type: 'expense',
      p_income_subtype: null,
      p_amount: totalPaid,
      p_currency: payable.currency,
      p_description: `Pago: ${payable.title} (Cuota ${payable.current_installment}${
        payable.total_installments ? '/' + payable.total_installments : ''
      })`,
      p_transaction_date: new Date(payload.paid_date).toISOString(),
      p_created_by_ai: false,
    });

    // Calcular siguiente fecha o finalizar si completó cuotas
    const isCompleted =
      payable.total_installments !== null &&
      payable.current_installment >= payable.total_installments;

    const nextDate = new Date(payable.next_due_date);
    if (payable.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (payable.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 15);
    else if (payable.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (payable.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

    await supabase
      .from('payables_subscriptions')
      .update({
        status: isCompleted || payable.frequency === 'once' ? 'paid' : 'pending',
        current_installment: isCompleted
          ? payable.current_installment
          : payable.current_installment + 1,
        next_due_date: nextDate.toISOString().split('T')[0],
        last_paid_at: new Date(payload.paid_date).toISOString(),
      })
      .eq('id', payable.id);

    await get().loadUserWorkspace();
  },

  createLoan: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('loans').insert({
      user_id: userId,
      profile_id: profileId,
      loan_direction: payload.loan_direction,
      counterparty_name: payload.counterparty_name,
      principal_amount: payload.principal_amount,
      remaining_balance: payload.principal_amount,
      currency: payload.currency,
      annual_interest_rate: payload.annual_interest_rate,
      late_interest_rate: payload.late_interest_rate || 0,
      term_months: payload.term_months,
      paid_installments: 0,
      installment_amount: payload.installment_amount,
      frequency: payload.frequency,
      next_payment_date: payload.next_payment_date,
      linked_account_id: payload.disburse_or_deposit_account_id || null,
      status: 'active',
    });

    // Si seleccionó cuenta para desembolsar (préstamo otorgado) o depositar (préstamo recibido)
    if (payload.disburse_or_deposit_account_id) {
      await supabase.rpc('rpc_register_transaction', {
        p_profile_id: profileId,
        p_account_id: payload.disburse_or_deposit_account_id,
        p_credit_card_id: null,
        p_category_id: null,
        p_transaction_type: payload.loan_direction === 'granted' ? 'expense' : 'income',
        p_income_subtype: 'irregular',
        p_amount: payload.principal_amount,
        p_currency: payload.currency,
        p_description:
          payload.loan_direction === 'granted'
            ? `Desembolso préstamo otorgado a ${payload.counterparty_name}`
            : `Ingreso préstamo recibido de ${payload.counterparty_name}`,
        p_transaction_date: new Date().toISOString(),
        p_created_by_ai: false,
      });
    } else {
      await get().loadUserWorkspace();
    }
  },

  registerLoanPayment: async (payload) => {
    const profileId = get().getActiveProfileId();
    const loan = get().loans.find((l) => l.id === payload.loan_id);
    if (!profileId || !loan) return;

    // Si es préstamo recibido, pagar cuota es un egreso; si es préstamo otorgado a un tercero, cobrar cuota es un ingreso.
    await supabase.rpc('rpc_register_transaction', {
      p_profile_id: profileId,
      p_account_id: payload.account_id,
      p_credit_card_id: null,
      p_category_id: null,
      p_transaction_type: loan.loan_direction === 'received' ? 'expense' : 'income',
      p_income_subtype: loan.loan_direction === 'granted' ? 'regular' : null,
      p_amount: payload.amount,
      p_currency: loan.currency,
      p_description:
        loan.loan_direction === 'received'
          ? `Pago cuota préstamo: ${loan.counterparty_name}`
          : `Cobro abono préstamo: ${loan.counterparty_name}`,
      p_transaction_date: new Date().toISOString(),
      p_created_by_ai: false,
    });

    // Calcular interés mensual aproximado y amortización de capital
    const monthlyInterestRate = loan.annual_interest_rate / 100 / 12;
    const interestPortion = loan.remaining_balance * monthlyInterestRate;
    const principalPortion = Math.max(0, payload.amount - interestPortion);
    const newRemaining = Math.max(0, loan.remaining_balance - principalPortion);

    await supabase
      .from('loans')
      .update({
        remaining_balance: newRemaining,
        paid_installments: loan.paid_installments + 1,
        status: newRemaining <= 0.5 ? 'paid_off' : 'active',
      })
      .eq('id', loan.id);

    await get().loadUserWorkspace();
  },

  createBudget: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('budgets').insert({
      user_id: userId,
      profile_id: profileId,
      category_id: payload.category_id || null,
      name: payload.name,
      period_type: payload.period_type,
      limit_amount: payload.limit_amount,
      currency: payload.currency,
      alert_threshold_percent: 80,
      is_active: true,
    });

    await get().loadUserWorkspace();
  },

  createSavingsGoal: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('savings_goals').insert({
      user_id: userId,
      profile_id: profileId,
      name: payload.name,
      target_amount: payload.target_amount,
      current_amount: payload.current_amount,
      currency: payload.currency,
      target_date: payload.target_date || null,
      color_hex: payload.color_hex,
    });

    await get().loadUserWorkspace();
  },

  contributeToSavingsGoal: async (payload) => {
    const profileId = get().getActiveProfileId();
    const goal = get().savingsGoals.find((g) => g.id === payload.goal_id);
    if (!profileId || !goal) return;

    await supabase.rpc('rpc_register_transaction', {
      p_profile_id: profileId,
      p_account_id: payload.account_id,
      p_credit_card_id: null,
      p_category_id: null,
      p_transaction_type: 'expense',
      p_income_subtype: null,
      p_amount: payload.amount,
      p_currency: goal.currency,
      p_description: `Aporte a meta de ahorro: ${goal.name}`,
      p_transaction_date: new Date().toISOString(),
      p_created_by_ai: false,
    });

    await supabase
      .from('savings_goals')
      .update({
        current_amount: goal.current_amount + payload.amount,
      })
      .eq('id', goal.id);

    await get().loadUserWorkspace();
  },

  createFinancialInstrument: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('financial_instruments').insert({
      user_id: userId,
      profile_id: profileId,
      instrument_type: payload.instrument_type,
      institution_name: payload.institution_name,
      name: payload.name,
      currency: payload.currency,
      invested_capital: payload.invested_capital,
      current_value: payload.current_value,
      annual_yield_rate: payload.annual_yield_rate,
      tax_withholding_rate: payload.tax_withholding_rate ?? 10,
      maturity_date: payload.maturity_date || null,
    });

    await get().loadUserWorkspace();
  },

  createReminder: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('agenda_reminders').insert({
      user_id: userId,
      profile_id: profileId,
      title: payload.title,
      description: payload.description || null,
      event_date: payload.event_date,
      reminder_type: payload.reminder_type,
      amount: payload.amount ?? null,
      is_completed: false,
    });

    await get().loadUserWorkspace();
  },

  toggleReminderCompleted: async (reminder_id, currentStatus) => {
    await supabase
      .from('agenda_reminders')
      .update({ is_completed: !currentStatus })
      .eq('id', reminder_id);

    await get().loadUserWorkspace();
  },

  addChatMessage: async (payload) => {
    const userId = get().user?.id;
    const profileId = get().getActiveProfileId();
    if (!userId || !profileId) return;

    await supabase.from('ai_chat_messages').insert({
      user_id: userId,
      profile_id: profileId,
      sender: payload.sender,
      message_text: payload.message_text,
      action_payload: payload.action_payload || null,
    });

    await get().loadUserWorkspace();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      preferences: DEFAULT_PREFERENCES,
      financialProfiles: [],
      accounts: [],
      categories: [],
      recentTransactions: [],
      creditCards: [],
      payables: [],
      loans: [],
      instruments: [],
      savingsGoals: [],
      budgets: [],
      reminders: [],
      chatMessages: [],
    });
  },
}));

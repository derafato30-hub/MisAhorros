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
  transaction_type: 'income' | 'expense' | 'transfer' | 'card_payment' | 'loan_payment';
  income_subtype: 'payroll' | 'regular' | 'irregular' | null;
  amount: number;
  currency: CurrencyCode;
  exchange_rate: number;
  target_amount: number | null;
  description: string;
  transaction_date: string;
  created_by_ai: boolean;
}

interface AppState {
  session: Session | null;
  user: User | null;
  isLoadingAuth: boolean;
  preferences: UserProfilePreferences;
  financialProfiles: FinancialProfile[];
  activeProfileType: ProfileType;
  hideBalances: boolean;

  // Datos del perfil activo
  accounts: BankAccount[];
  categories: CategoryItem[];
  recentTransactions: TransactionItem[];

  // Acciones
  setSession: (session: Session | null) => void;
  setActiveProfileType: (type: ProfileType) => void;
  toggleHideBalances: () => void;
  updatePreferences: (partial: Partial<UserProfilePreferences>) => Promise<void>;
  loadUserWorkspace: () => Promise<void>;
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

  updatePreferences: async (partial) => {
    const current = get().preferences;
    const updated = { ...current, ...partial };
    set({
      preferences: updated,
      hideBalances: partial.hide_balances_default !== undefined ? partial.hide_balances_default : get().hideBalances,
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

    const [profileRes, finProfilesRes, accountsRes, categoriesRes, txRes] = await Promise.all([
      supabase.from('users_profiles').select('*').eq('id', userId).single(),
      supabase.from('financial_profiles').select('*').eq('user_id', userId),
      supabase.from('accounts').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('categories').select('*').eq('user_id', userId).order('name', { ascending: true }),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(50),
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
        })) as TransactionItem[],
      });
    }
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
    });
  },
}));

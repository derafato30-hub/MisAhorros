-- =============================================================================
-- MIS AHORROS - ESQUEMA MAESTRO COMPLETO E IDEMPOTENTE (SUPABASE / POSTGRESQL)
-- INSTRUCCIONES: Copia TODO este archivo (Ctrl+A -> Ctrl+C), pégalo en un
-- query limpio del SQL Editor de Supabase y haz clic en "Run" (sin tener
-- texto seleccionado con el mouse).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    theme_mode TEXT NOT NULL DEFAULT 'dark' CHECK (theme_mode IN ('dark', 'light', 'amoled')),
    accent_color TEXT NOT NULL DEFAULT 'emerald' CHECK (accent_color IN ('emerald', 'ocean', 'gold', 'amethyst', 'coral')),
    font_family TEXT NOT NULL DEFAULT 'jakarta' CHECK (font_family IN ('jakarta', 'inter', 'space_grotesk')),
    default_currency TEXT NOT NULL DEFAULT 'HNL',
    is_salaried BOOLEAN NOT NULL DEFAULT true,
    has_business BOOLEAN NOT NULL DEFAULT false,
    hide_balances_default BOOLEAN NOT NULL DEFAULT false,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENTORNOS FINANCIEROS (Personal vs Mi Negocio)
CREATE TABLE IF NOT EXISTS public.financial_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_type TEXT NOT NULL CHECK (profile_type IN ('personal', 'business')),
    display_name TEXT NOT NULL,
    base_currency TEXT NOT NULL DEFAULT 'HNL',
    tax_id TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CUENTAS DE ACTIVO (Efectivo, Bancos, Billeteras)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'checking', 'savings', 'payroll', 'digital_wallet')),
    currency TEXT NOT NULL DEFAULT 'HNL',
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    bank_name TEXT DEFAULT NULL,
    account_number_last4 TEXT DEFAULT NULL,
    color_hex TEXT NOT NULL DEFAULT '#10B981',
    icon_name TEXT NOT NULL DEFAULT 'Wallet',
    include_in_total BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATEGORÍAS DE INGRESOS Y GASTOS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_type TEXT NOT NULL CHECK (category_type IN ('income', 'expense')),
    spending_nature TEXT DEFAULT 'variable' CHECK (spending_nature IN ('fixed', 'variable', 'discretionary')),
    color_hex TEXT NOT NULL DEFAULT '#3B82F6',
    icon_name TEXT NOT NULL DEFAULT 'Tag',
    is_system_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TARJETAS DE CRÉDITO
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    card_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'visa' CHECK (network IN ('visa', 'mastercard', 'amex', 'other')),
    last4_digits TEXT DEFAULT '0000',
    currency TEXT NOT NULL DEFAULT 'HNL',
    credit_limit NUMERIC(15, 2) NOT NULL CHECK (credit_limit >= 0),
    statement_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    unbilled_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    minimum_payment NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    closing_day INT NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    interest_rate_annual NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    default_interest_rate NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    color_theme TEXT NOT NULL DEFAULT 'obsidian',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CUENTAS POR PAGAR, SUSCRIPCIONES Y GASTOS FIJOS
CREATE TABLE IF NOT EXISTS public.payables_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    preferred_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    preferred_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    payable_type TEXT NOT NULL CHECK (payable_type IN ('subscription', 'fixed_expense', 'payable_debt')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'HNL',
    frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    next_due_date DATE NOT NULL,
    current_installment INT DEFAULT 1,
    total_installments INT DEFAULT NULL,
    late_interest_rate NUMERIC(6, 2) DEFAULT 0.00,
    late_fixed_fee NUMERIC(15, 2) DEFAULT 0.00,
    remind_days_before INT NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    last_paid_at TIMESTAMPTZ DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRÉSTAMOS 360 (Recibidos y Otorgados)
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    loan_direction TEXT NOT NULL CHECK (loan_direction IN ('received', 'granted')),
    counterparty_name TEXT NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL CHECK (principal_amount > 0),
    remaining_balance NUMERIC(15, 2) NOT NULL CHECK (remaining_balance >= 0),
    currency TEXT NOT NULL DEFAULT 'HNL',
    annual_interest_rate NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    late_interest_rate NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    term_months INT NOT NULL DEFAULT 12 CHECK (term_months > 0),
    paid_installments INT NOT NULL DEFAULT 0,
    installment_amount NUMERIC(15, 2) NOT NULL CHECK (installment_amount >= 0),
    frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_payment_date DATE NOT NULL,
    linked_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'defaulted')),
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MOVIMIENTOS Y TRANSACCIONES
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    target_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'card_payment', 'loan_payment', 'loan_disbursement', 'savings_contribution')),
    income_subtype TEXT DEFAULT NULL CHECK (income_subtype IN ('payroll', 'regular', 'irregular')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'HNL',
    exchange_rate NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,
    target_amount NUMERIC(15, 2) DEFAULT NULL,
    late_fee_applied NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    linked_payable_id UUID REFERENCES public.payables_subscriptions(id) ON DELETE SET NULL,
    linked_loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
    created_by_ai BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. INSTRUMENTOS FINANCIEROS E INVERSIONES
CREATE TABLE IF NOT EXISTS public.financial_instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    instrument_type TEXT NOT NULL CHECK (instrument_type IN ('term_deposit', 'pension_fund', 'investment_fund', 'stocks_etf', 'crypto', 'real_estate')),
    institution_name TEXT NOT NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'HNL',
    invested_capital NUMERIC(15, 2) NOT NULL CHECK (invested_capital >= 0),
    current_value NUMERIC(15, 2) NOT NULL CHECK (current_value >= 0),
    annual_yield_rate NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    tax_withholding_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    maturity_date DATE DEFAULT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT false,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. FONDOS DE AHORRO Y METAS
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    linked_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'HNL',
    target_date DATE DEFAULT NULL,
    color_hex TEXT NOT NULL DEFAULT '#10B981',
    icon_name TEXT NOT NULL DEFAULT 'PiggyBank',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PRESUPUESTOS
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'biweekly', 'monthly')),
    limit_amount NUMERIC(15, 2) NOT NULL CHECK (limit_amount > 0),
    currency TEXT NOT NULL DEFAULT 'HNL',
    alert_threshold_percent NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AGENDA FINANCIERA Y RECORDATORIOS
CREATE TABLE IF NOT EXISTS public.agenda_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    event_date DATE NOT NULL,
    event_time TIME DEFAULT '09:00:00',
    reminder_type TEXT NOT NULL DEFAULT 'custom' CHECK (reminder_type IN ('payable', 'card_cutoff', 'card_due', 'loan', 'payroll', 'cdp_maturity', 'custom')),
    amount NUMERIC(15, 2) DEFAULT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. HISTORIAL DEL CHATBOT IA
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.financial_profiles(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    message_text TEXT NOT NULL,
    action_payload JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- 15. POLÍTICAS RLS EXPLÍCITAS E IDEMPOTENTES
-- users_profiles
DROP POLICY IF EXISTS "users_profiles_select" ON public.users_profiles;
CREATE POLICY "users_profiles_select" ON public.users_profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "users_profiles_insert" ON public.users_profiles;
CREATE POLICY "users_profiles_insert" ON public.users_profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "users_profiles_update" ON public.users_profiles;
CREATE POLICY "users_profiles_update" ON public.users_profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- financial_profiles
DROP POLICY IF EXISTS "financial_profiles_all" ON public.financial_profiles;
CREATE POLICY "financial_profiles_all" ON public.financial_profiles FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- accounts
DROP POLICY IF EXISTS "accounts_all" ON public.accounts;
CREATE POLICY "accounts_all" ON public.accounts FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- categories
DROP POLICY IF EXISTS "categories_all" ON public.categories;
CREATE POLICY "categories_all" ON public.categories FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- credit_cards
DROP POLICY IF EXISTS "credit_cards_all" ON public.credit_cards;
CREATE POLICY "credit_cards_all" ON public.credit_cards FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- payables_subscriptions
DROP POLICY IF EXISTS "payables_subscriptions_all" ON public.payables_subscriptions;
CREATE POLICY "payables_subscriptions_all" ON public.payables_subscriptions FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- loans
DROP POLICY IF EXISTS "loans_all" ON public.loans;
CREATE POLICY "loans_all" ON public.loans FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- transactions
DROP POLICY IF EXISTS "transactions_all" ON public.transactions;
CREATE POLICY "transactions_all" ON public.transactions FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- financial_instruments
DROP POLICY IF EXISTS "financial_instruments_all" ON public.financial_instruments;
CREATE POLICY "financial_instruments_all" ON public.financial_instruments FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- savings_goals
DROP POLICY IF EXISTS "savings_goals_all" ON public.savings_goals;
CREATE POLICY "savings_goals_all" ON public.savings_goals FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- budgets
DROP POLICY IF EXISTS "budgets_all" ON public.budgets;
CREATE POLICY "budgets_all" ON public.budgets FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- agenda_reminders
DROP POLICY IF EXISTS "agenda_reminders_all" ON public.agenda_reminders;
CREATE POLICY "agenda_reminders_all" ON public.agenda_reminders FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- ai_chat_messages
DROP POLICY IF EXISTS "ai_chat_messages_all" ON public.ai_chat_messages;
CREATE POLICY "ai_chat_messages_all" ON public.ai_chat_messages FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 16. TRIGGER DE ONBOARDING AUTOMÁTICO AL REGISTRARSE UN USUARIO
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $func$
DECLARE
    v_personal_profile_id UUID;
    v_business_profile_id UUID;
BEGIN
    INSERT INTO public.users_profiles (id, email, full_name)
    VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'));

    INSERT INTO public.financial_profiles (user_id, profile_type, display_name, base_currency)
    VALUES (NEW.id, 'personal', 'Finanzas Personales', 'HNL')
    RETURNING id INTO v_personal_profile_id;

    INSERT INTO public.financial_profiles (user_id, profile_type, display_name, base_currency)
    VALUES (NEW.id, 'business', 'Mi Negocio', 'HNL')
    RETURNING id INTO v_business_profile_id;

    INSERT INTO public.accounts (user_id, profile_id, name, account_type, currency, current_balance, color_hex, icon_name)
    VALUES (NEW.id, v_personal_profile_id, 'Efectivo (Billetera)', 'cash', 'HNL', 0.00, '#10B981', 'Banknote');

    INSERT INTO public.accounts (user_id, profile_id, name, account_type, currency, current_balance, color_hex, icon_name)
    VALUES (NEW.id, v_business_profile_id, 'Caja General Negocio', 'cash', 'HNL', 0.00, '#F59E0B', 'Briefcase');

    INSERT INTO public.categories (user_id, profile_id, name, category_type, spending_nature, color_hex, icon_name, is_system_default)
    VALUES
        (NEW.id, v_personal_profile_id, 'Sueldo / Nómina', 'income', 'fixed', '#10B981', 'BadgeDollarSign', true),
        (NEW.id, v_personal_profile_id, 'Ingresos Extra', 'income', 'variable', '#06B6D4', 'TrendingUp', true),
        (NEW.id, v_personal_profile_id, 'Supermercado y Comida', 'expense', 'variable', '#F59E0B', 'ShoppingCart', true),
        (NEW.id, v_personal_profile_id, 'Transporte y Gasolina', 'expense', 'variable', '#3B82F6', 'Car', true),
        (NEW.id, v_personal_profile_id, 'Vivienda y Servicios', 'expense', 'fixed', '#8B5CF6', 'Home', true),
        (NEW.id, v_personal_profile_id, 'Entretenimiento y Ocio', 'expense', 'discretionary', '#EC4899', 'Film', true),
        (NEW.id, v_personal_profile_id, 'Salud y Farmacia', 'expense', 'variable', '#EF4444', 'HeartPulse', true);

    INSERT INTO public.categories (user_id, profile_id, name, category_type, spending_nature, color_hex, icon_name, is_system_default)
    VALUES
        (NEW.id, v_business_profile_id, 'Ventas de Productos/Servicios', 'income', 'variable', '#10B981', 'Store', true),
        (NEW.id, v_business_profile_id, 'Inventario y Proveedores', 'expense', 'variable', '#F59E0B', 'Package', true),
        (NEW.id, v_business_profile_id, 'Alquiler y Servicios Local', 'expense', 'fixed', '#3B82F6', 'Building2', true),
        (NEW.id, v_business_profile_id, 'Planilla / Empleados', 'expense', 'fixed', '#8B5CF6', 'Users', true),
        (NEW.id, v_business_profile_id, 'Publicidad y Marketing', 'expense', 'discretionary', '#EC4899', 'Megaphone', true);

    RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();

-- 17. FUNCIONES ATÓMICAS RPC (Transacciones, Transferencias y Pagos de Tarjeta)
CREATE OR REPLACE FUNCTION public.rpc_register_transaction(
    p_profile_id UUID,
    p_account_id UUID,
    p_credit_card_id UUID,
    p_category_id UUID,
    p_transaction_type TEXT,
    p_income_subtype TEXT,
    p_amount NUMERIC(15, 2),
    p_currency TEXT,
    p_description TEXT,
    p_transaction_date TIMESTAMPTZ DEFAULT NOW(),
    p_created_by_ai BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $rpc1$
DECLARE
    v_user_id UUID := auth.uid();
    v_tx_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    INSERT INTO public.transactions (
        user_id, profile_id, account_id, credit_card_id, category_id,
        transaction_type, income_subtype, amount, currency, description,
        transaction_date, created_by_ai
    ) VALUES (
        v_user_id, p_profile_id, p_account_id, p_credit_card_id, p_category_id,
        p_transaction_type, p_income_subtype, p_amount, p_currency, p_description,
        COALESCE(p_transaction_date, NOW()), p_created_by_ai
    ) RETURNING id INTO v_tx_id;

    IF p_account_id IS NOT NULL THEN
        IF p_transaction_type = 'income' THEN
            UPDATE public.accounts
            SET current_balance = current_balance + p_amount, updated_at = NOW()
            WHERE id = p_account_id AND user_id = v_user_id;
        ELSIF p_transaction_type = 'expense' THEN
            UPDATE public.accounts
            SET current_balance = current_balance - p_amount, updated_at = NOW()
            WHERE id = p_account_id AND user_id = v_user_id;
        END IF;
    END IF;

    IF p_credit_card_id IS NOT NULL AND p_transaction_type = 'expense' THEN
        UPDATE public.credit_cards
        SET unbilled_balance = unbilled_balance + p_amount, updated_at = NOW()
        WHERE id = p_credit_card_id AND user_id = v_user_id;
    END IF;

    RETURN v_tx_id;
END;
$rpc1$;

CREATE OR REPLACE FUNCTION public.rpc_transfer_between_accounts(
    p_source_account_id UUID,
    p_target_account_id UUID,
    p_amount NUMERIC(15, 2),
    p_exchange_rate NUMERIC(12, 6),
    p_description TEXT DEFAULT 'Transferencia entre cuentas'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $rpc2$
DECLARE
    v_user_id UUID := auth.uid();
    v_source_profile UUID;
    v_source_currency TEXT;
    v_target_amount NUMERIC(15, 2);
    v_tx_id UUID;
BEGIN
    SELECT profile_id, currency INTO v_source_profile, v_source_currency
    FROM public.accounts
    WHERE id = p_source_account_id AND user_id = v_user_id;

    IF v_source_profile IS NULL THEN
        RAISE EXCEPTION 'Cuenta origen no válida';
    END IF;

    v_target_amount := ROUND(p_amount * COALESCE(p_exchange_rate, 1.0), 2);

    UPDATE public.accounts
    SET current_balance = current_balance - p_amount, updated_at = NOW()
    WHERE id = p_source_account_id AND user_id = v_user_id;

    UPDATE public.accounts
    SET current_balance = current_balance + v_target_amount, updated_at = NOW()
    WHERE id = p_target_account_id AND user_id = v_user_id;

    INSERT INTO public.transactions (
        user_id, profile_id, account_id, target_account_id,
        transaction_type, amount, currency, exchange_rate, target_amount, description
    ) VALUES (
        v_user_id, v_source_profile, p_source_account_id, p_target_account_id,
        'transfer', p_amount, v_source_currency, COALESCE(p_exchange_rate, 1.0), v_target_amount, p_description
    ) RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$rpc2$;

CREATE OR REPLACE FUNCTION public.rpc_pay_credit_card(
    p_source_account_id UUID,
    p_credit_card_id UUID,
    p_amount NUMERIC(15, 2),
    p_exchange_rate NUMERIC(12, 6) DEFAULT 1.0,
    p_description TEXT DEFAULT 'Pago de tarjeta de crédito'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $rpc3$
DECLARE
    v_user_id UUID := auth.uid();
    v_profile_id UUID;
    v_currency TEXT;
    v_card_payment_amount NUMERIC(15, 2);
    v_statement_bal NUMERIC(15, 2);
    v_rem NUMERIC(15, 2);
    v_tx_id UUID;
BEGIN
    SELECT profile_id, currency, statement_balance
    INTO v_profile_id, v_currency, v_statement_bal
    FROM public.credit_cards
    WHERE id = p_credit_card_id AND user_id = v_user_id;

    v_card_payment_amount := ROUND(p_amount * COALESCE(p_exchange_rate, 1.0), 2);

    UPDATE public.accounts
    SET current_balance = current_balance - p_amount, updated_at = NOW()
    WHERE id = p_source_account_id AND user_id = v_user_id;

    IF v_card_payment_amount <= v_statement_bal THEN
        UPDATE public.credit_cards
        SET statement_balance = statement_balance - v_card_payment_amount, updated_at = NOW()
        WHERE id = p_credit_card_id AND user_id = v_user_id;
    ELSE
        v_rem := v_card_payment_amount - v_statement_bal;
        UPDATE public.credit_cards
        SET statement_balance = 0,
            unbilled_balance = GREATEST(0, unbilled_balance - v_rem),
            updated_at = NOW()
        WHERE id = p_credit_card_id AND user_id = v_user_id;
    END IF;

    INSERT INTO public.transactions (
        user_id, profile_id, account_id, credit_card_id,
        transaction_type, amount, currency, exchange_rate, target_amount, description
    ) VALUES (
        v_user_id, v_profile_id, p_source_account_id, p_credit_card_id,
        'card_payment', p_amount, v_currency, COALESCE(p_exchange_rate, 1.0), v_card_payment_amount, p_description
    ) RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$rpc3$;

-- =============================================================================
-- MIS AHORROS - FUNCIONES ATÓMICAS RPC (TRANSACCIONES Y CONTABILIDAD EXACTA)
-- Garantiza que todo movimiento actualice los saldos en una única transacción ACID.
-- =============================================================================

-- 1. Registrar Ingreso o Gasto en Cuenta o Tarjeta de Crédito
CREATE OR REPLACE FUNCTION public.rpc_register_transaction(
    p_profile_id UUID,
    p_account_id UUID,
    p_credit_card_id UUID,
    p_category_id UUID,
    p_transaction_type TEXT, -- 'income' | 'expense'
    p_income_subtype TEXT,   -- 'payroll' | 'regular' | 'irregular' | NULL
    p_amount NUMERIC(15, 2),
    p_currency TEXT,
    p_description TEXT,
    p_transaction_date TIMESTAMPTZ DEFAULT NOW(),
    p_created_by_ai BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_tx_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Insertar el movimiento
    INSERT INTO public.transactions (
        user_id, profile_id, account_id, credit_card_id, category_id,
        transaction_type, income_subtype, amount, currency, description,
        transaction_date, created_by_ai
    ) VALUES (
        v_user_id, p_profile_id, p_account_id, p_credit_card_id, p_category_id,
        p_transaction_type, p_income_subtype, p_amount, p_currency, p_description,
        COALESCE(p_transaction_date, NOW()), p_created_by_ai
    ) RETURNING id INTO v_tx_id;

    -- Actualizar saldo si es cuenta bancaria / efectivo
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

    -- Actualizar saldo flotante si fue gasto con tarjeta de crédito
    IF p_credit_card_id IS NOT NULL AND p_transaction_type = 'expense' THEN
        UPDATE public.credit_cards
        SET unbilled_balance = unbilled_balance + p_amount, updated_at = NOW()
        WHERE id = p_credit_card_id AND user_id = v_user_id;
    END IF;

    RETURN v_tx_id;
END;
$$;

-- 2. Transferencia Atómica entre Cuentas (Soporta Multi-Moneda e Inter-Perfil)
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
AS $$
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

    -- Descontar de cuenta origen
    UPDATE public.accounts
    SET current_balance = current_balance - p_amount, updated_at = NOW()
    WHERE id = p_source_account_id AND user_id = v_user_id;

    -- Acreditar en cuenta destino
    UPDATE public.accounts
    SET current_balance = current_balance + v_target_amount, updated_at = NOW()
    WHERE id = p_target_account_id AND user_id = v_user_id;

    -- Registrar movimiento de transferencia
    INSERT INTO public.transactions (
        user_id, profile_id, account_id, target_account_id,
        transaction_type, amount, currency, exchange_rate, target_amount, description
    ) VALUES (
        v_user_id, v_source_profile, p_source_account_id, p_target_account_id,
        'transfer', p_amount, v_source_currency, COALESCE(p_exchange_rate, 1.0), v_target_amount, p_description
    ) RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$$;

-- 3. Pago de Tarjeta de Crédito desde Cuenta Bancaria
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
AS $$
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

    -- Rebajar de la cuenta bancaria
    UPDATE public.accounts
    SET current_balance = current_balance - p_amount, updated_at = NOW()
    WHERE id = p_source_account_id AND user_id = v_user_id;

    -- Aplicar pago primero al statement_balance (saldo al corte) y el resto a unbilled_balance
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
$$;

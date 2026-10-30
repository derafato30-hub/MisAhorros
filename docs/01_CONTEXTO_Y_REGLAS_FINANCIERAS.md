# 01. Contexto Maestro y Reglas de Dominio Financiero — MisAhorros

> [!IMPORTANT]
> **Propósito de este documento**: Este archivo es la "Fuente de la Verdad" (Single Source of Truth) para cualquier agente de IA o desarrollador que trabaje en `MisAhorros`. Antes de escribir cualquier línea de código, consulta o migración SQL, se deben respetar estrictamente las fórmulas matemáticas, reglas contables y estructuras de dominio definidas aquí para evitar errores de cálculo o inconsistencias ("delirios").

---

## 1. Arquitectura de Perfiles y Multi-Moneda

### 1.1 Perfiles de Entidad (`Finanzas Personales` vs. `Mi Negocio`)
Un mismo usuario autenticado (`auth.users`) puede operar bajo dos entornos contables aislados pero interconectados:
1. **Perfil Personal (`type = 'personal'`)**: Orientado a ingresos por nómina, honorarios, gastos de vida, ahorro personal, tarjetas de crédito personales y metas.
2. **Perfil de Negocio (`type = 'business'`)**: Orientado a ingresos por ventas/servicios, costos operativos, pago a proveedores, nómina de empleados, préstamos Pyme y flujo de caja operativo.

**Regla de Aislamiento y Transferencia Inter-Perfil**:
- Los reportes de ingresos/gastos de cada perfil **no se mezclan** en sus respectivos Dashboards.
- Se permite realizar **Transferencias Inter-Perfil** (ej. "Retiro de utilidades del dueño" o "Aporte de capital al negocio"), las cuales generan un movimiento de salida en la cuenta origen del Perfil A y un movimiento de entrada en la cuenta destino del Perfil B, vinculados por un mismo `transfer_group_id`.

### 1.2 Sistema Multi-Moneda Exacto
- **Representación Numérica**: **PROHIBIDO** usar tipos `FLOAT` o `REAL` para dinero. Todo monto debe almacenarse en base de datos como `NUMERIC(15, 2)` y operarse en el cliente con redondeo bancario a 2 decimales (`Math.round((val + Number.EPSILON) * 100) / 100`).
- **Moneda Base del Perfil (`base_currency`)**: Ej. `HNL` (Lempiras), `USD` (Dólares), `MXN`, `EUR`.
- **Moneda por Cuenta (`account.currency`)**: Cada cuenta (Efectivo, Banco X, Banco Y USD) define su propia divisa.
- **Tasa de Cambio (`exchange_rate`)**:
  - Cuando una transacción ocurre en una cuenta cuya moneda difiere de la `base_currency`, se guarda el `amount` en la moneda de la cuenta y el `exchange_rate` vigente al momento de la transacción.
  - Si hay una transferencia entre una cuenta en `HNL` y otra en `USD`, el registro guarda `source_amount` (ej. `L 2,500.00`), `target_amount` (ej. `$ 100.00`) y `applied_rate` (`25.00`).

---

## 2. Cuentas, Ingresos, Gastos y Transferencias

### 2.1 Tipos de Cuentas (`accounts`)
- `cash`: Efectivo en billetera o caja chica.
- `checking`: Cuenta corriente o de cheques.
- `savings`: Cuenta de ahorro bancaria líquida.
- `payroll`: Cuenta de planilla / nómina.
- `digital_wallet`: Billeteras digitales (PayPal, Kash, Tigo Money, etc.).

### 2.2 Clasificación de Ingresos (`incomes`)
- **Por Nómina (`payroll`)**: Permite configurar salario bruto, deducciones de ley (IHSS, RAP, ISR, AFP) o monto neto directo, y frecuencia (`quincenal`, `mensual`, `semanal`).
- **Regulares (`regular`)**: Alquileres cobrados, igualas mensuales, mesadas.
- **Irregulares / Extraordinarios (`irregular`)**: Bonos, aguinaldos, decimocuarto mes, ventas ocasionales, comisiones variables.

### 2.3 Clasificación de Gastos (`expenses`) y Categorías
- Todo gasto requiere: `account_id` (de dónde salió el dinero o `credit_card_id` si se pagó con tarjeta de crédito), `category_id`, `amount`, `description` (motivo) y `transaction_date`.
- Las categorías soportan ícono personalizado, color hexadecimal y tipo (`fixed` para gastos fijos, `variable` para gastos variables, `discretionary` para deseos/ocio).

---

## 3. Lógica Matemática de Tarjetas de Crédito (`credit_cards`)

Una tarjeta de crédito **NO** es una cuenta de activo; es una línea de pasivo rotativo.
Cada tarjeta tiene configurados:
- `credit_limit`: Límite total autorizado ($L_{total}$).
- `closing_day`: Día de corte del mes (ej. día `15`).
- `due_day`: Día fecha máxima de pago (ej. día `5` del mes siguiente).
- `interest_rate_annual`: Tasa de interés anual ordinaria (TAN).
- `default_interest_rate_annual`: Tasa de interés moratoria.

### 3.1 Ciclo de Facturación y Saldos
1. **Saldo al Corte (`statement_balance`)**: Suma de todas las compras y cargos realizados entre el `closing_day` anterior y el `closing_day` actual, más cuotas de extrafinanciamiento/intrafianciamiento del mes. Es el **Pago de Contado** para no generar intereses.
2. **Saldo Flotante / Nuevo Ciclo (`unbilled_balance`)**: Compras realizadas *después* del último día de corte, que se pagarán hasta el corte del mes siguiente.
3. **Deuda Total Utilizada (`current_balance`)**:
   $$D_{total} = \text{statement\_balance} + \text{unbilled\_balance} + \text{installments\_principal\_pending}$$
4. **Crédito Disponible (`available_credit`)**:
   $$C_{disp} = L_{total} - D_{total}$$
5. **Pago de Tarjeta**: Cuando el usuario paga su tarjeta desde una cuenta bancaria (`account_id`), se crea una transferencia especial hacia `credit_card_id` que disminuye el saldo de la cuenta bancaria y reduce primero el `statement_balance` de la tarjeta.

---

## 4. Cuentas por Pagar, Suscripciones, Deudas y Cuotas (`payables_and_debts`)

### 4.1 Suscripciones y Gastos Fijos Periódicos
- Frecuencias soportadas: `daily`, `weekly`, `biweekly` (quincenal), `monthly`, `quarterly`, `yearly`.
- Generan alertas en la Agenda antes de la fecha de vencimiento (`remind_days_before`).
- Al marcarse como pagadas en la fecha $t$, actualizan el saldo de la cuenta origen o tarjeta seleccionada y programan automáticamente el próximo vencimiento en $t + \Delta \text{frecuencia}$.

### 4.2 Control de Cuotas y Penalidades por Atraso (Mora)
Cuando una deuda o cuenta por pagar tiene tasa de interés moratoria ($r_{mora}$ anual) y se paga con $d$ días de retraso respecto a su `due_date`:
$$\text{Interés por Mora} = \text{Cuota Principal} \times \left(\frac{r_{mora}}{360}\right) \times d + \text{Recargo Fijo (si aplica)}$$
El sistema registra exactamente qué día se pagó (`paid_at`), a qué número de cuota corresponde (`installment_number` de `total_installments`) y cuánto fue a capital vs. intereses/recargos.

---

## 5. Módulo Dual de Préstamos (`loans`)

### 5.1 Préstamos Recibidos (`loan_direction = 'received'`) — Pasivo
Préstamos bancarios, personales, vehiculares o hipotecarios adquiridos por el usuario o su negocio.
- **Método Francés (Cuota Nivelada)** por defecto:
  $$PMT = P \times \frac{i(1 + i)^n}{(1 + i)^n - 1}$$
  Donde $P$ es el monto principal, $i = \frac{\text{Tasa Anual}}{12}$ es la tasa mensual, y $n$ es el plazo en meses.
- En cada pago de cuota $k$, el interés del período es $I_k = \text{Saldo}_{k-1} \times i$, y el abono a capital es $A_k = PMT - I_k$.
- Soporta **Abonos Extraordinarios a Capital** (reduciendo plazo o reduciendo cuota).

### 5.2 Préstamos Otorgados a Terceros (`loan_direction = 'granted'`) — Activo (Cuenta por Cobrar)
Dinero que el usuario o negocio presta a amigos, familiares o clientes:
-Al desembolsar el préstamo, el dinero **sale** de la cuenta bancaria seleccionada (`account_id`), pero el patrimonio neto del usuario se mantiene mediante un activo en `Préstamos por Cobrar`.
- Permite configurar interés simple, interés compuesto o 0% de interés, fechas de cobro y registro de abonos parciales recibidos (que reingresan a la cuenta destino elegida).

---

## 6. Ahorros, Metas e Instrumentos Financieros (`savings_and_investments`)

### 6.1 Fondos de Ahorro y Metas (`savings_goals`)
- Tienen un `target_amount`, `current_amount`, `deadline_date`, color e ícono.
- El usuario puede asignar aportes periódicos desde sus cuentas.

### 6.2 Instrumentos Financieros (`financial_instruments`)
- **Certificados de Depósito a Plazo Fijo (CDP)**: Capital invertido ($P$), tasa anual ($r$), plazo en días ($t$), retención de impuesto sobre intereses ganados (ej. 10% ISR sobre ganancias de capital si aplica) y fecha de vencimiento:
  $$\text{Rendimiento Neto} = P \times \left(\frac{r}{360}\right) \times t \times (1 - \text{tax\_rate})$$
- **Fondos de Pensión (AFP / RAP / Privados)**: Seguimiento de aportes acumulados del empleado, aportes patronales y rendimiento histórico.
- **Inversiones Variables (Acciones, ETFs, Cripto, Bienes Raíces)**: Seguimiento de valor de compra vs. valor de mercado actual.

---

## 7. Presupuestos Inteligentes (`budgets`)
- **Temporalidades**: Diario (`daily`), Semanal (`weekly`), Quincenal (`biweekly`), Mensual (`monthly`).
- **Alcance**: Puede ser un presupuesto global para todo el perfil o específico por categoría(s).
- **Umbrales de Alerta**:
  - `< 70%`: Saludable (Verde Esmeralda).
  - `70% - 90%`: Precaución (Ámbar).
  - `> 90%`: Crítico / Excedido (Coral / Rojo).

---

## 8. Motor del Chatbot IA con Google Gemini (Function Calling)

El asistente financiero utiliza **Google Gemini API** invocado de forma segura desde **Supabase Edge Functions**.
- **Nunca ejecuta SQL directo generado por texto libre**. Utiliza exclusivamente herramientas tipadas (`Function Declarations` / Tools):
  1. `register_transaction(type, amount, account_name, category_name, description, date)`
  2. `get_financial_summary(profile_type, period)`
  3. `register_card_expense(card_name, amount, category_name, description, installments)`
  4. `create_budget_or_goal(type, name, target_amount, period)`
  5. `simulate_loan_or_debt_payoff(strategy: 'snowball' | 'avalanche')`
- **Confirmación Visual (Human-in-the-loop)**: Cuando el usuario pide por chat *"Registra L 450 de gasolina con la tarjeta BAC"*, el chatbot procesa la acción y muestra una **Tarjeta Interactiva de Confirmación** con botones `Deshacer` y `Editar` para evitar registros accidentales.

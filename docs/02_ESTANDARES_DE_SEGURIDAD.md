# 02. Estándares de Seguridad y Privacidad (Grado Bancario / FinTech) — MisAhorros

> [!CAUTION]
> **Regla de Oro de Seguridad**: Ninguna tabla en el esquema `public` de Supabase puede existir sin **Row Level Security (RLS)** activado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`). Jamás se expondrá la llave `SUPABASE_SERVICE_ROLE_KEY` ni la `GEMINI_API_KEY` en el cliente móvil/web de Expo.

---

## 1. Seguridad en Base de Datos (Supabase & PostgreSQL)

### 1.1 Row Level Security (RLS) Estricto en Todas las Tablas
Cada tabla contiene una columna `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`.
Política estándar obligatoria para todas las entidades (`profiles`, `accounts`, `transactions`, `credit_cards`, `loans`, `budgets`, `savings_goals`, `financial_instruments`, `reminders`):

```sql
-- Lectura: El usuario solo ve sus propios registros
CREATE POLICY "Users can view own records"
ON public.accounts FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Inserción: El usuario solo puede insertar registros a su propio nombre
CREATE POLICY "Users can insert own records"
ON public.accounts FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Actualización: El usuario solo modifica sus propios registros
CREATE POLICY "Users can update own records"
ON public.accounts FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Eliminación: El usuario solo elimina sus propios registros
CREATE POLICY "Users can delete own records"
ON public.accounts FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
```

### 1.2 Atomicidad Transaccional (RPC / Database Functions)
- Las operaciones que afectan múltiples registros (ej. **Transferencia entre cuentas**, **Pago de tarjeta de crédito desde cuenta bancaria**, **Desembolso o abono de préstamo**) **NO** deben ejecutarse como dos `UPDATE` separados desde el frontend.
- Deben ejecutarse mediante **Funciones PostgreSQL (`SECURITY INVOKER`)** llamadas vía `supabase.rpc('execute_account_transfer', ...)` dentro de un bloque transaccional atómico para evitar descuadres si falla la red a mitad de camino.

### 1.3 Integridad Contable y Prevención de Manipulación
- **Restricciones `CHECK`**:
  - `CHECK (amount > 0)` en transacciones, abonos y metas.
  - `CHECK (closing_day BETWEEN 1 AND 31 AND due_day BETWEEN 1 AND 31)` en tarjetas de crédito.
- **Bitácora de Auditoría (`audit_logs`)**: Trigger automático que registra cambios críticos en saldos iniciales, eliminación de cuentas o ajustes manuales de balance.

---

## 2. Seguridad en el Cliente Móvil y Web (React Native / Expo)

### 2.1 Almacenamiento Cifrado de Sesiones
- En **iOS / Android**: Uso obligatorio de `expo-secure-store` (Keychain Services en iOS con `kSecAttrAccessibleAfterFirstUnlock` y EncryptedSharedPreferences / Keystore en Android) para guardar el JWT de Supabase Auth. **Prohibido** guardar tokens en `AsyncStorage` sin cifrar.
- En **Web (Vercel)**: Uso de almacenamiento seguro en navegador con PKCE Flow habilitado en Supabase (`flowType: 'pkce'`).

### 2.2 Bloqueo Biométrico y Modo Privacidad
- **Autenticación Biométrica (`expo-local-authentication`)**: Soporte para FaceID / Huella Dactilar o PIN de 4 dígitos al abrir la app o al volver del segundo plano tras más de 60 segundos de inactividad.
- **Blur en Multitarea (App Switcher)**: Cuando la app pasa a estado `inactive` o `background`, se superpone instantáneamente una vista con `expo-blur` para ocultar los saldos bancarios en el selector de aplicaciones recientes del teléfono.
- **Botón "Ocultar Saldos" (Modo Discreto)**: Un toque en el ícono del ojo en el Dashboard enmascara todos los montos (`L ••••••`) y persiste la preferencia localmente.

---

## 3. Seguridad del Chatbot IA (Google Gemini + Edge Functions)

1. **Cero Llaves en el Frontend**: La API Key de Google Gemini reside únicamente en los secretos cifrados de **Supabase Edge Functions** (`supabase secrets set GEMINI_API_KEY=...`).
2. **Validación del JWT**: La Edge Function `ai-financial-assistant` verifica primero el token `Authorization: Bearer <user_jwt>` del usuario mediante `supabase.auth.getUser()`.
3. **Sanitización de Prompts y Prevención de Prompt Injection**:
   - El modelo de IA solo recibe un resumen estructurado del contexto financiero del usuario autenticado (saldos, categorías y presupuestos del usuario actual).
   - Las herramientas (`Function Calling`) pasan por un validador con **Zod** antes de insertar cualquier gasto, ingreso o transferencia en la base de datos.
   - Acciones destructivas (como eliminar una cuenta bancaria o borrar el historial) **están bloqueadas** en las herramientas del Chatbot; solo pueden realizarse manualmente con confirmación biométrica/PIN en la interfaz de usuario.

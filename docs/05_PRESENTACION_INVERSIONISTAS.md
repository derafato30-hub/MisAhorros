# 05. Presentación para Inversionistas (Investor Pitch Deck) — MisAhorros

---

## 1. Resumen Ejecutivo (Executive Summary)

**MisAhorros** es la súper-aplicación de inteligencia financiera personal y de micro-negocios para Latinoamérica, diseñada con una experiencia visual y ergonómica nivel **Samsung One UI**, respaldada por **Inteligencia Artificial Conversacional (Google Gemini)** y una arquitectura en la nube altamente escalable (**Expo + Supabase + Vercel**).

### El Problema en Latinoamérica
1. **Fragmentación Financiera**: Más del 68% de los profesionales y emprendedores manejan su dinero en múltiples cuentas bancarias (moneda local + dólares), efectivo, tarjetas de crédito con fechas de corte confusas y préstamos informales o bancarios sin una vista consolidada.
2. **Mezcla Peligrosa entre Finanzas Personales y Negocio**: Los dueños de pequeños negocios o freelancers mezclan el dinero de su hogar con la caja chica de su negocio, provocando falta de liquidez y sobreendeudamiento.
3. **Fricción de Registro**: Las apps tradicionales fallan porque exigen llenar formularios tediosos. El usuario abandona la app a las 2 semanas.

### La Solución: MisAhorros
- **Doble Entorno en un Toque (`Personal` ↔ `Mi Negocio`)**: Contabilidad separada con transferencias de capital o retiro de utilidades trazables al instante.
- **Copiloto Financiero con IA (Gemini Function Calling)**: El usuario habla o escribe *"Pagué L 450 de combustible con la Visa BAC"* o *"¿Cuánto puedo gastar hoy sin salirme del presupuesto quincenal?"* y la IA ejecuta el registro contable y responde al instante.
- **Dominio Financiero Completo**: Desde nómina, cuentas multi-moneda, tarjetas de crédito (control exacto de cortes y pago de contado), préstamos otorgados y recibidos con cálculo de mora, hasta Certificados de Depósito a Plazo (CDP) y Fondos de Pensión.

---

## 2. Alcance Funcional Completo (Product Scope)

| Módulo | Capacidades Incluidas | Valor Diferencial |
| :--- | :--- | :--- |
| **1. Identidad & Personalización** | Auth por Email, modo Asalariado y/o Negocio, Dark/AMOLED/Light Mode, 5 paletas de colores acento, 3 fuentes tipográficas, Multi-moneda (`HNL`, `USD`, etc.). | Adaptación total a la identidad visual y laboral de cada usuario. |
| **2. Cuentas & Libro Mayor** | Efectivo, Banco X, Banco Y, Billeteras; ingresos por nómina, regulares e irregulares; gastos categorizados con motivo; transferencias inter-cuentas e inter-perfil. | Trazabilidad exacta al centavo (`NUMERIC(15,2)`) sin descuadres. |
| **3. Tarjetas de Crédito Multi-Emisor** | Múltiples tarjetas por usuario, fechas de corte y pago, saldo al corte vs. flotante, límite disponible, alertas de corte e historial de pagos. | Evita el pago de intereses usurarios avisando el monto exacto de contado. |
| **4. Cuentas por Pagar, Deudas & Suscripciones** | Gastos fijos periódicos, control de cuotas (`Cuota X de N`), cálculo automático de intereses moratorios en caso de atraso, registro exacto del día de pago. | Visibilidad total de compromisos futuros y costo real de atrasos. |
| **5. Préstamos 360° (Recibidos y Otorgados)** | Tabla de amortización para préstamos bancarios recibidos + Cartera de cobro para préstamos que el usuario otorga a terceros con seguimiento de abonos. | Único en el mercado en gestionar tanto el pasivo bancario como los préstamos personales/comerciales por cobrar. |
| **6. Ahorros, Metas e Instrumentos Financieros** | Metas con barra de progreso, Depósitos a Plazo Fijo (CDP con cálculo de rendimiento neto), Fondos de Pensión (AFP/RAP) e inversiones. | Visión completa del Patrimonio Neto (Net Worth), no solo del efectivo diario. |
| **7. Presupuestos, Agenda & Chatbot IA** | Presupuestos diarios, semanales, quincenales y mensuales; calendario financiero con recordatorios; Chatbot Gemini que registra, configura y asesora. | Reducción del 80% en el tiempo necesario para llevar las finanzas al día. |

---

## 3. Estructura de Costos de Infraestructura y Operación (Unit Economics)

Gracias a la arquitectura **Serverless (Supabase + Vercel + Expo + Gemini Flash)**, los costos fijos iniciales son cercanos a **$0 USD/mes** durante la etapa de validación y escalan de forma lineal únicamente cuando hay ingresos por usuarios activos (MAU).

### Escenario de Costos Mensuales por Etapa de Crecimiento

| Componente Tecnológico | Etapa 1: MVP & Semilla (0 a 1,000 Usuarios Activos) | Etapa 2: Tracción (1,000 a 10,000 Usuarios Activos) | Etapa 3: Escala (10,000 a 50,000 Usuarios Activos) |
| :--- | :--- | :--- | :--- |
| **Supabase (Base de Datos, Auth, Edge Functions)** | **$0.00 / mes** (Free Tier: 50,000 MAU, 500MB DB) | **$25.00 / mes** (Pro Plan: 8GB DB, Backups diarios, 100k MAU) | **$75.00 - $120.00 / mes** (Pro + Compute Add-on) |
| **Vercel (Hosting Web App & Edge CDN)** | **$0.00 / mes** (Hobby Tier) | **$20.00 / mes** (Pro Tier, dominios ilimitados y analíticas) | **$20.00 - $40.00 / mes** (Pro Tier) |
| **Google Gemini API (`gemini-2.5-flash`)** | **$0.00 / mes** (Free Tier AI Studio) | **~$15.00 - $35.00 / mes** (Pay-as-you-go: ~$0.003 por usuario/mes) | **~$150.00 / mes** (Con caché de contexto activado) |
| **Expo EAS (Builds & Actualizaciones OTA)** | **$0.00 / mes** (Free Tier: 30 builds/mes + pruebas locales) | **$19.00 / mes** (Starter Plan para OTA Updates) | **$99.00 / mes** (Production Plan) |
| **Tiendas (Apple App Store & Google Play)** | **$0.00** en fase Web/Expo Go (Opcional: $25 único Google + $99/año Apple) | **~$10.00 / mes** (Prorrateo anual tiendas) | **~$10.00 / mes** |
| **COSTO OPERATIVO TOTAL MENSUAL** | **$0.00 USD / mes** | **~$89.00 - $109.00 USD / mes** | **~$354.00 - $419.00 USD / mes** |
| **Costo por Usuario Activo (CPU)** | **$0.000 USD** | **~$0.011 USD / usuario** | **~$0.008 USD / usuario** |

---

## 4. Modelo de Monetización Sugerido (SaaS / Freemium FinTech)

1. **Plan Gratuito (Adquisición Masiva)**:
   - Perfil Personal, hasta 3 cuentas bancarias, 1 tarjeta de crédito, presupuestos mensuales y 20 consultas al mes con el Chatbot IA.
2. **Plan MisAhorros Pro ($3.99 USD / mes o $34.99 USD / año)**:
   - Cuentas y tarjetas ilimitadas, Multi-moneda automático, Instrumentos de Inversión (CDP/Pensiones), Préstamos otorgados/recibidos ilimitados y Chatbot IA ilimitado por voz y texto.
3. **Plan MisAhorros Business ($6.99 USD / mes)**:
   - Desbloquea el entorno completo **Mi Negocio** (flujo de caja comercial, cuentas por pagar a proveedores, cartera de cobro a clientes, reportes exportables en PDF/Excel).

> [!NOTE]
> **Punto de Equilibrio (Break-Even Point)**: En la Etapa 2 (costo operativo de ~$99 USD/mes), bastan únicamente **25 suscriptores Pro** (el 0.25% de 10,000 usuarios) para cubrir el 100% de la infraestructura mundial de la plataforma. Marjen bruto de software estimado: **> 92%**.

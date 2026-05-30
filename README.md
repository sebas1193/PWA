# Caship — Gestión de Finanzas Personales

Caship es una Progressive Web App (PWA) construida con **Ionic + React + Capacitor + Firebase** que te permite llevar el control de tus finanzas personales de forma sencilla, rápida y sin depender de conexión a internet.

Puedes agrupar tus movimientos por cuenta y categoría, tomar foto de un comprobante para registrar una transacción automáticamente (OCR vía OpenAI Vision), guardar la ubicación de cada compra y seguir usando la app aunque no tengas señal — los datos se sincronizan en cuanto vuelves a conectarte.

---

## Prototipo (Lovable)

El prototipo visual fue construido con **Lovable** y sirvió como referencia de diseño para la implementación en Ionic:

[Ver prototipo en Lovable](https://preview--cool-cash-charts.lovable.app/?__lovable_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9%2EeyJ1c2VyX2lkIjoiaVNETnhxWkdFd2IxaUdkVkExMk82R2g3M1V5MSIsInByb2plY3RfaWQiOiJhNDcwNzc4Zi02YThkLTQ5MGYtYjBmNi02ZTBjNjkyMWU4NzEiLCJhY2Nlc3NfdHlwZSI6InByb2plY3QiLCJpc3MiOiJsb3ZhYmxlLWFwaSIsInN1YiI6ImE0NzA3NzhmLTZhOGQtNDkwZi1iMGY2LTZlMGM2OTIxZTg3MSIsImF1ZCI6WyJsb3ZhYmxlLWFwcCJdLCJleHAiOjE3ODA4MDI3NTYsIm5iZiI6MTc4MDE5Nzk1NiwiaWF0IjoxNzgwMTk3OTU2fQ%2EixOXv-OyDWPy5WCyhadlxLEzr2d2YMTJOIjLjn6kakNsOszRJGS9urPhiY-DyeK0-jtPANRfJCQl8poo7Ntl8Hf6QndpdMJgY-GCr7AwpFcuKz33QzjtGzgWOut8Vds6caIObFVbZZ3390YsVFg_loKUibttsG4DdQTDryAHQJE1lH7trfh9VcFx0SsayTKn70fqcB-fGpDw6XZ0KvgjDHgWLNxCob6Ip8366mZw1SeodVKLgajtoFOmINPwVZYymw7F216DRIr3bGxSzuIfuHR0w-_nFzT14MkE4j2GMlN-cYWBmCBgtSh8B19FouX_zOWxJk08qbqXUZsr5xTdHaiSmaQy_RhikQINl18m3o_O3wGnzpvO9zbedLaO_8WsfA1caUKu_iQAx7ERQLCRTkXis7Je3ac0122vNrdpcy5wky6zVyUOQMt262IhRNkmuAxzMYj_CmxhDKLNQVGfHd8-G7B3i1CLB3JHy3yHjUOT5yPK5Ypz_a7CmoD_ze6jm57J0H5zRGl9jP3yvYGneZnDiYW-X47cvCT6gjyVRhnahcvIc0ePuxPY7-wxzjCVrCnaqCGJohXfRgLBqfFGXkCbzNxNADiaEFPmCGf_r5wcrPPtwxYDuezFnJ9bslQu9_F0nrSzM9Q0-mLR9rdA9v4ks4G0iqkTkkpgsLjHm8A)

---

## APIs de backend consumidas

| API | Propósito |
|---|---|
| **OpenAI Vision API** (`gpt-4o`) | Recibe la foto de un comprobante y devuelve un JSON con monto, descripción, fecha y categoría sugerida, que se precarga automáticamente en el formulario de transacción. Implementado en `vision.service.ts`. |
| **Geolocation API** (`@capacitor/geolocation`) | Captura la coordenada GPS (latitud/longitud) en el momento de registrar una transacción, para contextualizar el lugar de la compra. |

---

## Alcance del sistema

| Módulo | Estado |
|---|---|
| Autenticación con email/contraseña | ✅ Implementado |
| Autenticación con Google | ✅ Implementado |
| Registro de usuario (perfil en Firestore) | ✅ Implementado |
| Gestión de cuentas (nombre + moneda) | ✅ Implementado |
| Categorías globales (precargadas) | ✅ Implementado |
| Categorías propias por usuario | ✅ Implementado |
| Registro de transacciones (ingreso/egreso) | ✅ Implementado |
| Actualización atómica de saldo por transacción | ✅ Implementado |
| Captura de ubicación GPS por transacción | ✅ Implementado |
| Captura de foto del comprobante | ✅ Implementado |
| OCR automático de comprobantes vía OpenAI Vision API | ✅ Implementado |
| Almacenamiento offline con UUID + sincronización automática | ✅ Implementado |
| Indicador de estado de red (online/offline) | ✅ Implementado |
| Subida de imágenes a Firebase Storage | 🔜 Pendiente |
| Diseño visual / estilos UI | 🔜 En progreso |
| Notificaciones push por inactividad (24 h) | 🔜 Próxima implementación |

---

## Stack tecnológico

- **Framework:** Ionic 8 + React 19
- **Runtime nativo:** Capacitor 8
- **Auth y DB:** Firebase Authentication + Cloud Firestore
- **Offline:** Firestore IndexedDB persistence + `@capacitor/network`
- **UUID offline:** `crypto.randomUUID()` generado en cliente — los registros se crean localmente con un ID único mientras no hay conexión y se sincronizan automáticamente con Firestore en cuanto se recupera la red, sin pérdida de datos
- **Cámara:** `@capacitor/camera`
- **GPS:** `@capacitor/geolocation`
- **OCR / LLM:** OpenAI Vision API (`gpt-4o`)
- **Lenguaje:** TypeScript

---

## Estructura del proyecto

```
caship/
├── src/
│   ├── integrations/
│   │   └── firebase.ts              # Init Firebase + persistencia offline
│   ├── types/
│   │   └── index.ts                 # Interfaces TypeScript
│   ├── constants/
│   │   └── collections.ts           # Nombres de colecciones Firestore
│   ├── database/
│   │   └── database.sql             # Guía de schema relacional — solo referencia
│   │                                # para entender el modelo de datos; la base de
│   │                                # datos real es Firestore (NoSQL)
│   ├── Hooks/
│   │   ├── useAuth.tsx              # Login email/Google, signUp, signOut + AuthProvider
│   │   └── useNetwork.ts            # Estado online/offline en tiempo real
│   ├── Helpers/
│   │   ├── format.ts                # Funciones de formato (moneda, fechas, etc.)
│   │   └── seed.ts                  # Seed de monedas y categorías globales
│   ├── services/
│   │   ├── firestore.service.ts     # CRUD: usuarios, monedas, categorías, cuentas, transacciones
│   │   └── vision.service.ts        # Integración OpenAI Vision API — extrae JSON de comprobantes
│   ├── Routes/
│   │   ├── AppRoutes.tsx            # Raíz: decide entre login y app según auth
│   │   ├── PublicRoutes.tsx         # /login, /register (rutas sin sesión)
│   │   └── UserRoutes.tsx           # Rutas protegidas (requieren sesión)
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login/
│   │   │   │   └── Index.tsx        # Formulario email+pass + botón Google
│   │   │   └── Register/
│   │   │       └── Index.tsx        # Formulario de registro
│   │   ├── Dashboard/
│   │   │   └── Index.tsx            # Lista de cuentas + indicador de red
│   │   ├── Accounts/
│   │   │   └── Index.tsx            # Crear y listar cuentas
│   │   ├── Categories/
│   │   │   └── Index.tsx            # Categorías globales + propias del usuario
│   │   └── Transactions/
│   │       ├── Index.tsx            # Lista de transacciones por cuenta
│   │       ├── AddTransaction.tsx   # Nueva transacción (foto OCR + GPS)
│   │       └── EditTransaction.tsx  # Editar transacción existente
│   ├── components/                  # Componentes compartidos (en desarrollo)
│   ├── theme/
│   │   └── variables.css            # Tokens de diseño y override de variables Ionic
│   └── App.tsx                      # Raíz de la app con providers
├── firestore.rules                  # Reglas de seguridad Firestore
├── capacitor.config.ts
├── vite.config.ts
├── .env                             # Variables de Firebase (no se sube a git)
└── package.json
```

> **Nota sobre `database.sql`:** el archivo SQL define el schema del modelo de datos en términos relacionales y sirve únicamente como guía de referencia para entender las entidades y sus relaciones. La persistencia real de la aplicación se realiza en **Cloud Firestore** (NoSQL); no se usa ningún motor SQL en producción.

---

## Comandos

### Clonar el proyecto

```bash
git clone <url-del-repositorio>
cd ProgresiveWebApp-PWA/caship
npm install
```

Crea el archivo `.env` en `caship/` con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Correr en desarrollo (web)

```bash
cd caship
ionic serve
```

Abre automáticamente en `http://localhost:8100`.

### Subir cambios al repositorio

```bash
git add .
git commit -m "descripción del cambio"
git push origin <tu-rama>
```

### Compilar para producción

```bash
cd caship
ionic build
```

Genera el bundle en `caship/dist/`.

### Correr en Android por cable USB (depuración)

> Requisitos: Android Studio instalado, USB Debugging activado en el dispositivo.

```bash
# 1. Compilar el bundle web
cd caship
ionic build

# 2. Sincronizar con el proyecto Android nativo
npx cap sync android

# 3. Añadir la plataforma Android si es la primera vez
npx cap add android

# 4. Correr directamente en el dispositivo conectado
npx cap run android

# O abrir Android Studio para controlar el deploy manualmente
npx cap open android
```

Para desarrollo con recarga en vivo en el dispositivo físico:

```bash
ionic cap run android --livereload --external
```

---

## Próximas implementaciones

- **Notificaciones push de inactividad:** enviar una notificación push al usuario si no se registra ninguna transacción en las últimas 24 horas, como recordatorio para mantener el registro de movimientos al día. Se implementaría con Firebase Cloud Messaging (FCM) y un Cloud Function que evalúe la última transacción del usuario cada día.
- **Subida de imágenes:** integrar Firebase Storage para guardar la foto del comprobante y almacenar la URL real en el campo `url_imagen` de la transacción.
- **Reportes y estadísticas:** consultas Firestore para calcular totales por categoría, por período y balance general.
- **Exportación de datos:** generar CSV o PDF con el historial de transacciones.
- **Eliminación de transacciones:** soft-delete con reversión atómica del saldo.
- **Paginación de transacciones:** cursores Firestore (`startAfter`) para no cargar todos los registros de golpe.
- **Presupuestos:** definir límites de gasto por categoría y alertar cuando se superen.

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key del proyecto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID para notificaciones |
| `VITE_FIREBASE_APP_ID` | ID de la app web en Firebase |
| `VITE_OPENAI_API_KEY` | API Key de OpenAI para el servicio de OCR de comprobantes |

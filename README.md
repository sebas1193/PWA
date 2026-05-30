# Caship — Gestión de Finanzas Personales

Caship es una Progressive Web App (PWA) construida con **Ionic + React + Capacitor + Firebase** que te permite llevar el control de tus finanzas personales de forma sencilla, rápida y sin depender de conexión a internet.

Puedes agrupar tus movimientos por cuenta y categoría, tomar foto de un comprobante para registrar una transacción automáticamente (OCR vía LLM), guardar la ubicación de cada compra y seguir usando la app aunque no tengas señal — los datos se sincronizan en cuanto vuelves a conectarte.

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
| Funcionamiento offline con sincronización automática | ✅ Implementado |
| Indicador de estado de red (online/offline) | ✅ Implementado |
| OCR automático de comprobantes vía API LLM | 🔜 Pendiente (punto de integración listo) |
| Subida de imágenes a Storage | 🔜 Pendiente |
| Diseño visual / estilos UI | 🔜 En progreso |

---

## Stack tecnológico

- **Framework:** Ionic 8 + React 19
- **Runtime nativo:** Capacitor 8
- **Auth y DB:** Firebase Authentication + Cloud Firestore
- **Offline:** Firestore IndexedDB persistence + `@capacitor/network`
- **UUID offline:** `crypto.randomUUID()` generado en cliente
- **Cámara:** `@capacitor/camera`
- **GPS:** `@capacitor/geolocation`
- **Lenguaje:** TypeScript

---

## Estructura del proyecto

```
caship/
├── src/
│   ├── integrations/
│   │   └── firebase.ts              # Init Firebase + persistencia offline
│   ├── types/
│   │   └── index.ts                 # Interfaces TypeScript (mapeo del schema SQL)
│   ├── constants/
│   │   └── collections.ts           # Nombres de colecciones Firestore
│   ├── Hooks/
│   │   ├── useAuth.tsx              # Login email/Google, signUp, signOut
│   │   └── useNetwork.ts            # Estado online/offline en tiempo real
│   ├── Helpers/
│   │   └── seed.ts                  # Seed de monedas y categorías globales
│   ├── services/
│   │   └── firestore.service.ts     # CRUD: usuarios, monedas, categorías, cuentas, transacciones
│   ├── Routes/
│   │   ├── AppRoutes.tsx            # Raíz: decide entre login y app según auth
│   │   ├── PublicRoutes.tsx         # /login, /register
│   │   └── UserRoutes.tsx           # Rutas protegidas (requieren sesión)
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login/Login.tsx      # Formulario email+pass + botón Google
│   │   │   └── Register/Register.tsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx        # Lista de cuentas + indicador red
│   │   ├── Accounts/
│   │   │   └── Accounts.tsx         # Crear y listar cuentas
│   │   ├── Categories/
│   │   │   └── Categories.tsx       # Categorías globales + propias
│   │   └── Transactions/
│   │       ├── Transactions.tsx     # Lista de transacciones por cuenta
│   │       └── AddTransaction.tsx   # Nueva transacción (foto + GPS)
│   ├── components/                  # Componentes compartidos (en desarrollo)
│   ├── theme/
│   │   └── variables.css
│   └── App.tsx
├── firestore.rules                  # Reglas de seguridad Firestore
├── capacitor.config.ts
├── vite.config.ts
├── .env                             # Variables de Firebase (no se sube a git)
└── package.json
```

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

## Posibles mejoras (backend / lógica)

- **OCR automático:** conectar `AddTransaction.tsx` con una API LLM (OpenAI Vision, Google Gemini, etc.) para extraer monto, descripción y fecha de la foto del comprobante.
- **Subida de imágenes:** integrar Firebase Storage para guardar la foto del comprobante y almacenar la URL real en el campo `url_imagen` de la transacción.
- **Reportes y estadísticas:** agregar consultas Firestore para calcular totales por categoría, por período, y balance general del usuario.
- **Exportación de datos:** generar CSV o PDF con el historial de transacciones.
- **Chat / notificaciones en tiempo real:** usar `onSnapshot` de Firestore para escuchar cambios en tiempo real en cuentas y transacciones.
- **Múltiples usuarios / grupos:** permitir cuentas compartidas entre usuarios.
- **Presupuestos:** definir límites de gasto por categoría y alertar cuando se superen.
- **Eliminación de transacciones:** agregar soft-delete en transacciones y reversión del saldo.
- **Paginación de transacciones:** usar cursores de Firestore (`startAfter`) para no cargar todos los registros de golpe.

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


Link a demo en lovable: https://preview--cool-cash-charts.lovable.app/?__lovable_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9%2EeyJ1c2VyX2lkIjoiaVNETnhxWkdFd2IxaUdkVkExMk82R2g3M1V5MSIsInByb2plY3RfaWQiOiJhNDcwNzc4Zi02YThkLTQ5MGYtYjBmNi02ZTBjNjkyMWU4NzEiLCJhY2Nlc3NfdHlwZSI6InByb2plY3QiLCJpc3MiOiJsb3ZhYmxlLWFwaSIsInN1YiI6ImE0NzA3NzhmLTZhOGQtNDkwZi1iMGY2LTZlMGM2OTIxZTg3MSIsImF1ZCI6WyJsb3ZhYmxlLWFwcCJdLCJleHAiOjE3ODA4MDI3NTYsIm5iZiI6MTc4MDE5Nzk1NiwiaWF0IjoxNzgwMTk3OTU2fQ%2EixOXv-OyDWPy5WCyhadlxLEzr2d2YMTJOIjLjn6kakNsOszRJGS9urPhiY-DyeK0-jtPANRfJCQl8poo7Ntl8Hf6QndpdMJgY-GCr7AwpFcuKz33QzjtGzgWOut8Vds6caIObFVbZZ3390YsVFg_loKUibttsG4DdQTDryAHQJE1lH7trfh9VcFx0SsayTKn70fqcB-fGpDw6XZ0KvgjDHgWLNxCob6Ip8366mZw1SeodVKLgajtoFOmINPwVZYymw7F216DRIr3bGxSzuIfuHR0w-_nFzT14MkE4j2GMlN-cYWBmCBgtSh8B19FouX_zOWxJk08qbqXUZsr5xTdHaiSmaQy_RhikQINl18m3o_O3wGnzpvO9zbedLaO_8WsfA1caUKu_iQAx7ERQLCRTkXis7Je3ac0122vNrdpcy5wky6zVyUOQMt262IhRNkmuAxzMYj_CmxhDKLNQVGfHd8-G7B3i1CLB3JHy3yHjUOT5yPK5Ypz_a7CmoD_ze6jm57J0H5zRGl9jP3yvYGneZnDiYW-X47cvCT6gjyVRhnahcvIc0ePuxPY7-wxzjCVrCnaqCGJohXfRgLBqfFGXkCbzNxNADiaEFPmCGf_r5wcrPPtwxYDuezFnJ9bslQu9_F0nrSzM9Q0-mLR9rdA9v4ks4G0iqkTkkpgsLjHm8A
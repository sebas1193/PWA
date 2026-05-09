# Task Manager — Ionic 8 + React + Capacitor

Aplicación de gestión de tareas construida con Ionic 8, React 19 y Capacitor 8. Soporta despliegue como **PWA** (web) y como **app nativa Android** via Capacitor.

---

## Requisitos previos

| Herramienta | Versión mínima | Para qué |
|---|---|---|
| Node.js | 18+ | Todo |
| npm | 9+ | Todo |
| Android Studio | Ladybug (2024.1.1) | Build Android |
| JDK | 17+ | Build Android |

---

## Instalación y desarrollo local

```bash
# Entrar al proyecto
cd contacts

# Instalar dependencias
npm install

# Levantar servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Despliegue como PWA (web)

### 1. Compilar el proyecto

```bash
npm run build
```

Genera la carpeta `dist/` con todos los archivos estáticos listos para producción.

### 2. Subir a un hosting

La carpeta `dist/` se puede subir a cualquier hosting estático. **Debe ser HTTPS** para que el navegador permita instalarla como PWA.

**Opciones recomendadas:**

**Netlify** (drag & drop):
1. Entrar a [netlify.com](https://netlify.com)
2. Arrastrar la carpeta `dist/` al panel de Netlify

**Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting        # webDir → dist
firebase deploy
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

> **Nota sobre Service Worker:** Para que Chrome muestre el botón "Instalar app", el sitio necesita un service worker registrado. Instalarlo es opcional:
> ```bash
> npm install -D vite-plugin-pwa
> ```
> Luego configurarlo en `vite.config.ts`. Sin él, la app funciona en el navegador pero no aparece la opción de instalar en pantalla de inicio.

---

## Build para Android (Capacitor)

### Primera vez — agregar la plataforma Android

```bash
# 1. Instalar el paquete Android de Capacitor (solo se hace una vez)
npm install @capacitor/android

# 2. Compilar la app web
npm run build

# 3. Registrar la plataforma Android en el proyecto (solo se hace una vez)
npx cap add android

# 4. Sincronizar el build con el proyecto nativo
npx cap sync

# 5. Abrir en Android Studio
npx cap open android
```

Android Studio se abre con el proyecto listo. Desde ahí:
- **Ejecutar en emulador o dispositivo:** botón ▶ Run
- **Generar APK:** `Build → Build Bundle(s) / APK(s) → Build APK(s)`
- **Generar AAB para Play Store:** `Build → Generate Signed Bundle / APK`

### Actualizaciones posteriores

Cada vez que modifiques el código web:

```bash
npm run build       # recompilar
npx cap sync        # sincronizar cambios al proyecto nativo
```

No hace falta volver a ejecutar `cap add android`.

### Referencia rápida de comandos Capacitor

| Comando | Qué hace |
|---|---|
| `npx cap add android` | Crea el proyecto Android (primera vez) |
| `npx cap sync` | Copia `dist/` al proyecto nativo y actualiza plugins |
| `npx cap copy android` | Solo copia `dist/`, no actualiza plugins |
| `npx cap open android` | Abre Android Studio |
| `npx cap run android` | Compila y corre en dispositivo/emulador directamente |

---

## Estructura del proyecto

```
contacts/
├── src/
│   ├── types/
│   │   └── task.ts              # Interfaz Task
│   ├── components/
│   │   ├── AddTaskForm.tsx      # Formulario para agregar tareas
│   │   ├── TaskList.tsx         # Lista de tareas
│   │   └── TaskItem.tsx         # Ítem individual con checkbox y delete
│   ├── pages/
│   │   └── Home.tsx             # Página principal — estado y efectos
│   ├── App.tsx                  # Configuración de rutas
│   └── main.tsx                 # Punto de entrada
├── public/
│   └── manifest.json            # Metadatos PWA
├── capacitor.config.ts          # Configuración Capacitor (appId, webDir)
└── vite.config.ts               # Configuración del bundler
```

---

## Scripts disponibles

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción → dist/
npm run preview    # previsualizar el build localmente
npm run lint       # ejecutar ESLint
npm run test.unit  # tests unitarios con Vitest
npm run test.e2e   # tests e2e con Cypress
```

# Sensors App — Ionic + Capacitor

Aplicación móvil/PWA desarrollada con **Ionic React** y **Capacitor** que demuestra el uso de los principales sensores y APIs nativas del dispositivo.

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| Ionic React | 8.x |
| Capacitor | 7.x |
| React | 18.x |
| Vite | 5.x |
| TypeScript | 5.x |

---

## Estructura del proyecto

```
src/
├── App.tsx                        ← Routing principal (IonReactRouter)
├── main.tsx                       ← Entry point
├── theme/
│   └── variables.css              ← Variables de color Ionic
└── pages/
    ├── Home.tsx                   ← Menú con botón por cada sensor
    ├── GeolocationPage.tsx        ← GPS y coordenadas
    ├── CameraPage.tsx             ← Cámara y galería
    ├── MotionPage.tsx             ← Acelerómetro y giroscopio
    ├── DevicePage.tsx             ← Info del dispositivo y batería
    ├── HapticsPage.tsx            ← Vibración y retroalimentación táctil
    ├── FilesystemPage.tsx         ← Leer y escribir archivos
    ├── LocalNotificationsPage.tsx ← Notificaciones programadas
    └── PushNotificationsPage.tsx  ← Notificaciones remotas (FCM/APNs)
```

---

## Sensores implementados

### 1. Geolocalización (`@capacitor/geolocation`)
Obtiene la posición actual del dispositivo: latitud, longitud, altitud y precisión.

### 2. Cámara (`@capacitor/camera`)
Permite tomar fotos con la cámara del dispositivo o seleccionar imágenes desde la galería. Retorna la imagen en formato Data URL.

### 3. Motion (`@capacitor/motion`)
Escucha en tiempo real el acelerómetro (eje X, Y, Z en m/s²) y la orientación del dispositivo (alpha, beta, gamma en grados).

### 4. Device (`@capacitor/device`)
Lee información estática del dispositivo: plataforma, sistema operativo, fabricante, modelo, nivel de batería e idioma.

### 5. Haptics (`@capacitor/haptics`)
Controla la retroalimentación táctil: impacto (fuerte/medio/suave), notificación (éxito/advertencia/error), vibración y feedback de selección.

### 6. Filesystem (`@capacitor/filesystem`)
Escribe, lee y elimina archivos de texto en el directorio `Documents` del dispositivo.

### 7. Notificaciones Locales (`@capacitor/local-notifications`)
Programa notificaciones locales con título, mensaje y retraso en segundos. Permite cancelar notificaciones pendientes.

### 8. Push Notifications (`@capacitor/push-notifications`)
Registra el dispositivo para recibir notificaciones remotas y muestra el token FCM/APNs generado. Requiere configuración de servidor backend.

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Correr en el navegador
ionic serve

# Compilar para producción
npm run build

# Agregar plataforma nativa
npx cap add android
npx cap add ios

# Sincronizar con plataforma nativa
npx cap sync
```

---

## Notas importantes

- **Motion** y **Haptics** requieren dispositivo físico para funcionar completamente; en el navegador tienen soporte limitado.
- **Push Notifications** requiere configurar Firebase Cloud Messaging (Android) o APNs (iOS) junto con un servidor backend que envíe los mensajes.
- **Local Notifications** funcionan en dispositivo nativo; en web el navegador muestra la notificación del sistema.
- Los permisos (cámara, ubicación, notificaciones) deben ser aceptados por el usuario en tiempo de ejecución.

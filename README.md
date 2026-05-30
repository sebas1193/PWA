# Maps Ionic — Ionic + Capacitor + Leaflet

Aplicación móvil/PWA desarrollada con **Ionic React**, **Capacitor** y **Leaflet** que integra múltiples sensores del dispositivo para ofrecer seguimiento GPS inteligente, cámara con geolocalización y notificaciones contextuales.

---

## Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| Ionic React | 8.x | UI y componentes |
| Capacitor | 7.x | Acceso a sensores nativos |
| Leaflet + react-leaflet | 1.9 / 4.x | Renderizado del mapa |
| OpenCage API | v1 | Geocodificación inversa y lugares cercanos |
| React | 18.x | Framework base |
| Vite | 5.x | Bundler |
| TypeScript | 5.x | Tipado estático |

---

## Estructura del proyecto

```
src/
├── config.ts                          ← API keys y constantes globales
├── App.tsx                            ← Routing con IonTabs (3 pestañas)
├── main.tsx                           ← Entry point + fix de iconos Leaflet
├── types/
│   └── tracking.types.ts             ← TrackingSession, TrackingPoint, NearbyPlace
├── services/
│   ├── filesystem.service.ts         ← Guardar/cargar/eliminar sesiones en JSON
│   ├── opencage.service.ts           ← Geocodificación inversa + lugares cercanos
│   └── notifications.service.ts     ← Programar notificaciones locales
├── hooks/
│   ├── useNetwork.ts                 ← Estado de red (wifi/celular/sin conexión)
│   ├── useBattery.ts                 ← Nivel y estado de carga de la batería
│   └── useMotion.ts                  ← Detección de movimiento por acelerómetro
├── utils/
│   ├── geo.ts                        ← Haversine, distancia, velocidad, duración
│   └── watermark.ts                  ← Marca de agua GPS sobre foto (Canvas API)
├── pages/
│   ├── MapPage.tsx                   ← Mapa principal con todas las integraciones
│   ├── HistoryPage.tsx               ← Historial de rutas agrupado por día
│   └── CameraPage.tsx                ← Cámara con marca de agua de ubicación
└── theme/
    ├── variables.css                 ← Variables de color Ionic
    └── map.css                       ← Estilos del mapa y animaciones
```

---

## Funcionalidades

### 🗺️ Mapa (MapPage)
- Mapa interactivo con OpenStreetMap (Leaflet) — sin costo, sin API key
- Muestra la posición actual con un marcador animado (pulso)
- Traza la ruta GPS en tiempo real como polilínea azul
- Muestra lugares cercanos (marcadores amarillos) desde OpenCage/Nominatim
- Barra de estado con: dirección actual, velocidad, distancia recorrida, tiempo activo
- Indicadores de red (WiFi/celular/sin conexión) y batería en el header

### 📡 Sensores integrados

| Sensor | Plugin | Función |
|---|---|---|
| GPS | `@capacitor/geolocation` | Seguimiento de ruta en tiempo real |
| Acelerómetro | `@capacitor/motion` | Detectar si el teléfono está en movimiento o quieto |
| Red | `@capacitor/network` | Verificar tipo de conexión |
| Batería | `@capacitor/device` | Detener el seguimiento si la batería baja del 20% |
| Haptics | `@capacitor/haptics` | Vibración al iniciar el seguimiento |
| Filesystem | `@capacitor/filesystem` | Guardar sesiones como JSON en el dispositivo |
| Local Notifications | `@capacitor/local-notifications` | Notificaciones inteligentes durante el seguimiento |

### 🔔 Notificaciones inteligentes
Se evalúan cada 60 segundos durante el seguimiento activo:

- **Sin movimiento 5+ min** → "Llevas más de 5 minutos sin moverte. ¿Pausar el seguimiento?"
- **Sin conexión** → "No hay internet. El mapa y las direcciones pueden no actualizarse."
- **Velocidad > 43 km/h** → "Velocidad alta detectada. ¿Estás en un vehículo?"
- **Batería < 20%** → El seguimiento se detiene automáticamente y notifica al usuario.

### 📂 Historial (HistoryPage)
- Lista de todas las sesiones de seguimiento guardadas
- Agrupadas por día con formato de fecha en español
- Cada sesión muestra: horario, distancia total, duración y velocidad máxima
- Botón **"Ver ruta"** despliega un mini-mapa con la polilínea de la ruta
- Botón de eliminar con confirmación (alerta de seguridad)
- Pull-to-refresh para recargar el historial

### 📷 Cámara con ubicación (CameraPage)
- Toma foto o selecciona desde galería
- Obtiene la posición GPS actual en paralelo
- Añade una **marca de agua** con coordenadas y dirección usando Canvas API
- Previsualización de la foto resultante
- Botón para descargar la foto con la marca aplicada

### 🌐 OpenCage API
- **Geocodificación inversa**: convierte coordenadas en dirección legible
- **Lugares cercanos**: muestra hasta 8 puntos de interés próximos en el mapa
- **Fallback automático**: si no hay API key configurada, usa Nominatim (OpenStreetMap) de forma gratuita

---

## Instalación y configuración

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

### Configurar API Key de OpenCage

Edita `src/config.ts` y reemplaza el placeholder:

```typescript
// Obtén tu API key gratuita en https://opencagedata.com/
// Tier gratuito: 2500 solicitudes/día
export const OPENCAGE_API_KEY = 'TU_API_KEY_AQUI';
```

> Sin API key, la app usa Nominatim (OpenStreetMap) como fallback automático — todas las funciones siguen operando.

---

## Notas importantes

- El **acelerómetro** y los **haptics** funcionan plenamente en dispositivos físicos iOS/Android; en navegador tienen soporte limitado.
- Las **notificaciones locales** requieren que el usuario acepte el permiso al iniciar el primer seguimiento.
- El **filesystem** guarda las sesiones en el directorio `Documents` del dispositivo como `maps_sessions.json`.
- En navegador web, el **GPS** puede ser menos preciso que en dispositivo nativo.

import { useEffect, useRef, useState } from 'react';
import {
  IonBadge, IonButton, IonCard, IonCardContent, IonChip, IonContent,
  IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonSpinner,
  IonText, IonTitle, IonToolbar,
} from '@ionic/react';
import {
  locationOutline, navigateOutline, stopCircleOutline, wifiOutline,
  batteryHalfOutline, walkOutline, carOutline, storefrontOutline,
} from 'ionicons/icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { useNetwork } from '../hooks/useNetwork';
import { useBattery } from '../hooks/useBattery';
import { useMotion } from '../hooks/useMotion';
import { reverseGeocode, getNearbyPlaces } from '../services/opencage.service';
import { saveSession } from '../services/filesystem.service';
import { notify, requestNotifPermission } from '../services/notifications.service';
import { totalDistance, formatDistance, formatDuration, formatSpeed } from '../utils/geo';
import type { TrackingPoint, TrackingSession, NearbyPlace } from '../types/tracking.types';
import { LOW_BATTERY_THRESHOLD, STILL_ALERT_MS, FAST_SPEED_MS } from '../config';

// Moves Leaflet map center imperatively when currentPos changes
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
  return null;
};

const nearbyIcon = L.divIcon({ className: '', html: '<div class="nearby-dot"></div>', iconSize: [10, 10] });
const pulseIcon = L.divIcon({ className: '', html: '<div class="pulse-dot"></div>', iconSize: [14, 14] });

const MapPage: React.FC = () => {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('Obteniendo ubicación…');
  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const [tracking, setTracking] = useState(false);
  const [trackPoints, setTrackPoints] = useState<TrackingPoint[]>([]);
  const [speed, setSpeed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [loadingPos, setLoadingPos] = useState(true);

  const watchId = useRef<string | null>(null);
  const sessionRef = useRef<Omit<TrackingSession, 'points' | 'totalDistance' | 'maxSpeed' | 'endTime'> | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMovedRef = useRef<number>(Date.now());
  const trackPointsRef = useRef<TrackingPoint[]>([]);

  const network = useNetwork();
  const battery = useBattery(30000);
  const { isMoving } = useMotion();

  // Keep ref in sync so intervals can access latest points without stale closure
  useEffect(() => { trackPointsRef.current = trackPoints; }, [trackPoints]);

  // Update last-moved timestamp when motion sensor detects movement
  useEffect(() => {
    if (isMoving) lastMovedRef.current = Date.now();
  }, [isMoving]);

  // Auto-stop tracking on low battery
  useEffect(() => {
    if (tracking && battery.level < LOW_BATTERY_THRESHOLD && !battery.isCharging) {
      notify('🔋 Batería baja', `Seguimiento detenido — batería al ${Math.round(battery.level * 100)}%`);
      stopTracking();
    }
  }, [battery.level, battery.isCharging, tracking]);

  // Get initial position on mount
  useEffect(() => {
    Geolocation.getCurrentPosition({ enableHighAccuracy: true })
      .then(pos => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCurrentPos(latlng);
        setLoadingPos(false);
        refreshAddress(latlng[0], latlng[1]);
        refreshNearby(latlng[0], latlng[1]);
      })
      .catch(() => setLoadingPos(false));

    return () => { cleanupTracking(); };
  }, []);

  const refreshAddress = async (lat: number, lng: number) => {
    const a = await reverseGeocode(lat, lng);
    setAddress(a);
  };

  const refreshNearby = async (lat: number, lng: number) => {
    const places = await getNearbyPlaces(lat, lng);
    setNearby(places);
  };

  const startTracking = async () => {
    await requestNotifPermission();
    await Haptics.impact({ style: ImpactStyle.Heavy });

    const now = Date.now();
    sessionRef.current = {
      id: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      startTime: now,
      startAddress: address,
    };
    setTrackPoints([]);
    trackPointsRef.current = [];
    lastMovedRef.current = now;
    setElapsed(0);
    setTracking(true);

    // GPS watch
    watchId.current = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 10000 }, (pos) => {
      if (!pos) return;
      const pt: TrackingPoint = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: pos.timestamp,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed ?? 0,
      };
      setCurrentPos([pt.lat, pt.lng]);
      setSpeed(pt.speed);
      setTrackPoints(prev => [...prev, pt]);
    });

    // Elapsed timer
    elapsedTimerRef.current = setInterval(() => setElapsed(Date.now() - now), 1000);

    // Smart notification checks every 60 s
    notifTimerRef.current = setInterval(() => runSmartChecks(), 60000);
  };

  const stopTracking = async () => {
    cleanupTracking();
    setTracking(false);

    const pts = trackPointsRef.current;
    const session = sessionRef.current;
    if (session && pts.length > 1) {
      const finalSession: TrackingSession = {
        ...session,
        endTime: Date.now(),
        points: pts,
        totalDistance: totalDistance(pts),
        maxSpeed: Math.max(...pts.map(p => p.speed)),
      };
      await saveSession(finalSession);
    }
  };

  const cleanupTracking = () => {
    if (watchId.current) { Geolocation.clearWatch({ id: watchId.current }); watchId.current = null; }
    if (notifTimerRef.current) { clearInterval(notifTimerRef.current); notifTimerRef.current = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
  };

  const runSmartChecks = () => {
    const pts = trackPointsRef.current;

    // 1. Stationary for too long
    if (Date.now() - lastMovedRef.current > STILL_ALERT_MS) {
      notify('🧍 Sin movimiento', 'Llevas más de 5 minutos sin moverte. ¿Pausar el seguimiento?');
      lastMovedRef.current = Date.now(); // reset to avoid spam
    }

    // 2. No network
    if (!network.connected) {
      notify('📡 Sin conexión', 'No hay internet. El mapa y las direcciones pueden no actualizarse.');
    }

    // 3. Moving very fast
    if (pts.length > 0 && pts[pts.length - 1].speed > FAST_SPEED_MS) {
      notify('🚗 Velocidad alta', `Velocidad: ${formatSpeed(pts[pts.length - 1].speed)}. ¿Estás en un vehículo?`);
    }
  };

  const networkColor = network.connected ? (network.connectionType === 'wifi' ? 'success' : 'warning') : 'danger';
  const batteryPct = Math.round(battery.level * 100);
  const batteryColor = batteryPct < 20 ? 'danger' : batteryPct < 50 ? 'warning' : 'success';
  const trackDist = totalDistance(trackPoints);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Maps Ionic</IonTitle>
          <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 12 }}>
            <IonBadge color={networkColor}>
              <IonIcon icon={wifiOutline} /> {network.connectionType}
            </IonBadge>
            <IonBadge color={batteryColor}>
              <IonIcon icon={batteryHalfOutline} /> {batteryPct}%
            </IonBadge>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* MAP */}
        <div className="map-container">
          {loadingPos ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <IonSpinner name="crescent" />
            </div>
          ) : currentPos ? (
            <MapContainer center={currentPos} zoom={16} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              />
              <MapRecenter center={currentPos} />

              {/* Current position with pulsing dot */}
              <Marker position={currentPos} icon={pulseIcon}>
                <Popup>Tu ubicación actual</Popup>
              </Marker>

              {/* GPS Track polyline */}
              {trackPoints.length > 1 && (
                <Polyline
                  positions={trackPoints.map(p => [p.lat, p.lng])}
                  pathOptions={{ color: '#3880ff', weight: 4, opacity: 0.8 }}
                />
              )}

              {/* Nearby places markers */}
              {nearby.map((p, i) => (
                <Marker key={i} position={[p.lat, p.lng]} icon={nearbyIcon}>
                  <Popup><strong>{p.name}</strong><br /><small>{p.type}</small></Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <IonText color="medium">No se pudo obtener la ubicación</IonText>
            </div>
          )}
        </div>

        {/* STATUS BAR */}
        <IonCard style={{ margin: '8px', marginTop: 6 }}>
          <IonCardContent style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
              <IonIcon icon={locationOutline} color="primary" style={{ marginTop: 2, flexShrink: 0 }} />
              <IonText style={{ fontSize: 13, lineHeight: '1.4' }}>{address}</IonText>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <IonChip color={isMoving ? 'success' : 'medium'} style={{ height: 26 }}>
                <IonIcon icon={isMoving ? walkOutline : storefrontOutline} />
                <IonLabel style={{ fontSize: 12 }}>{isMoving ? 'Moviéndose' : 'Quieto'}</IonLabel>
              </IonChip>

              {tracking && (
                <>
                  <IonChip color="primary" style={{ height: 26 }}>
                    <IonIcon icon={carOutline} />
                    <IonLabel style={{ fontSize: 12 }}>{formatSpeed(speed)}</IonLabel>
                  </IonChip>
                  <IonChip color="secondary" style={{ height: 26 }}>
                    <IonIcon icon={navigateOutline} />
                    <IonLabel style={{ fontSize: 12 }}>{formatDistance(trackDist)}</IonLabel>
                  </IonChip>
                  <IonChip color="tertiary" style={{ height: 26 }}>
                    <IonLabel style={{ fontSize: 12 }}>{formatDuration(elapsed)}</IonLabel>
                  </IonChip>
                </>
              )}
            </div>
          </IonCardContent>
        </IonCard>

        {/* TRACKING BUTTON */}
        <div style={{ padding: '0 8px 8px' }}>
          {!tracking ? (
            <IonButton expand="block" color="success" onClick={startTracking} disabled={!currentPos}>
              <IonIcon icon={navigateOutline} slot="start" />
              Iniciar Seguimiento
            </IonButton>
          ) : (
            <IonButton expand="block" color="danger" onClick={stopTracking}>
              <IonIcon icon={stopCircleOutline} slot="start" />
              Detener y Guardar
            </IonButton>
          )}
        </div>

        {/* NEARBY PLACES */}
        {nearby.length > 0 && (
          <IonCard style={{ margin: '0 8px 8px' }}>
            <IonCardContent style={{ padding: 0 }}>
              <IonList lines="inset">
                <IonItem>
                  <IonLabel><strong>Lugares cercanos</strong></IonLabel>
                  <IonButton slot="end" fill="clear" size="small"
                    onClick={() => currentPos && refreshNearby(currentPos[0], currentPos[1])}>
                    Actualizar
                  </IonButton>
                </IonItem>
                {nearby.slice(0, 5).map((p, i) => (
                  <IonItem key={i}>
                    <IonIcon icon={storefrontOutline} slot="start" color="warning" />
                    <IonLabel>
                      <h3>{p.name}</h3>
                      <p>{p.type}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MapPage;

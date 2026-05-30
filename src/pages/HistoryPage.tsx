import { useEffect, useState } from 'react';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonChip, IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonPage, IonText, IonTitle, IonToolbar, IonAlert,
  IonRefresher, IonRefresherContent,
} from '@ionic/react';
import {
  navigateOutline, timeOutline, speedometerOutline, locationOutline, trashOutline,
} from 'ionicons/icons';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

import { loadSessions, deleteSession } from '../services/filesystem.service';
import { formatDistance, formatDuration, formatSpeed } from '../utils/geo';
import type { TrackingSession } from '../types/tracking.types';

function groupByDate(sessions: TrackingSession[]): Record<string, TrackingSession[]> {
  return sessions.reduce<Record<string, TrackingSession[]>>((acc, s) => {
    (acc[s.date] = acc[s.date] ?? []).push(s);
    return acc;
  }, {});
}

const SessionMiniMap: React.FC<{ points: TrackingSession['points'] }> = ({ points }) => {
  if (points.length < 2) return null;
  const center: [number, number] = [points[0].lat, points[0].lng];
  return (
    <div style={{ height: 160, width: '100%', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={points.map(p => [p.lat, p.lng])} pathOptions={{ color: '#3880ff', weight: 3 }} />
      </MapContainer>
    </div>
  );
};

const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<TrackingSession[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const data = await loadSessions();
    setSessions(data.sort((a, b) => b.startTime - a.startTime));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSession(deleteId);
    setDeleteId(null);
    load();
  };

  const grouped = groupByDate(sessions);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Historial de Rutas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {sessions.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
            <IonIcon icon={navigateOutline} style={{ fontSize: 64, color: 'var(--ion-color-medium)' }} />
            <IonText color="medium"><p>No hay rutas guardadas aún.</p></IonText>
            <IonText color="medium"><p>Inicia un seguimiento desde el Mapa.</p></IonText>
          </div>
        ) : (
          dates.map(date => (
            <div key={date}>
              <IonItem lines="none" style={{ '--background': 'var(--ion-color-light)', marginTop: 8 }}>
                <IonLabel><strong>{new Date(date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></IonLabel>
              </IonItem>

              {grouped[date].map(session => (
                <IonCard key={session.id} style={{ margin: '4px 8px' }}>
                  <IonCardHeader style={{ paddingBottom: 4 }}>
                    <IonCardTitle style={{ fontSize: 15 }}>
                      {new Date(session.startTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {new Date(session.endTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ paddingTop: 0 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <IonChip color="primary" style={{ height: 24 }}>
                        <IonIcon icon={navigateOutline} />
                        <IonLabel style={{ fontSize: 12 }}>{formatDistance(session.totalDistance)}</IonLabel>
                      </IonChip>
                      <IonChip color="secondary" style={{ height: 24 }}>
                        <IonIcon icon={timeOutline} />
                        <IonLabel style={{ fontSize: 12 }}>{formatDuration(session.endTime - session.startTime)}</IonLabel>
                      </IonChip>
                      <IonChip color="success" style={{ height: 24 }}>
                        <IonIcon icon={speedometerOutline} />
                        <IonLabel style={{ fontSize: 12 }}>Máx {formatSpeed(session.maxSpeed)}</IonLabel>
                      </IonChip>
                    </div>

                    <IonItem lines="none" style={{ '--padding-start': 0, '--inner-padding-end': 0 }}>
                      <IonIcon icon={locationOutline} slot="start" color="medium" />
                      <IonLabel style={{ fontSize: 12 }} className="ion-text-wrap">{session.startAddress}</IonLabel>
                    </IonItem>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <IonButton size="small" fill="outline" onClick={() => setExpanded(expanded === session.id ? null : session.id)}>
                        {expanded === session.id ? 'Ocultar mapa' : 'Ver ruta'}
                      </IonButton>
                      <IonButton size="small" fill="outline" color="danger" onClick={() => setDeleteId(session.id)}>
                        <IonIcon icon={trashOutline} />
                      </IonButton>
                    </div>

                    {expanded === session.id && <SessionMiniMap points={session.points} />}
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ))
        )}

        <IonAlert
          isOpen={!!deleteId}
          header="Eliminar ruta"
          message="¿Seguro que quieres eliminar esta ruta? Esta acción no se puede deshacer."
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setDeleteId(null) },
            { text: 'Eliminar', role: 'destructive', handler: handleDelete },
          ]}
          onDidDismiss={() => setDeleteId(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default HistoryPage;

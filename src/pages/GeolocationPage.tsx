import { useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { Geolocation, Position } from '@capacitor/geolocation';

const GeolocationPage: React.FC = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      setPosition(pos);
    } catch (e: any) {
      setError(e.message ?? 'Error obteniendo ubicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Geolocalización</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Ubicación Actual</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" onClick={getCurrentPosition} disabled={loading}>
              {loading ? <IonSpinner name="crescent" /> : 'Obtener Ubicación'}
            </IonButton>

            {error && (
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            )}

            {position && (
              <IonList className="ion-margin-top">
                <IonItem>
                  <IonLabel>
                    <h3>Latitud</h3>
                    <p>{position.coords.latitude}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Longitud</h3>
                    <p>{position.coords.longitude}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Altitud</h3>
                    <p>{position.coords.altitude ?? 'N/A'} m</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Precisión</h3>
                    <p>{position.coords.accuracy} m</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Timestamp</h3>
                    <p>{new Date(position.timestamp).toLocaleString()}</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default GeolocationPage;

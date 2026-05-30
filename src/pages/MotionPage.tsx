import { useEffect, useRef, useState } from 'react';
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
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Motion } from '@capacitor/motion';
import type { PluginListenerHandle } from '@capacitor/core';

interface MotionData {
  x: number;
  y: number;
  z: number;
}

const MotionPage: React.FC = () => {
  const [accel, setAccel] = useState<MotionData | null>(null);
  const [gyro, setGyro] = useState<MotionData | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accelHandler = useRef<PluginListenerHandle | null>(null);
  const gyroHandler = useRef<PluginListenerHandle | null>(null);

  const startListening = async () => {
    setError(null);
    try {
      accelHandler.current = await Motion.addListener('accel', (event) => {
        setAccel({
          x: event.acceleration.x ?? 0,
          y: event.acceleration.y ?? 0,
          z: event.acceleration.z ?? 0,
        });
      });

      gyroHandler.current = await Motion.addListener('orientation', (event) => {
        setGyro({
          x: event.alpha ?? 0,
          y: event.beta ?? 0,
          z: event.gamma ?? 0,
        });
      });

      setListening(true);
    } catch (e: any) {
      setError(e.message ?? 'Error accediendo al sensor de movimiento');
    }
  };

  const stopListening = async () => {
    accelHandler.current?.remove();
    gyroHandler.current?.remove();
    accelHandler.current = null;
    gyroHandler.current = null;
    setListening(false);
  };

  useEffect(() => {
    return () => {
      accelHandler.current?.remove();
      gyroHandler.current?.remove();
    };
  }, []);

  const fmt = (v: number) => v.toFixed(4);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Motion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Acelerómetro</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {accel ? (
              <IonList>
                <IonItem><IonLabel><h3>X</h3><p>{fmt(accel.x)} m/s²</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>Y</h3><p>{fmt(accel.y)} m/s²</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>Z</h3><p>{fmt(accel.z)} m/s²</p></IonLabel></IonItem>
              </IonList>
            ) : (
              <IonText color="medium"><p>Sin datos aún</p></IonText>
            )}
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Orientación (Giroscopio)</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {gyro ? (
              <IonList>
                <IonItem><IonLabel><h3>Alpha (Z)</h3><p>{fmt(gyro.x)}°</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>Beta (X)</h3><p>{fmt(gyro.y)}°</p></IonLabel></IonItem>
                <IonItem><IonLabel><h3>Gamma (Y)</h3><p>{fmt(gyro.z)}°</p></IonLabel></IonItem>
              </IonList>
            ) : (
              <IonText color="medium"><p>Sin datos aún</p></IonText>
            )}

            {error && <IonText color="danger"><p>{error}</p></IonText>}

            {!listening ? (
              <IonButton expand="block" onClick={startListening}>
                Iniciar Sensores
              </IonButton>
            ) : (
              <IonButton expand="block" color="danger" onClick={stopListening}>
                Detener Sensores
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default MotionPage;

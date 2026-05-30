import { useEffect, useState } from 'react';
import {
  IonBackButton,
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
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Device } from '@capacitor/device';
import type { DeviceInfo, BatteryInfo, LanguageTag } from '@capacitor/device';

const DevicePage: React.FC = () => {
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [battery, setBattery] = useState<BatteryInfo | null>(null);
  const [lang, setLang] = useState<LanguageTag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [deviceInfo, batteryInfo, languageTag] = await Promise.all([
        Device.getInfo(),
        Device.getBatteryInfo(),
        Device.getLanguageTag(),
      ]);
      setInfo(deviceInfo);
      setBattery(batteryInfo);
      setLang(languageTag);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="success">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Device</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Información del Dispositivo</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem><IonLabel><h3>Plataforma</h3><p>{info?.platform}</p></IonLabel></IonItem>
                  <IonItem><IonLabel><h3>Sistema Operativo</h3><p>{info?.operatingSystem} {info?.osVersion}</p></IonLabel></IonItem>
                  <IonItem><IonLabel><h3>Fabricante</h3><p>{info?.manufacturer}</p></IonLabel></IonItem>
                  <IonItem><IonLabel><h3>Modelo</h3><p>{info?.model}</p></IonLabel></IonItem>
                  <IonItem><IonLabel><h3>¿Es Virtual?</h3><p>{info?.isVirtual ? 'Sí (emulador)' : 'No (dispositivo real)'}</p></IonLabel></IonItem>
                  <IonItem><IonLabel><h3>Memoria RAM Web</h3><p>{info?.memUsed ? `${(info.memUsed / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p></IonLabel></IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Batería</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem><IonLabel><h3>Nivel</h3><p>{battery?.batteryLevel !== undefined ? `${(battery.batteryLevel * 100).toFixed(0)}%` : 'N/A'}</p></IonLabel></IonItem>
                  <IonItem><IonLabel><h3>Cargando</h3><p>{battery?.isCharging ? 'Sí' : 'No'}</p></IonLabel></IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Idioma</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem><IonLabel><h3>Etiqueta de idioma</h3><p>{lang?.value}</p></IonLabel></IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DevicePage;

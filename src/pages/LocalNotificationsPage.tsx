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
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { LocalNotifications } from '@capacitor/local-notifications';

const LocalNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('Notificación de prueba');
  const [body, setBody] = useState('Esta es una notificación local desde Capacitor.');
  const [delaySeconds, setDelaySeconds] = useState('5');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    const result = await LocalNotifications.requestPermissions();
    setStatus(`Permiso: ${result.display}`);
  };

  const scheduleNotification = async () => {
    setError(null);
    setStatus(null);
    try {
      const { display } = await LocalNotifications.checkPermissions();
      if (display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      const delay = parseInt(delaySeconds, 10) || 5;
      const scheduleAt = new Date(Date.now() + delay * 1000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            schedule: { at: scheduleAt },
            sound: undefined,
            smallIcon: undefined,
            iconColor: '#3880ff',
          },
        ],
      });

      setStatus(`Notificación programada para ${scheduleAt.toLocaleTimeString()} (en ${delay}s)`);
    } catch (e: any) {
      setError(e.message ?? 'Error programando notificación');
    }
  };

  const cancelAll = async () => {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
    setStatus(`${pending.notifications.length} notificaciones canceladas.`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="medium">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Notificaciones Locales</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Permisos</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" fill="outline" onClick={requestPermission}>
              Solicitar Permiso de Notificaciones
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Programar Notificación</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Título</IonLabel>
              <IonInput value={title} onIonChange={(e) => setTitle(e.detail.value ?? '')} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Mensaje</IonLabel>
              <IonInput value={body} onIonChange={(e) => setBody(e.detail.value ?? '')} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Retraso (segundos)</IonLabel>
              <IonInput
                type="number"
                value={delaySeconds}
                onIonChange={(e) => setDelaySeconds(e.detail.value ?? '5')}
              />
            </IonItem>
            <IonButton expand="block" onClick={scheduleNotification} className="ion-margin-top">
              Programar Notificación
            </IonButton>
            <IonButton expand="block" color="danger" fill="outline" onClick={cancelAll} className="ion-margin-top">
              Cancelar Todas
            </IonButton>

            {status && <IonText color="success"><p>{status}</p></IonText>}
            {error && <IonText color="danger"><p>{error}</p></IonText>}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default LocalNotificationsPage;

import { useEffect, useState } from 'react';
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
import { PushNotifications } from '@capacitor/push-notifications';

interface PushMessage {
  title?: string;
  body?: string;
  receivedAt: string;
}

const PushNotificationsPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const [permStatus, setPermStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      const regListener = await PushNotifications.addListener('registration', (t) => {
        setToken(t.value);
      });

      const errListener = await PushNotifications.addListener('registrationError', (err) => {
        setError(JSON.stringify(err.error));
      });

      const msgListener = await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        setMessages((prev) => [
          { title: notification.title, body: notification.body, receivedAt: new Date().toLocaleTimeString() },
          ...prev,
        ]);
      });

      return () => {
        regListener.remove();
        errListener.remove();
        msgListener.remove();
      };
    };

    setup();
  }, []);

  const register = async () => {
    setError(null);
    try {
      let status = await PushNotifications.checkPermissions();
      if (status.receive !== 'granted') {
        status = await PushNotifications.requestPermissions();
      }
      setPermStatus(status.receive);

      if (status.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (e: any) {
      setError(e.message ?? 'Error registrando push notifications');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Push Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="medium">
          <p className="ion-padding-horizontal">
            Las push notifications requieren un dispositivo físico y un servidor FCM/APNs configurado.
          </p>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Registro</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" onClick={register}>
              Solicitar Permiso y Registrar
            </IonButton>

            {permStatus && (
              <IonItem className="ion-margin-top">
                <IonLabel>
                  <h3>Estado del permiso</h3>
                  <p>{permStatus}</p>
                </IonLabel>
              </IonItem>
            )}

            {token && (
              <IonItem>
                <IonLabel className="ion-text-wrap">
                  <h3>Token FCM/APNs</h3>
                  <p style={{ fontSize: 11, wordBreak: 'break-all' }}>{token}</p>
                </IonLabel>
              </IonItem>
            )}

            {error && <IonText color="danger"><p>{error}</p></IonText>}
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Notificaciones Recibidas</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {messages.length === 0 ? (
              <IonText color="medium"><p>Ninguna notificación recibida aún.</p></IonText>
            ) : (
              <IonList>
                {messages.map((msg, i) => (
                  <IonItem key={i}>
                    <IonLabel>
                      <h3>{msg.title ?? '(Sin título)'}</h3>
                      <p>{msg.body}</p>
                      <p style={{ fontSize: 11 }}>{msg.receivedAt}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default PushNotificationsPage;

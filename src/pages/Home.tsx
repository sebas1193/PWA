import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  locationOutline,
  cameraOutline,
  phonePortraitOutline,
  informationCircleOutline,
  pulseOutline,
  folderOutline,
  notificationsOutline,
  cloudOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const sensors = [
  {
    label: 'Geolocalización',
    icon: locationOutline,
    route: '/geolocation',
    color: 'primary',
    description: 'GPS y ubicación actual',
  },
  {
    label: 'Cámara',
    icon: cameraOutline,
    route: '/camera',
    color: 'secondary',
    description: 'Foto y galería',
  },
  {
    label: 'Motion',
    icon: phonePortraitOutline,
    route: '/motion',
    color: 'tertiary',
    description: 'Acelerómetro y giroscopio',
  },
  {
    label: 'Device',
    icon: informationCircleOutline,
    route: '/device',
    color: 'success',
    description: 'Información del dispositivo',
  },
  {
    label: 'Haptics',
    icon: pulseOutline,
    route: '/haptics',
    color: 'warning',
    description: 'Vibración y retroalimentación táctil',
  },
  {
    label: 'Filesystem',
    icon: folderOutline,
    route: '/filesystem',
    color: 'danger',
    description: 'Leer y escribir archivos',
  },
  {
    label: 'Notificaciones Locales',
    icon: notificationsOutline,
    route: '/local-notifications',
    color: 'medium',
    description: 'Notificaciones programadas',
  },
  {
    label: 'Push Notifications',
    icon: cloudOutline,
    route: '/push-notifications',
    color: 'dark',
    description: 'Notificaciones remotas',
  },
];

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Sensors App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Sensors App</IonTitle>
          </IonToolbar>
        </IonHeader>

        {sensors.map((sensor) => (
          <IonCard key={sensor.route} button onClick={() => history.push(sensor.route)}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={sensor.icon} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                {sensor.label}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ marginBottom: 12 }}>{sensor.description}</p>
              <IonButton expand="block" color={sensor.color as any} fill="solid">
                Abrir {sensor.label}
              </IonButton>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Home;

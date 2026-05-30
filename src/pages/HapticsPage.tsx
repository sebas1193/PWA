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
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const HapticsPage: React.FC = () => {
  const impact = async (style: ImpactStyle) => {
    await Haptics.impact({ style });
  };

  const notification = async (type: NotificationType) => {
    await Haptics.notification({ type });
  };

  const vibrate = async () => {
    await Haptics.vibrate({ duration: 500 });
  };

  const selectionStart = async () => {
    await Haptics.selectionStart();
  };

  const selectionChanged = async () => {
    await Haptics.selectionChanged();
  };

  const selectionEnd = async () => {
    await Haptics.selectionEnd();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="warning">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Haptics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText color="medium">
          <p className="ion-padding-horizontal">Nota: Los haptics funcionan plenamente en dispositivos físicos iOS/Android.</p>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Impacto</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" onClick={() => impact(ImpactStyle.Heavy)}>
              Impacto Fuerte
            </IonButton>
            <IonButton expand="block" color="medium" onClick={() => impact(ImpactStyle.Medium)} className="ion-margin-top">
              Impacto Medio
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => impact(ImpactStyle.Light)} className="ion-margin-top">
              Impacto Suave
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Notificación</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" color="success" onClick={() => notification(NotificationType.Success)}>
              Éxito
            </IonButton>
            <IonButton expand="block" color="warning" onClick={() => notification(NotificationType.Warning)} className="ion-margin-top">
              Advertencia
            </IonButton>
            <IonButton expand="block" color="danger" onClick={() => notification(NotificationType.Error)} className="ion-margin-top">
              Error
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Vibración y Selección</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" color="tertiary" onClick={vibrate}>
              Vibrar 500ms
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={selectionStart} className="ion-margin-top">
              Selection Start
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={selectionChanged} className="ion-margin-top">
              Selection Changed
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={selectionEnd} className="ion-margin-top">
              Selection End
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default HapticsPage;

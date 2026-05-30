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
  IonImg,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const CameraPage: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async (source: CameraSource) => {
    setError(null);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source,
      });
      setPhoto(image.dataUrl ?? null);
    } catch (e: any) {
      setError(e.message ?? 'Error accediendo a la cámara');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="secondary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Cámara</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Capturar Imagen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" onClick={() => takePhoto(CameraSource.Camera)}>
              Tomar Foto
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => takePhoto(CameraSource.Photos)} className="ion-margin-top">
              Elegir de Galería
            </IonButton>

            {error && (
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            )}

            {photo && (
              <div className="ion-margin-top">
                <IonImg src={photo} alt="Foto capturada" style={{ borderRadius: 8 }} />
              </div>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default CameraPage;

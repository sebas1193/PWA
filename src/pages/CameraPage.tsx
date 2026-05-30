import { useState } from 'react';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonContent, IonHeader, IonIcon, IonImg, IonPage, IonSpinner,
  IonText, IonTitle, IonToolbar, IonItem, IonLabel,
} from '@ionic/react';
import { cameraOutline, locationOutline, downloadOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { reverseGeocode } from '../services/opencage.service';
import { addWatermark } from '../utils/watermark';

const CameraPage: React.FC = () => {
  const [watermarked, setWatermarked] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async () => {
    setError(null);
    setLoading(true);
    try {
      const [image, pos] = await Promise.all([
        Camera.getPhoto({ quality: 90, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Camera }),
        Geolocation.getCurrentPosition({ enableHighAccuracy: true }),
      ]);

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });

      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);

      const result = await addWatermark(image.dataUrl!, lat, lng, addr);
      setWatermarked(result);
    } catch (e: any) {
      setError(e.message ?? 'Error al capturar la foto');
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    setError(null);
    setLoading(true);
    try {
      const [image, pos] = await Promise.all([
        Camera.getPhoto({ quality: 90, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Photos }),
        Geolocation.getCurrentPosition({ enableHighAccuracy: true }),
      ]);

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });

      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);

      const result = await addWatermark(image.dataUrl!, lat, lng, addr);
      setWatermarked(result);
    } catch (e: any) {
      setError(e.message ?? 'Error al obtener la imagen');
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = () => {
    if (!watermarked) return;
    const a = document.createElement('a');
    a.href = watermarked;
    a.download = `foto_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
    a.click();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Cámara + Ubicación</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Foto con marca de ubicación</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              <p style={{ marginBottom: 12 }}>
                La foto incluirá automáticamente las coordenadas GPS y la dirección actual como marca de agua.
              </p>
            </IonText>

            <IonButton expand="block" onClick={takePhoto} disabled={loading}>
              <IonIcon icon={cameraOutline} slot="start" />
              Tomar Foto
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={pickFromGallery} disabled={loading} className="ion-margin-top">
              Elegir de Galería
            </IonButton>
          </IonCardContent>
        </IonCard>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <IonText color="danger">
            <p style={{ padding: '0 16px' }}>{error}</p>
          </IonText>
        )}

        {watermarked && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Vista previa</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonImg src={watermarked} alt="Foto con marca de agua" style={{ borderRadius: 8 }} />
                {coords && (
                  <IonItem lines="none" style={{ '--padding-start': 0, marginTop: 8 }}>
                    <IonIcon icon={locationOutline} slot="start" color="primary" />
                    <IonLabel className="ion-text-wrap">
                      <h3>{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</h3>
                      <p>{address}</p>
                    </IonLabel>
                  </IonItem>
                )}
                <IonButton expand="block" color="success" onClick={downloadPhoto} className="ion-margin-top">
                  <IonIcon icon={downloadOutline} slot="start" />
                  Descargar Foto
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CameraPage;

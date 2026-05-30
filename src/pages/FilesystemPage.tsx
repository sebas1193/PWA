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
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const FILE_NAME = 'sensors_note.txt';

const FilesystemPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [readContent, setReadContent] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const writeFile = async () => {
    setError(null);
    setStatus(null);
    try {
      await Filesystem.writeFile({
        path: FILE_NAME,
        data: content,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      setStatus(`Archivo "${FILE_NAME}" guardado correctamente.`);
    } catch (e: any) {
      setError(e.message ?? 'Error escribiendo archivo');
    }
  };

  const readFile = async () => {
    setError(null);
    setStatus(null);
    try {
      const result = await Filesystem.readFile({
        path: FILE_NAME,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      setReadContent(result.data as string);
    } catch (e: any) {
      setError(e.message ?? 'Error leyendo archivo');
    }
  };

  const deleteFile = async () => {
    setError(null);
    setStatus(null);
    try {
      await Filesystem.deleteFile({
        path: FILE_NAME,
        directory: Directory.Documents,
      });
      setReadContent(null);
      setStatus(`Archivo "${FILE_NAME}" eliminado.`);
    } catch (e: any) {
      setError(e.message ?? 'Error eliminando archivo');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Filesystem</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Escribir Archivo</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Contenido a guardar</IonLabel>
              <IonTextarea
                rows={4}
                value={content}
                onIonChange={(e) => setContent(e.detail.value ?? '')}
                placeholder="Escribe algo aquí..."
              />
            </IonItem>
            <IonButton expand="block" onClick={writeFile} className="ion-margin-top">
              Guardar en {FILE_NAME}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Leer / Eliminar Archivo</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" fill="outline" onClick={readFile}>
              Leer {FILE_NAME}
            </IonButton>
            <IonButton expand="block" color="danger" fill="outline" onClick={deleteFile} className="ion-margin-top">
              Eliminar {FILE_NAME}
            </IonButton>

            {status && <IonText color="success"><p>{status}</p></IonText>}
            {error && <IonText color="danger"><p>{error}</p></IonText>}

            {readContent !== null && (
              <IonItem className="ion-margin-top">
                <IonLabel>
                  <h3>Contenido leído:</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{readContent}</p>
                </IonLabel>
              </IonItem>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default FilesystemPage;

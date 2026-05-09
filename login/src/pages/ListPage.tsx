import { Redirect } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const ITEMS = ['Elemento 1', 'Elemento 2', 'Elemento 3', 'Elemento 4', 'Elemento 5'];

const ListPage: React.FC = () => {
  const history = useHistory();

  if (localStorage.getItem('logged') !== 'true') {
    return <Redirect to="/login" />;
  }

  const handleLogout = () => {
    localStorage.removeItem('logged');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lista</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>Cerrar sesión</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {ITEMS.map((item, i) => (
            <IonItem key={i}>
              <IonLabel>{item}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ListPage;

import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const VALID_EMAIL = 'user@mail.com';
const VALID_PASSWORD = '123';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  if (localStorage.getItem('logged') === 'true') {
    return <Redirect to="/list" />;
  }

  const handleLogin = () => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      localStorage.setItem('logged', 'true');
      history.replace('/list');
    } else {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonInput
            label="Email"
            labelPlacement="floating"
            type="email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value!)}
            placeholder="user@mail.com"
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Contraseña"
            labelPlacement="floating"
            type="password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
        {error && (
          <IonText color="danger">
            <p className="ion-padding-horizontal ion-padding-top">{error}</p>
          </IonText>
        )}
        <div className="ion-padding-top">
          <IonButton expand="block" onClick={handleLogin}>
            Ingresar
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;

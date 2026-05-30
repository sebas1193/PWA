import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { mapOutline, timeOutline, cameraOutline } from 'ionicons/icons';

import MapPage from './pages/MapPage';
import HistoryPage from './pages/HistoryPage';
import CameraPage from './pages/CameraPage';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/map" component={MapPage} />
          <Route exact path="/history" component={HistoryPage} />
          <Route exact path="/camera" component={CameraPage} />
          <Redirect exact from="/" to="/map" />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="map" href="/map">
            <IonIcon icon={mapOutline} />
            <IonLabel>Mapa</IonLabel>
          </IonTabButton>
          <IonTabButton tab="history" href="/history">
            <IonIcon icon={timeOutline} />
            <IonLabel>Historial</IonLabel>
          </IonTabButton>
          <IonTabButton tab="camera" href="/camera">
            <IonIcon icon={cameraOutline} />
            <IonLabel>Cámara</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;

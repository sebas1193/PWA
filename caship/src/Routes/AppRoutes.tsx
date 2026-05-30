import { Redirect, Route, Switch } from 'react-router-dom'
import { IonRouterOutlet } from '@ionic/react'
import { useAuth } from '@/Hooks/useAuth'
import PublicRoutes from './PublicRoutes'
import UserRoutes from './UserRoutes'

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) return null   // espera a que Firebase resuelva el estado de auth

  return (
    <IonRouterOutlet>
      <Switch>
        <Route path="/login"    component={PublicRoutes} />
        <Route path="/register" component={PublicRoutes} />
        <Route
          path="/"
          render={() => (user ? <UserRoutes /> : <Redirect to="/login" />)}
        />
      </Switch>
    </IonRouterOutlet>
  )
}

export default AppRoutes

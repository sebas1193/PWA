import { Redirect, Route, Switch } from 'react-router-dom'
import { IonRouterOutlet } from '@ionic/react'
import { useAuth } from '@/Hooks/useAuth'
import Login from '@/pages/Auth/Login/Index'
import Register from '@/pages/Auth/Register/Index'

const PublicRoutes: React.FC = () => {
  const { user } = useAuth()

  if (user) return <Redirect to="/dashboard" />

  return (
    <IonRouterOutlet>
      <Switch>
        <Route exact path="/login"    component={Login}    />
        <Route exact path="/register" component={Register} />
        <Redirect to="/login" />
      </Switch>
    </IonRouterOutlet>
  )
}

export default PublicRoutes

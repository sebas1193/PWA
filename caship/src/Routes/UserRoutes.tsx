import { Redirect, Route, Switch } from 'react-router-dom'
import { IonRouterOutlet } from '@ionic/react'
import { useAuth } from '@/Hooks/useAuth'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Accounts from '@/pages/Accounts/Accounts'
import Categories from '@/pages/Categories/Categories'
import Transactions from '@/pages/Transactions/Transactions'
import AddTransaction  from '@/pages/Transactions/AddTransaction'
import EditTransaction from '@/pages/Transactions/EditTransaction'

const UserRoutes: React.FC = () => {
  const { user } = useAuth()

  if (!user) return <Redirect to="/login" />

  return (
    <IonRouterOutlet>
      <Switch>
        <Route exact path="/dashboard"                        component={Dashboard}      />
        <Route exact path="/accounts"                         component={Accounts}       />
        <Route exact path="/categories"                       component={Categories}     />
        <Route exact path="/transactions/:cuentaId"           component={Transactions}   />
        <Route exact path="/transactions/:cuentaId/add"              component={AddTransaction}  />
        <Route exact path="/transactions/:cuentaId/edit/:transaccionId" component={EditTransaction} />
        <Redirect to="/dashboard" />
      </Switch>
    </IonRouterOutlet>
  )
}

export default UserRoutes

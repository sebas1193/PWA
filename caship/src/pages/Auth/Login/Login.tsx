import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/Hooks/useAuth'

const Login: React.FC = () => {
  const { signIn }  = useAuth()
  const history     = useHistory()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(email, password)
      history.replace('/dashboard')
    } catch (err: any) {
      const code = err.code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found')
        setError('Email o contraseña incorrectos')
      else if (code === 'auth/network-request-failed')
        setError('Error de red. Verifica tu conexión')
      else
        setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <IonPage>
      <IonContent className="ion-no-padding" style={{ '--background': '#f5f7fb' } as any}>
        <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md">

            <div className="flex items-center gap-3 justify-center mb-10">
              <div className="size-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-float">
                <Wallet className="size-5" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">Caship</span>
            </div>

            <div className="bg-surface rounded-3xl shadow-card border border-border/50 p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Bienvenido de nuevo
              </p>
              <h1 className="text-2xl font-semibold text-foreground mb-8">Inicia sesión</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full h-12 rounded-2xl border border-border bg-surface px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 rounded-2xl border border-border bg-surface px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>

                {error && <p className="text-sm text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
                >
                  {busy ? 'Cargando...' : 'Iniciar sesión'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => history.push('/register')}
                  className="text-primary font-medium hover:underline"
                >
                  Regístrate
                </button>
              </p>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Login
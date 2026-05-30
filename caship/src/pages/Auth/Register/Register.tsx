import { useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/Hooks/useAuth'
import { crearUsuario } from '@/services/firestore.service'

const Register: React.FC = () => {
  const { signUp } = useAuth()
  const history    = useHistory()

  const [nombres,   setNombres]   = useState('')
  const [apellidos, setApellidos] = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [busy,      setBusy]      = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setError('')
    setBusy(true)
    try {
      const firebaseUser = await signUp(email, password)
      await crearUsuario({ uid: firebaseUser.uid, nombres, apellidos, email })
      history.replace('/dashboard')
    } catch (err: any) {
      const code = err.code ?? ''
      if (code === 'auth/email-already-in-use') setError('Este email ya está registrado')
      else setError(err.message)
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
                Crear cuenta
              </p>
              <h1 className="text-2xl font-semibold text-foreground mb-8">Empieza ahora</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombres</label>
                    <input
                      type="text"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      placeholder="Ana"
                      required
                      className="w-full h-12 rounded-2xl border border-border bg-surface px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Apellidos</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      placeholder="García"
                      required
                      className="w-full h-12 rounded-2xl border border-border bg-surface px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>
                </div>
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
                    placeholder="Mínimo 6 caracteres"
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
                  {busy ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => history.push('/login')}
                  className="text-primary font-medium hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Register
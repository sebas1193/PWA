import { useEffect, useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { ArrowLeft, Wallet } from 'lucide-react'
import { useAuth } from '@/Hooks/useAuth'
import { crearCuenta, obtenerCuentasDeUsuario, obtenerMonedas } from '@/services/firestore.service'
import { runSeed } from '@/Helpers/seed'
import { formatMonto } from '@/Helpers/format'
import type { Cuenta, Moneda } from '@/types'

const Accounts: React.FC = () => {
  const { user }  = useAuth()
  const history   = useHistory()

  const [cuentas,        setCuentas]        = useState<Cuenta[]>([])
  const [monedas,        setMonedas]        = useState<Moneda[]>([])
  const [nombre,         setNombre]         = useState('')
  const [monedaId,       setMonedaId]       = useState('')
  const [error,          setError]          = useState('')
  const [loadingMonedas, setLoadingMonedas] = useState(true)
  const [busy,           setBusy]           = useState(false)

  useEffect(() => {
    if (!user) return
    obtenerCuentasDeUsuario(user.uid).then(setCuentas)
    runSeed()
      .then(() => obtenerMonedas())
      .then((m) => {
        setMonedas(m)
        if (m.length > 0) setMonedaId(m[0].id)
      })
      .catch((e) => setError('Error cargando monedas: ' + e.message))
      .finally(() => setLoadingMonedas(false))
  }, [user])

  const handleCrear = async () => {
    if (!user || !nombre.trim() || !monedaId) return
    setError('')
    setBusy(true)
    try {
      const id = await crearCuenta({ id_usuario: user.uid, id_moneda: monedaId, nombre: nombre.trim() })
      setCuentas((prev) => [...prev, {
        id, id_usuario: user.uid, id_moneda: monedaId, nombre: nombre.trim(),
        saldo: 0, is_active: true, created_at: {} as any, updated_at: {} as any,
      }])
      setNombre('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <IonPage>
      <IonContent className="ion-no-padding" style={{ '--background': '#f5f7fb' } as any}>
        <div className="min-h-[100dvh] px-5 md:px-10 py-10 bg-background">
          <div className="max-w-2xl mx-auto">

            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
              <button
                onClick={() => history.goBack()}
                className="size-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition shrink-0"
              >
                <ArrowLeft className="size-4" strokeWidth={2} />
              </button>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Gestionar</p>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Cuentas</h1>
              </div>
            </header>

            {/* Formulario */}
            <div className="bg-surface rounded-3xl shadow-card border border-border/40 p-6 space-y-4 mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Nueva cuenta</h2>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Bancolombia, Nequi, Efectivo…"
                  className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Moneda</label>
                {loadingMonedas ? (
                  <div className="h-12 rounded-2xl border border-border bg-background px-4 flex items-center">
                    <span className="text-sm text-muted-foreground">Cargando…</span>
                  </div>
                ) : monedas.length === 0 ? (
                  <p className="text-sm text-amber-500">No hay monedas disponibles. Verifica la conexión.</p>
                ) : (
                  <div className="relative">
                    <select
                      value={monedaId}
                      onChange={(e) => setMonedaId(e.target.value)}
                      className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                    >
                      {monedas.map((m) => (
                        <option key={m.id} value={m.id}>{m.nombre} ({m.simbolo})</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                onClick={handleCrear}
                disabled={busy || !nombre.trim() || !monedaId}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
              >
                {busy ? 'Creando…' : 'Crear cuenta'}
              </button>
            </div>

            {/* Lista de cuentas */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Mis cuentas
              </h2>
              {cuentas.length === 0 ? (
                <div className="bg-surface rounded-3xl p-8 border border-border/40 text-center">
                  <p className="text-sm text-muted-foreground">Ninguna cuenta creada aún.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {cuentas.map((c) => (
                    <div
                      key={c.id}
                      className="bg-surface rounded-3xl p-4 border border-border/40 shadow-card flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Wallet className="size-3.5" strokeWidth={2} />
                        <span className="text-[10px] font-bold uppercase tracking-widest truncate">{c.nombre}</span>
                      </div>
                      <p className={`text-base font-semibold tabular-nums ${c.saldo < 0 ? 'text-rose-500' : 'text-foreground'}`}>
                        {formatMonto(c.saldo)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.saldo < 0 ? 'en rojo' : 'disponible'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Accounts
import { useEffect, useMemo, useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { LogOut, Tag, Plus, TrendingUp, TrendingDown, Wallet, MapPin, ChevronDown } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '@/Hooks/useAuth'
import { useNetwork } from '@/Hooks/useNetwork'
import {
  obtenerCuentasDeUsuario,
  obtenerTransaccionesDeUsuario,
} from '@/services/firestore.service'
import { runSeed } from '@/Helpers/seed'
import { formatMonto } from '@/Helpers/format'
import type { Cuenta, Transaccion } from '@/types'

// Fix Leaflet marker icons en Vite (usa CDN para no romper el bundler)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Gráfica SVG de evolución de balance ─────────────────────────
const BalanceChart: React.FC<{ txns: Transaccion[]; saldoActual: number }> = ({ txns, saldoActual }) => {
  const dias  = 7
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  let balance = saldoActual
  const puntos: { label: string; balance: number }[] = []

  for (let i = 0; i < dias; i++) {
    const dia   = new Date(today); dia.setDate(today.getDate() - i)
    const inicio = new Date(dia);  inicio.setHours(0, 0, 0, 0)
    const fin    = new Date(dia);  fin.setHours(23, 59, 59, 999)

    puntos.unshift({ label: dia.toLocaleDateString('es', { weekday: 'short' }), balance })

    txns.filter((t) => { const d = t.fecha.toDate(); return d >= inicio && d <= fin })
        .forEach((t) => { balance += t.naturaleza === 'ingreso' ? -t.monto : t.monto })
  }

  const valores = puntos.map((p) => p.balance)
  const minVal  = Math.min(...valores)
  const maxVal  = Math.max(...valores)
  const rango   = maxVal - minVal || 1
  const W = 300, H = 72, PAD = 6

  const coords = puntos.map((_, i) => ({
    x: PAD + (i / (puntos.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (puntos[i].balance - minVal) / rango) * (H - PAD * 2),
  }))
  const line  = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const area  = `${line} L${W - PAD},${H} L${PAD},${H} Z`
  const isNeg = saldoActual < 0

  return (
    <section className="bg-surface rounded-3xl p-6 shadow-card border border-border/40 mb-6">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Últimos 7 días</p>
        <span className={`text-2xl font-semibold tabular-nums ${isNeg ? 'text-rose-500' : 'text-primary'}`}>
          {formatMonto(saldoActual)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Evolución del balance total</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={isNeg ? '#f43f5e' : '#6366f1'} stopOpacity="0.25" />
            <stop offset="100%" stopColor={isNeg ? '#f43f5e' : '#6366f1'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#grad)" />
        <path d={line} fill="none" stroke={isNeg ? '#f43f5e' : '#6366f1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3" fill={isNeg ? '#f43f5e' : '#6366f1'} />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {puntos.map((p, i) => (
          <span key={i} className="text-[10px] font-bold uppercase text-muted-foreground/60 capitalize">{p.label}</span>
        ))}
      </div>
    </section>
  )
}

// ── Mapa de coordenadas (Leaflet) ────────────────────────────────
interface Coordenada { lat: number; lng: number; desc?: string }

const MapaCoordenadas: React.FC<{ puntos: Coordenada[] }> = ({ puntos }) => {
  if (puntos.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        Sin ubicaciones registradas en tus transacciones
      </div>
    )
  }

  const centro: [number, number] = [
    puntos.reduce((s, p) => s + p.lat, 0) / puntos.length,
    puntos.reduce((s, p) => s + p.lng, 0) / puntos.length,
  ]

  return (
    <div className="rounded-2xl overflow-hidden mt-4" style={{ height: 240 }}>
      <MapContainer center={centro} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        {puntos.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]}>
            {p.desc && <Popup>{p.desc}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { user, signOut }       = useAuth()
  const { isOnline }            = useNetwork()
  const history                 = useHistory()
  const [cuentas,  setCuentas]  = useState<Cuenta[]>([])
  const [txns,     setTxns]     = useState<Transaccion[]>([])
  const [loading,  setLoading]  = useState(true)
  const [mapaAbierto, setMapaAbierto] = useState(false)

  const saldoTotal    = cuentas.reduce((s, c) => s + c.saldo, 0)
  const egresoMasAlto = useMemo(
    () => txns.filter((t) => t.naturaleza === 'egreso').reduce((m, t) => Math.max(m, t.monto), 0),
    [txns]
  )

  const lugarMasConcurrido = useMemo(() => {
    const counts = new Map<string, { count: number; total: number }>()
    txns.forEach((t) => {
      const key = (t.descripcion ?? '').trim().toLowerCase()
      if (!key) return
      const cur = counts.get(key) ?? { count: 0, total: 0 }
      counts.set(key, { count: cur.count + 1, total: cur.total + t.monto })
    })
    type Lugar = { nombre: string; count: number; total: number }
    let mejor: Lugar | null = null
    counts.forEach((v, k) => {
      if (!mejor || v.count > mejor.count) mejor = { nombre: k, count: v.count, total: v.total }
    })
    return mejor as Lugar | null
  }, [txns])

  const coordenadas = useMemo<Coordenada[]>(
    () => txns
      .filter((t) => t.latitud !== undefined && t.longitud !== undefined)
      .map((t) => ({ lat: t.latitud!, lng: t.longitud!, desc: t.descripcion })),
    [txns]
  )

  useEffect(() => {
    if (!user) return
    const cargar = async () => {
      setLoading(true)
      try {
        await runSeed()
        const cs = await obtenerCuentasDeUsuario(user.uid)
        setCuentas(cs)
        if (cs.length > 0) {
          const todas = await obtenerTransaccionesDeUsuario(cs.map((c) => c.id))
          setTxns(todas)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    history.replace('/login')
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-no-padding" style={{ '--background': '#f5f7fb' } as any}>
          <div className="min-h-[100dvh] flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="size-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-float mx-auto mb-4">
                <Wallet className="size-5" strokeWidth={2.5} />
              </div>
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonContent className="ion-no-padding" style={{ '--background': '#f5f7fb' } as any}>
        <div className="min-h-[100dvh] px-5 md:px-10 py-10 md:py-14 bg-background">
          <div className="max-w-2xl mx-auto">

            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Resumen</p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {user?.displayName ?? user?.email?.split('@')[0] ?? 'Mis finanzas'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {!isOnline && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                    Sin conexión
                  </span>
                )}
                <button
                  onClick={() => history.push('/categories')}
                  className="size-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition"
                  title="Categorías"
                >
                  <Tag className="size-4" strokeWidth={2} />
                </button>
                <button
                  onClick={handleSignOut}
                  className="size-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="size-4" strokeWidth={2} />
                </button>
              </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-surface rounded-3xl p-4 border border-border/40 shadow-card flex flex-col gap-1.5">
                <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="size-4 text-emerald-500" strokeWidth={2} />
                </div>
                <p className={`text-base font-semibold tabular-nums ${saldoTotal < 0 ? 'text-rose-500' : 'text-foreground'}`}>
                  {formatMonto(saldoTotal)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dinero actual</p>
              </div>
              <div className="bg-surface rounded-3xl p-4 border border-border/40 shadow-card flex flex-col gap-1.5">
                <div className="size-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <TrendingDown className="size-4 text-rose-500" strokeWidth={2} />
                </div>
                <p className="text-base font-semibold tabular-nums text-foreground">
                  {formatMonto(egresoMasAlto)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Egreso más alto</p>
              </div>
            </div>

            {/* Gráfica de evolución */}
            {txns.length > 0 && <BalanceChart txns={txns} saldoActual={saldoTotal} />}

            {/* Tarjetas de cuentas */}
            {cuentas.length > 0 && (
              <section className="mb-6 grid gap-2.5 grid-cols-2 sm:grid-cols-3">
                {cuentas.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => history.push(`/transactions/${c.id}`)}
                    className="bg-surface rounded-3xl p-4 border border-border/40 shadow-card flex flex-col gap-2 cursor-pointer hover:border-primary/30 active:scale-[0.98] transition select-none"
                  >
                    <div className="size-8 rounded-xl bg-primary-soft flex items-center justify-center">
                      <Wallet className="size-3.5 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate mb-0.5">
                        {c.nombre}
                      </p>
                      <p className={`text-base font-semibold tabular-nums ${c.saldo < 0 ? 'text-rose-500' : 'text-foreground'}`}>
                        {formatMonto(c.saldo)}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {c.saldo < 0 ? 'en rojo' : 'disponible'}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {/* Lugar más concurrido + mapa */}
            {txns.length > 0 && (
              <section className="bg-surface rounded-3xl shadow-card border border-border/40 mb-6 overflow-hidden">
                {/* Fila principal */}
                <div className="p-5 flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-primary-soft flex items-center justify-center shrink-0">
                    <MapPin className="size-5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                      Lugar más concurrido
                    </p>
                    {lugarMasConcurrido ? (
                      <>
                        <h4 className="text-sm font-semibold text-foreground capitalize truncate">
                          {lugarMasConcurrido.nombre}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {lugarMasConcurrido.count} {lugarMasConcurrido.count === 1 ? 'transacción' : 'transacciones'}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold text-muted-foreground">Sin datos aún</h4>
                        <p className="text-xs text-muted-foreground">Añade transacciones con descripción</p>
                      </>
                    )}
                  </div>
                  {lugarMasConcurrido && (
                    <p className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                      {formatMonto(lugarMasConcurrido.total)}
                    </p>
                  )}
                </div>

                {/* Acordeón del mapa */}
                <button
                  onClick={() => setMapaAbierto((v) => !v)}
                  className="w-full px-5 py-3 flex items-center justify-between border-t border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background/50 transition"
                >
                  <span>{coordenadas.length > 0 ? `Ver mapa · ${coordenadas.length} ubicaciones` : 'Ver mapa de ubicaciones'}</span>
                  <ChevronDown
                    className="size-4 transition-transform duration-200"
                    style={{ transform: mapaAbierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    strokeWidth={2}
                  />
                </button>

                {mapaAbierto && (
                  <div className="px-4 pb-4">
                    <MapaCoordenadas puntos={coordenadas} />
                  </div>
                )}
              </section>
            )}

            {/* Botón nueva cuenta */}
            <button
              onClick={() => history.push('/accounts')}
              className="w-full h-20 rounded-3xl bg-primary text-primary-foreground shadow-float flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.99] transition group"
            >
              <div className="size-10 rounded-2xl bg-white/15 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus className="size-5" strokeWidth={2.5} />
              </div>
              <span className="font-medium tracking-tight">
                {cuentas.length === 0 ? 'Crear primera cuenta' : 'Nueva cuenta'}
              </span>
            </button>

            {cuentas.length === 0 && (
              <div className="bg-surface rounded-3xl p-8 border border-border/40 text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Crea tu primera cuenta bancaria para empezar a registrar transacciones.
                </p>
              </div>
            )}

          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Dashboard

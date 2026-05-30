import { useEffect, useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useParams, useHistory } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, TrendingUp, TrendingDown } from 'lucide-react'
import { useAppData } from '@/Context/AppDataContext'
import {
  suscribirTransaccionesDeCuenta,
  eliminarTransaccion,
} from '@/services/firestore.service'
import { formatMonto } from '@/Helpers/format'
import type { Transaccion } from '@/types'

const Transactions: React.FC = () => {
  const { cuentaId }                      = useParams<{ cuentaId: string }>()
  const { cuentas, categoriasMap }        = useAppData()
  const history                           = useHistory()
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [eliminarId,    setEliminarId]    = useState<string | null>(null)

  // onSnapshot: fires instantly from IndexedDB cache + stays in sync after add/edit
  useEffect(() => {
    return suscribirTransaccionesDeCuenta(cuentaId, setTransacciones)
  }, [cuentaId])

  // Fire-and-forget delete: onSnapshot reflects the removal automatically
  const handleEliminar = (t: Transaccion) => {
    setEliminarId(null)
    const cuenta = cuentas.find(c => c.id === t.id_cuenta)
    eliminarTransaccion(t.id, t.id_cuenta, t.naturaleza, t.monto, cuenta?.saldo)
      .catch(console.error)
  }

  const sorted = [...transacciones].sort((a, b) => {
    const porFecha = b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
    if (porFecha !== 0) return porFecha
    return b.created_at.toDate().getTime() - a.created_at.toDate().getTime()
  })

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
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Cuenta</p>
                <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">Transacciones</h1>
              </div>
            </header>

            {/* Lista */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  Movimientos
                </h2>
                <span className="text-xs text-muted-foreground">
                  {sorted.length} {sorted.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>

              {sorted.length === 0 ? (
                <div className="bg-surface rounded-3xl p-8 border border-border/40 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sin transacciones. Añade una con el botón +
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sorted.map((t) => {
                    const esIngreso  = t.naturaleza === 'ingreso'
                    const eliminando = eliminarId === t.id

                    return (
                      <div
                        key={t.id}
                        className="bg-surface rounded-2xl border border-border/40 px-4 py-3.5 flex items-center gap-3"
                      >
                        {/* Indicador */}
                        <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${esIngreso ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                          {esIngreso
                            ? <TrendingUp  className="size-4 text-emerald-500" strokeWidth={2} />
                            : <TrendingDown className="size-4 text-rose-500"   strokeWidth={2} />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {t.descripcion || <span className="text-muted-foreground italic">Sin descripción</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {categoriasMap[t.id_categoria] && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${esIngreso ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                {categoriasMap[t.id_categoria]}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {t.fecha.toDate().toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Monto */}
                        <p className={`text-sm font-semibold tabular-nums shrink-0 ${esIngreso ? 'text-emerald-500' : 'text-foreground'}`}>
                          {esIngreso ? '+' : '-'}{formatMonto(t.monto)}
                        </p>

                        {/* Acciones */}
                        {eliminando ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEliminar(t)}
                              className="size-8 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition"
                            >
                              <Check className="size-3.5" strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setEliminarId(null)}
                              className="size-8 rounded-xl border border-border bg-surface text-muted-foreground flex items-center justify-center hover:border-primary/30 transition"
                            >
                              <X className="size-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => history.push(`/transactions/${cuentaId}/edit/${t.id}`)}
                              className="size-8 rounded-xl border border-border bg-surface text-muted-foreground flex items-center justify-center hover:text-foreground hover:border-primary/30 transition"
                            >
                              <Pencil className="size-3.5" strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => setEliminarId(t.id)}
                              className="size-8 rounded-xl border border-border bg-surface text-muted-foreground flex items-center justify-center hover:text-rose-500 hover:border-rose-300 transition"
                            >
                              <Trash2 className="size-3.5" strokeWidth={2} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* FAB */}
            <button
              onClick={() => history.push(`/transactions/${cuentaId}/add`)}
              className="fixed bottom-8 right-6 size-16 rounded-3xl bg-primary text-primary-foreground shadow-float flex items-center justify-center hover:opacity-95 active:scale-[0.96] transition"
            >
              <Plus className="size-6" strokeWidth={2.5} />
            </button>

          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Transactions
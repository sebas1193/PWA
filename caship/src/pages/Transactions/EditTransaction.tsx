import { useEffect, useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useParams, useHistory } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/Hooks/useAuth'
import {
  obtenerTransaccion,
  obtenerCategoriasGlobales,
  obtenerCategoriasUsuario,
  actualizarTransaccion,
} from '@/services/firestore.service'
import type { Categoria, Naturaleza, Transaccion } from '@/types'

const EditTransaction: React.FC = () => {
  const { cuentaId, transaccionId } = useParams<{ cuentaId: string; transaccionId: string }>()
  const { user }  = useAuth()
  const history   = useHistory()

  const [cargando,    setCargando]    = useState(true)
  const [original,    setOriginal]    = useState<Pick<Transaccion, 'naturaleza' | 'monto'> | null>(null)
  const [categorias,  setCategorias]  = useState<Categoria[]>([])
  const [categoriaId, setCategoriaId] = useState('')
  const [naturaleza,  setNaturaleza]  = useState<Naturaleza>('egreso')
  const [monto,       setMonto]       = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha,       setFecha]       = useState('')
  const [error,       setError]       = useState('')

  useEffect(() => {
    const cargar = async () => {
      const [tx, globales, propias] = await Promise.all([
        obtenerTransaccion(transaccionId),
        obtenerCategoriasGlobales(),
        user ? obtenerCategoriasUsuario(user.uid) : Promise.resolve([]),
      ])
      if (!tx) { setError('Transacción no encontrada'); setCargando(false); return }

      setCategorias([...globales, ...propias])
      setOriginal({ naturaleza: tx.naturaleza, monto: tx.monto })
      setCategoriaId(tx.id_categoria)
      setNaturaleza(tx.naturaleza)
      setMonto(String(tx.monto))
      setDescripcion(tx.descripcion ?? '')
      setFecha(tx.fecha.toDate().toISOString().slice(0, 10))
      setCargando(false)
    }
    cargar()
  }, [user, transaccionId])

  const handleGuardar = async () => {
    if (!original || !monto || !categoriaId) return
    setError('')
    try {
      await actualizarTransaccion(transaccionId, cuentaId, original, {
        id_categoria: categoriaId,
        naturaleza,
        monto:        parseFloat(monto),
        fecha:        new Date(fecha),
        descripcion:  descripcion || undefined,
      })
      history.replace(`/transactions/${cuentaId}`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (cargando) {
    return (
      <IonPage>
        <IonContent className="ion-no-padding" style={{ '--background': '#f5f7fb' } as any}>
          <div className="min-h-[100dvh] flex items-center justify-center bg-background">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    )
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Editar</p>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Transacción</h1>
              </div>
            </header>

            <div className="bg-surface rounded-3xl shadow-card border border-border/40 p-6 space-y-5">

              {/* Tipo */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['egreso', 'ingreso'] as Naturaleza[]).map((n) => (
                    <button
                      key={n}
                      onClick={() => setNaturaleza(n)}
                      className={`h-12 rounded-2xl border text-sm font-medium transition ${
                        naturaleza === n
                          ? 'bg-primary border-primary text-primary-foreground shadow-float'
                          : 'bg-surface border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {n === 'egreso' ? 'Egreso' : 'Ingreso'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Monto</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoría</label>
                <div className="relative">
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                onClick={handleGuardar}
                disabled={!monto || !categoriaId}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
              >
                Guardar cambios
              </button>

            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default EditTransaction
import { useEffect, useState } from 'react'
import { IonPage, IonContent } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useAuth } from '@/Hooks/useAuth'
import {
  obtenerCategoriasGlobales,
  obtenerCategoriasUsuario,
  crearCategoriaUsuario,
  eliminarCategoriaUsuario,
} from '@/services/firestore.service'
import type { Categoria } from '@/types'

const Categories: React.FC = () => {
  const { user }  = useAuth()
  const history   = useHistory()

  const [globales, setGlobales] = useState<Categoria[]>([])
  const [propias,  setPropias]  = useState<Categoria[]>([])
  const [nombre,   setNombre]   = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  useEffect(() => {
    obtenerCategoriasGlobales().then(setGlobales)
    if (user) obtenerCategoriasUsuario(user.uid).then(setPropias)
  }, [user])

  const handleCrear = async () => {
    if (!user || !nombre.trim()) return
    setError('')
    setBusy(true)
    try {
      const id = await crearCategoriaUsuario(user.uid, { nombre: nombre.trim(), icono: 'ellipsis-horizontal-outline' })
      setPropias((prev) => [...prev, { id, nombre: nombre.trim(), icono: 'ellipsis-horizontal-outline' }])
      setNombre('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!user) return
    await eliminarCategoriaUsuario(user.uid, id)
    setPropias((prev) => prev.filter((c) => c.id !== id))
  }

  const CategoryRow: React.FC<{ cat: Categoria; onDelete?: () => void }> = ({ cat, onDelete }) => (
    <div className="bg-surface rounded-2xl border border-border/40 px-4 py-3 flex items-center gap-3">
      <div className="size-8 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-primary uppercase">
          {cat.nombre.charAt(0)}
        </span>
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">{cat.nombre}</span>
      {onDelete && (
        <button
          onClick={onDelete}
          className="size-8 rounded-xl border border-border bg-surface text-muted-foreground flex items-center justify-center hover:text-rose-500 hover:border-rose-300 transition"
        >
          <Trash2 className="size-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  )

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
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Categorías</h1>
              </div>
            </header>

            {/* Formulario */}
            <div className="bg-surface rounded-3xl shadow-card border border-border/40 p-6 space-y-4 mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Nueva categoría</h2>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Mascotas, Gimnasio…"
                  onKeyDown={(e) => e.key === 'Enter' && handleCrear()}
                  className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <button
                onClick={handleCrear}
                disabled={busy || !nombre.trim()}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
              >
                {busy ? 'Creando…' : 'Crear categoría'}
              </button>
            </div>

            {/* Propias */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Mis categorías
              </h2>
              {propias.length === 0 ? (
                <div className="bg-surface rounded-3xl p-6 border border-border/40 text-center">
                  <p className="text-sm text-muted-foreground">Ninguna creada aún.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {propias.map((c) => (
                    <CategoryRow key={c.id} cat={c} onDelete={() => handleEliminar(c.id)} />
                  ))}
                </div>
              )}
            </div>

            {/* Globales */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Categorías predeterminadas
              </h2>
              <div className="space-y-2">
                {globales.map((c) => (
                  <CategoryRow key={c.id} cat={c} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Categories

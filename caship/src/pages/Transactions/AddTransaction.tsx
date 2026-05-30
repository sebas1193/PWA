import { useEffect, useState } from 'react'
import { IonPage, IonContent, IonSpinner } from '@ionic/react'
import { useParams, useHistory } from 'react-router-dom'
import { ArrowLeft, Camera, Sparkles, MapPin } from 'lucide-react'
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera'
import { useAuth } from '@/Hooks/useAuth'
import {
  obtenerCategoriasGlobales,
  obtenerCategoriasUsuario,
  crearTransaccion,
} from '@/services/firestore.service'
import { analizarComprobante } from '@/services/vision.service'
import type { Categoria, Naturaleza } from '@/types'

const AddTransaction: React.FC = () => {
  const { cuentaId } = useParams<{ cuentaId: string }>()
  const { user }     = useAuth()
  const history      = useHistory()

  const [categorias,   setCategorias]  = useState<Categoria[]>([])
  const [categoriaId,  setCategoriaId] = useState('')
  const [naturaleza,   setNaturaleza]  = useState<Naturaleza>('egreso')
  const [monto,        setMonto]       = useState('')
  const [descripcion,  setDescripcion] = useState('')
  const [fecha,        setFecha]       = useState(new Date().toISOString().slice(0, 10))
  const [latitud,      setLatitud]     = useState<number | undefined>()
  const [longitud,     setLongitud]    = useState<number | undefined>()
  const [urlImagen,    setUrlImagen]   = useState<string | undefined>()
  const [error,        setError]       = useState('')
  const [analizando,   setAnalizando]  = useState(false)
  const [analizado,    setAnalizado]   = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const globales = await obtenerCategoriasGlobales()
      const propias  = user ? await obtenerCategoriasUsuario(user.uid) : []
      const todas    = [...globales, ...propias]
      setCategorias(todas)
      if (todas.length > 0) setCategoriaId(todas[0].id)
    }
    cargar()
  }, [user])

  const handleCapturarFoto = async () => {
    setError('')
    setAnalizado(false)
    try {
      const photo = await CapCamera.getPhoto({
        quality:    80,
        resultType: CameraResultType.DataUrl,
        source:     CameraSource.Camera,
      })
      const dataUrl = photo.dataUrl!
      setUrlImagen(dataUrl)
      setAnalizando(true)
      try {
        const res = await analizarComprobante(dataUrl, categorias)
        setNaturaleza(res.naturaleza)
        setMonto(String(res.monto))
        setDescripcion(res.descripcion)
        const cat = categorias.find((c) => c.nombre.toLowerCase() === res.categoria_nombre.toLowerCase())
        if (cat) setCategoriaId(cat.id)
        setAnalizado(true)
      } catch (e: any) {
        setError('No se pudo analizar el comprobante: ' + e.message)
      } finally {
        setAnalizando(false)
      }
    } catch (e: any) {
      setError('No se pudo acceder a la cámara: ' + e.message)
    }
  }

  const handleCapturarUbicacion = async () => {
    try {
      const res  = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      if (data.latitude && data.longitude) {
        setLatitud(data.latitude)
        setLongitud(data.longitude)
      }
    } catch {
      // Sin internet — se omite la ubicación silenciosamente
    }
  }

  const handleGuardar = async () => {
    if (!user || !monto || !categoriaId) return
    setError('')
    try {
      await crearTransaccion({
        id_cuenta:    cuentaId,
        id_categoria: categoriaId,
        naturaleza,
        monto:        parseFloat(monto),
        fecha:        new Date(fecha),
        descripcion:  descripcion || undefined,
        latitud,
        longitud,
        url_imagen:   urlImagen,
      })
      history.replace(`/transactions/${cuentaId}`)
    } catch (e: any) {
      setError(e.message)
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Nueva</p>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Transacción</h1>
              </div>
            </header>

            <div className="bg-surface rounded-3xl shadow-card border border-border/40 p-6 space-y-5">

              {/* Foto / Gemini */}
              <button
                onClick={handleCapturarFoto}
                disabled={analizando}
                className={`w-full h-14 rounded-2xl border flex items-center justify-center gap-3 text-sm font-medium transition ${
                  analizado
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                    : 'bg-surface border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                } disabled:opacity-50`}
              >
                {analizando ? (
                  <><IonSpinner name="crescent" style={{ width: 18, height: 18 }} /> Analizando comprobante…</>
                ) : analizado ? (
                  <><Sparkles className="size-4" strokeWidth={2} /> Analizado con IA — edita si necesitas</>
                ) : (
                  <><Camera className="size-4" strokeWidth={2} /> Escanear comprobante con IA</>
                )}
              </button>

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
                  placeholder="0.00"
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
                  placeholder="¿En qué gastaste?"
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

              {/* Ubicación */}
              <button
                onClick={handleCapturarUbicacion}
                className="w-full h-12 rounded-2xl border border-border bg-surface text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 hover:border-primary/30 hover:text-foreground transition"
              >
                <MapPin className="size-4" strokeWidth={2} />
                {latitud ? `${latitud.toFixed(4)}, ${longitud?.toFixed(4)}` : 'Capturar ubicación'}
              </button>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              {/* Guardar */}
              <button
                onClick={handleGuardar}
                disabled={!monto || !categoriaId}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
              >
                Guardar transacción
              </button>

            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AddTransaction
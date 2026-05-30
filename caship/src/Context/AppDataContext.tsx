import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { onSnapshot, query, collection, where } from 'firebase/firestore'
import { db } from '@/integrations/firebase'
import { COLLECTIONS } from '@/constants/collections'
import {
  obtenerCategoriasGlobales,
  obtenerCategoriasUsuario,
} from '@/services/firestore.service'
import { runSeed } from '@/Helpers/seed'
import { useAuth } from '@/Hooks/useAuth'
import type { Cuenta } from '@/types'

interface AppDataCtx {
  cuentas: Cuenta[]
  categoriasMap: Record<string, string>
  loadingCuentas: boolean
}

const AppDataContext = createContext<AppDataCtx>({
  cuentas: [],
  categoriasMap: {},
  loadingCuentas: true,
})

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [cuentas, setCuentas]           = useState<Cuenta[]>([])
  const [categoriasMap, setCategoriasMap] = useState<Record<string, string>>({})
  const [loadingCuentas, setLoadingCuentas] = useState(true)
  const seedRan = useRef(false)

  // Seed only once per user session
  useEffect(() => {
    if (!user || seedRan.current) return
    seedRan.current = true
    runSeed().catch(console.error)
  }, [user])

  // onSnapshot for cuentas: fires immediately from IndexedDB cache, then from server
  useEffect(() => {
    if (!user) {
      setCuentas([])
      setLoadingCuentas(false)
      return
    }
    const q = query(
      collection(db, COLLECTIONS.CUENTAS),
      where('id_usuario', '==', user.uid),
      where('is_active',  '==', true)
    )
    return onSnapshot(
      q,
      snap => {
        setCuentas(snap.docs.map(d => d.data() as Cuenta))
        setLoadingCuentas(false)
      },
      err => { console.error(err); setLoadingCuentas(false) }
    )
  }, [user])

  // Categories: fetch once per session and cache in memory
  useEffect(() => {
    if (!user) return
    Promise.all([
      obtenerCategoriasGlobales(),
      obtenerCategoriasUsuario(user.uid),
    ]).then(([globales, propias]) => {
      const mapa: Record<string, string> = {}
      ;[...globales, ...propias].forEach(c => { mapa[c.id] = c.nombre })
      setCategoriasMap(mapa)
    }).catch(console.error)
  }, [user])

  return (
    <AppDataContext.Provider value={{ cuentas, categoriasMap, loadingCuentas }}>
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => useContext(AppDataContext)

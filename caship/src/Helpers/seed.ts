import { doc, setDoc, getDocs, collection } from 'firebase/firestore'
import { db } from '@/integrations/firebase'
import { COLLECTIONS } from '@/constants/collections'
import type { Moneda, Categoria } from '@/types'

const uuid = (): string => crypto.randomUUID()

const MONEDAS_SEED: Omit<Moneda, 'id'>[] = [
  { codigo: 'COP', nombre: 'Peso colombiano', simbolo: '$',  is_active: true },
  { codigo: 'USD', nombre: 'Dólar americano',  simbolo: '$',  is_active: true },
  { codigo: 'EUR', nombre: 'Euro',             simbolo: '€',  is_active: true },
  { codigo: 'GBP', nombre: 'Libra esterlina',  simbolo: '£',  is_active: true },
  { codigo: 'MXN', nombre: 'Peso mexicano',    simbolo: '$',  is_active: true },
  { codigo: 'BRL', nombre: 'Real brasileño',   simbolo: 'R$', is_active: true },
]

const CATEGORIAS_SEED: Omit<Categoria, 'id'>[] = [
  { nombre: 'Comida',          icono: 'restaurant-outline'     },
  { nombre: 'Transporte',      icono: 'car-outline'            },
  { nombre: 'Salud',           icono: 'medkit-outline'         },
  { nombre: 'Entretenimiento', icono: 'game-controller-outline'},
  { nombre: 'Servicios',       icono: 'flash-outline'          },
  { nombre: 'Vivienda',        icono: 'home-outline'           },
  { nombre: 'Ropa',            icono: 'shirt-outline'          },
  { nombre: 'Educación',       icono: 'book-outline'           },
  { nombre: 'Otros',           icono: 'ellipsis-horizontal-outline' },
]

export const runSeed = async (): Promise<void> => {
  const monedasSnap = await getDocs(collection(db, COLLECTIONS.MONEDAS))
  if (monedasSnap.empty) {
    for (const m of MONEDAS_SEED) {
      const id = uuid()
      await setDoc(doc(db, COLLECTIONS.MONEDAS, id), { id, ...m })
    }
    console.log('Seed: monedas insertadas')
  }

  const categoriasSnap = await getDocs(collection(db, COLLECTIONS.CATEGORIAS))
  if (categoriasSnap.empty) {
    for (const c of CATEGORIAS_SEED) {
      const id = uuid()
      await setDoc(doc(db, COLLECTIONS.CATEGORIAS, id), { id, ...c })
    }
    console.log('Seed: categorías insertadas')
  }
}

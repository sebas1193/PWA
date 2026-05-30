import {
  doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs,
  collection, query, where, Timestamp, writeBatch, deleteField,
} from 'firebase/firestore'
import { db } from '@/integrations/firebase'
import { COLLECTIONS, USER_CATEGORIAS } from '@/constants/collections'
import type { Usuario, Cuenta, Transaccion, Moneda, Categoria, Naturaleza } from '@/types'

const uuid = (): string => crypto.randomUUID()

// ══════════════════════════════════════════
// USUARIOS
// ══════════════════════════════════════════

export const crearUsuario = async (data: {
  uid:       string   // uid de Firebase Auth — usamos ese como document id
  nombres:   string
  apellidos: string
  email:     string
}): Promise<void> => {
  const now = Timestamp.now()
  const usuario: Usuario = {
    id:          data.uid,
    nombres:     data.nombres,
    apellidos:   data.apellidos,
    email:       data.email,
    passwd_hash: '',   // Firebase Auth maneja la contraseña — no la guardamos
    is_active:   true,
    created_at:  now,
    updated_at:  now,
  }
  await setDoc(doc(db, COLLECTIONS.USUARIOS, data.uid), usuario)
}

export const obtenerUsuario = async (uid: string): Promise<Usuario | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.USUARIOS, uid))
  return snap.exists() ? (snap.data() as Usuario) : null
}

// ══════════════════════════════════════════
// MONEDAS (solo lectura)
// ══════════════════════════════════════════

export const obtenerMonedas = async (): Promise<Moneda[]> => {
  const snap = await getDocs(collection(db, COLLECTIONS.MONEDAS))
  return snap.docs.map((d) => d.data() as Moneda)
}

// ══════════════════════════════════════════
// CATEGORÍAS
// ══════════════════════════════════════════

// Categorías globales (del seed)
export const obtenerCategoriasGlobales = async (): Promise<Categoria[]> => {
  const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIAS))
  return snap.docs.map((d) => d.data() as Categoria)
}

// Categorías propias del usuario — /usuarios/{uid}/categorias
export const obtenerCategoriasUsuario = async (uid: string): Promise<Categoria[]> => {
  const ref  = collection(db, COLLECTIONS.USUARIOS, uid, USER_CATEGORIAS)
  const snap = await getDocs(ref)
  return snap.docs.map((d) => d.data() as Categoria)
}

export const crearCategoriaUsuario = async (
  uid: string,
  data: { nombre: string; icono: string }
): Promise<string> => {
  const id  = uuid()
  const cat: Categoria = { id, ...data }
  await setDoc(doc(db, COLLECTIONS.USUARIOS, uid, USER_CATEGORIAS, id), cat)
  return id
}

export const eliminarCategoriaUsuario = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.USUARIOS, uid, USER_CATEGORIAS, id))
}

// ══════════════════════════════════════════
// CUENTAS
// ══════════════════════════════════════════

export const crearCuenta = async (data: {
  id_usuario: string
  id_moneda:  string
  nombre:     string
}): Promise<string> => {
  const id  = uuid()
  const now = Timestamp.now()
  const cuenta: Cuenta = {
    id,
    ...data,
    saldo:      0,
    is_active:  true,
    created_at: now,
    updated_at: now,
  }
  await setDoc(doc(db, COLLECTIONS.CUENTAS, id), cuenta)
  return id
}

export const obtenerCuentasDeUsuario = async (uid: string): Promise<Cuenta[]> => {
  const q    = query(
    collection(db, COLLECTIONS.CUENTAS),
    where('id_usuario', '==', uid),
    where('is_active',  '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Cuenta)
}

export const actualizarNombreCuenta = async (id: string, nombre: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.CUENTAS, id), {
    nombre,
    updated_at: Timestamp.now(),
  })
}

// Soft delete
export const eliminarCuenta = async (id: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.CUENTAS, id), {
    is_active:  false,
    updated_at: Timestamp.now(),
  })
}

// ══════════════════════════════════════════
// TRANSACCIONES
// ══════════════════════════════════════════

export const crearTransaccion = async (data: {
  id_cuenta:    string
  id_categoria: string
  naturaleza:   Naturaleza
  monto:        number
  fecha:        Date
  descripcion?: string
  latitud?:     number
  longitud?:    number
  url_imagen?:  string
}): Promise<string> => {
  const id  = uuid()   // UUID generado en cliente — funciona offline
  const now = Timestamp.now()

  const transaccion: Transaccion = {
    id,
    id_cuenta:    data.id_cuenta,
    id_categoria: data.id_categoria,
    naturaleza:   data.naturaleza,
    monto:        data.monto,
    fecha:        Timestamp.fromDate(data.fecha),
    created_at:   now,
    updated_at:   now,
    ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
    ...(data.latitud     !== undefined && { latitud:     data.latitud }),
    ...(data.longitud    !== undefined && { longitud:    data.longitud }),
    ...(data.url_imagen  !== undefined && { url_imagen:  data.url_imagen }),
  }

  // writeBatch funciona offline (se sincroniza al reconectar), runTransaction no
  const cuentaRef  = doc(db, COLLECTIONS.CUENTAS, data.id_cuenta)
  const cuentaSnap = await getDoc(cuentaRef)
  if (!cuentaSnap.exists()) throw new Error('Cuenta no encontrada')

  const saldoActual = (cuentaSnap.data() as Cuenta).saldo
  const delta       = data.naturaleza === 'ingreso' ? data.monto : -data.monto

  const batch = writeBatch(db)
  batch.set(doc(db, COLLECTIONS.TRANSACCIONES, id), transaccion)
  batch.update(cuentaRef, { saldo: saldoActual + delta, updated_at: now })
  await batch.commit()

  return id
}

export const obtenerTransaccionesDeCuenta = async (id_cuenta: string): Promise<Transaccion[]> => {
  const q    = query(
    collection(db, COLLECTIONS.TRANSACCIONES),
    where('id_cuenta', '==', id_cuenta)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Transaccion)
}

export const obtenerTransaccion = async (id: string): Promise<Transaccion | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.TRANSACCIONES, id))
  return snap.exists() ? (snap.data() as Transaccion) : null
}

export const eliminarTransaccion = async (
  id:         string,
  id_cuenta:  string,
  naturaleza: Naturaleza,
  monto:      number
): Promise<void> => {
  const cuentaRef  = doc(db, COLLECTIONS.CUENTAS, id_cuenta)
  const cuentaSnap = await getDoc(cuentaRef)
  if (!cuentaSnap.exists()) throw new Error('Cuenta no encontrada')

  const saldoActual = (cuentaSnap.data() as Cuenta).saldo
  const delta = naturaleza === 'ingreso' ? -monto : monto  // reversa del efecto original

  const batch = writeBatch(db)
  batch.delete(doc(db, COLLECTIONS.TRANSACCIONES, id))
  batch.update(cuentaRef, { saldo: saldoActual + delta, updated_at: Timestamp.now() })
  await batch.commit()
}

export const actualizarTransaccion = async (
  id:        string,
  id_cuenta: string,
  anterior:  { naturaleza: Naturaleza; monto: number },
  datos: {
    id_categoria: string
    naturaleza:   Naturaleza
    monto:        number
    fecha:        Date
    descripcion?: string
    latitud?:     number
    longitud?:    number
    url_imagen?:  string
  }
): Promise<void> => {
  const cuentaRef  = doc(db, COLLECTIONS.CUENTAS, id_cuenta)
  const cuentaSnap = await getDoc(cuentaRef)
  if (!cuentaSnap.exists()) throw new Error('Cuenta no encontrada')

  const saldoActual   = (cuentaSnap.data() as Cuenta).saldo
  const deltaAnterior = anterior.naturaleza === 'ingreso' ?  anterior.monto : -anterior.monto
  const deltaNuevo    = datos.naturaleza    === 'ingreso' ?  datos.monto    : -datos.monto
  const netDelta      = deltaNuevo - deltaAnterior

  const now = Timestamp.now()
  const updates: Record<string, any> = {
    id_categoria: datos.id_categoria,
    naturaleza:   datos.naturaleza,
    monto:        datos.monto,
    fecha:        Timestamp.fromDate(datos.fecha),
    updated_at:   now,
    descripcion:  datos.descripcion ?? deleteField(),
    latitud:      datos.latitud     ?? deleteField(),
    longitud:     datos.longitud    ?? deleteField(),
    url_imagen:   datos.url_imagen  ?? deleteField(),
  }

  const batch = writeBatch(db)
  batch.update(doc(db, COLLECTIONS.TRANSACCIONES, id), updates)
  batch.update(cuentaRef, { saldo: saldoActual + netDelta, updated_at: now })
  await batch.commit()
}

export const obtenerTransaccionesDeUsuario = async (
  cuentaIds: string[]
): Promise<Transaccion[]> => {
  if (cuentaIds.length === 0) return []
  const q    = query(
    collection(db, COLLECTIONS.TRANSACCIONES),
    where('id_cuenta', 'in', cuentaIds)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Transaccion)
}

export const obtenerResumenTransacciones = async (
  cuentaIds: string[]
): Promise<{ totalIngresos: number; egresoMasAlto: number }> => {
  if (cuentaIds.length === 0) return { totalIngresos: 0, egresoMasAlto: 0 }

  const q    = query(
    collection(db, COLLECTIONS.TRANSACCIONES),
    where('id_cuenta', 'in', cuentaIds)
  )
  const snap = await getDocs(q)
  const txs  = snap.docs.map((d) => d.data() as Transaccion)

  const totalIngresos = txs
    .filter((t) => t.naturaleza === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0)

  const egresoMasAlto = txs
    .filter((t) => t.naturaleza === 'egreso')
    .reduce((max, t) => Math.max(max, t.monto), 0)

  return { totalIngresos, egresoMasAlto }
}

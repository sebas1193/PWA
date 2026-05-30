import { Timestamp } from 'firebase/firestore'

export interface Usuario {
  id:          string
  nombres:     string
  apellidos:   string
  email:       string
  passwd_hash: string
  is_active:   boolean
  created_at:  Timestamp
  updated_at:  Timestamp
}

export interface Moneda {
  id:        string
  codigo:    string
  nombre:    string
  simbolo:   string
  is_active: boolean
}

export interface Categoria {
  id:     string
  nombre: string
  icono:  string
}

export interface Cuenta {
  id:          string
  id_usuario:  string
  id_moneda:   string
  nombre:      string
  saldo:       number
  is_active:   boolean
  created_at:  Timestamp
  updated_at:  Timestamp
}

export interface Transaccion {
  id:           string
  id_cuenta:    string
  id_categoria: string
  naturaleza:   Naturaleza
  monto:        number
  descripcion?: string
  fecha:        Timestamp
  latitud?:     number
  longitud?:    number
  url_imagen?:  string
  created_at:   Timestamp
  updated_at:   Timestamp
}

export type Naturaleza = 'ingreso' | 'egreso'

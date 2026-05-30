export const COLLECTIONS = {
  USUARIOS:      'usuarios',
  MONEDAS:       'monedas',
  CATEGORIAS:    'categorias',
  CUENTAS:       'cuentas',
  TRANSACCIONES: 'transacciones',
} as const

// Subcollección de categorías propias del usuario
// Ruta: /usuarios/{uid}/categorias/{id}
export const USER_CATEGORIAS = 'categorias'

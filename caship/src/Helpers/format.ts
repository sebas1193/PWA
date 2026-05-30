const formatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatMonto = (n: number): string => formatter.format(n)

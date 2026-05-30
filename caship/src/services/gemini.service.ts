import type { Categoria, Naturaleza } from '@/types'

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string
const MODEL   = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4.1-mini'

export interface GeminiTransaccion {
  naturaleza:       Naturaleza
  monto:            number
  descripcion:      string
  categoria_nombre: string
}

export const analizarComprobante = async (
  dataUrl:    string,
  categorias: Categoria[]
): Promise<GeminiTransaccion> => {
  const nombresCategoria = categorias.map((c) => c.nombre).join(', ')

  const prompt = `Analiza esta imagen de un comprobante, recibo o transacción financiera.
Responde ÚNICAMENTE con un objeto JSON válido — sin texto adicional, sin bloques de código, sin explicaciones.

Estructura obligatoria:
{
  "naturaleza": "egreso" | "ingreso",
  "monto": <número positivo sin símbolos de moneda>,
  "descripcion": "<descripción breve, máximo 80 caracteres>",
  "categoria_nombre": "<exactamente una de las categorías disponibles>"
}

Categorías disponibles: ${nombresCategoria}

Reglas de clasificación:
- naturaleza = "egreso" si es un pago, compra, factura o cobro.
- naturaleza = "ingreso" si es un depósito, salario, transferencia recibida o reembolso.
- monto = valor total de la transacción como número (ej: 25000, 15.99).
- descripcion = qué se compró o de dónde viene el ingreso.
- categoria_nombre = debe coincidir exactamente con una de las categorías disponibles.
- Si no puedes determinar un campo usa: naturaleza="egreso", monto=0, descripcion="Transacción", categoria_nombre="Otros".`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model:           MODEL,
      temperature:     0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role:    'user',
          content: [
            { type: 'text',      text: prompt },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`OpenAI ${res.status}: ${(err as any)?.error?.message ?? res.statusText}`)
  }

  const data = await res.json()
  const text = (data.choices?.[0]?.message?.content ?? '').trim()

  let resultado: GeminiTransaccion
  try {
    resultado = JSON.parse(text)
  } catch {
    throw new Error('La respuesta del modelo no es un JSON válido')
  }

  resultado.monto = Math.abs(Number(resultado.monto) || 0)

  if (resultado.naturaleza !== 'ingreso' && resultado.naturaleza !== 'egreso') {
    resultado.naturaleza = 'egreso'
  }

  const coincide = categorias.some(
    (c) => c.nombre.toLowerCase() === resultado.categoria_nombre?.toLowerCase()
  )
  if (!coincide) resultado.categoria_nombre = 'Otros'

  return resultado
}

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

export type ProductForAI = {
  id: number
  name: string
  brand: string | null
  category: string | null
  specs: {
    processor: string | null
    gpu: string | null
    ram: string | null
    storage: string | null
    screen: string | null
    operatingSystem: string | null
  } | null
  price: number
}

export type AIRecommendation = {
  productId: number
  score: number
  reason: string
  advantages: string[]
  disadvantages: string[]
}

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    })
  }

  async generateRecommendations(params: {
    usageType: string
    budget: number
    priority: string
    deviceType: string
    products: ProductForAI[]
  }): Promise<AIRecommendation[]> {
    const { usageType, budget, priority, deviceType, products } = params

    if (products.length === 0) return []

    const productsDescription = products
      .map(
        (p, i) =>
          `[${i + 1}] ID:${p.id} | ${p.name} | ${p.brand} | S/${p.price} | CPU: ${p.specs?.processor ?? 'N/A'} | GPU: ${p.specs?.gpu ?? 'N/A'} | RAM: ${p.specs?.ram ?? 'N/A'} | Disco: ${p.specs?.storage ?? 'N/A'} | Pantalla: ${p.specs?.screen ?? 'N/A'}`,
      )
      .join('\n')

    const prompt = `Eres un asesor experto en tecnología para el mercado peruano. Analiza los siguientes equipos y recomienda los 3 mejores para el usuario.

        PERFIL DEL USUARIO:
        - Tipo de equipo: ${deviceType}
        - Uso principal: ${usageType}
        - Presupuesto: S/ ${budget}
        - Prioridad: ${priority}

        PRODUCTOS DISPONIBLES:
        ${productsDescription}

        INSTRUCCIONES:
        1. Selecciona exactamente 3 productos (o menos si no hay suficientes).
        2. Ordénalos de menor a mayor precio (económica, recomendada, mejor opción).
        3. Evalúa cada uno con un score de 1 a 10 basado en qué tan bien se ajusta al perfil del usuario.
        4. Explica por qué recomiendas cada uno en español, máximo 2 oraciones.
        5. Lista ventajas y desventajas (máximo 3 cada uno).

        Responde SOLO en JSON con este formato exacto (sin markdown ni texto extra):
        [
          {
            "productId": <number>,
            "score": <number 1-10>,
            "reason": "<string>",
            "advantages": ["<string>", ...],
            "disadvantages": ["<string>", ...]
          }
        ]`

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      })

      console.log(' Respuesta de IA: ', response.choices[0]?.message?.content?.trim())

      const content = response.choices[0]?.message?.content?.trim() ?? '[]'

      // Parse JSON — handle potential markdown code block wrapping
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(jsonStr) as AIRecommendation[]

      // Validate that returned product IDs exist in our list
      const validIds = new Set(products.map((p) => p.id))

      return parsed.filter((r) => validIds.has(r.productId))
    } catch (error) {
      console.error('OpenAI recommendation error:', error)

      return []
    }
  }
}

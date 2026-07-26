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
  limitations: string[]
  upgradeOptions: string[]
  overpriced: boolean
  priceVerdict: string
}

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI | null

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim()
    this.client = apiKey
      ? new OpenAI({ apiKey })
      : null
  }

  async generateRecommendations(params: {
    usageType: string
    budget: number
    priority: string
    deviceType: string
    brandPreference?: string | null
    products: ProductForAI[]
  }): Promise<AIRecommendation[]> {
    const { usageType, budget, priority, deviceType, brandPreference, products } = params

    if (!this.client) {
      console.warn('OPENAI_API_KEY no configurada: recomendaciones IA omitidas')
      return []
    }

    if (products.length === 0) return []

    const productsDescription = products
      .map(
        (p, i) =>
          `[${i + 1}] ID:${p.id} | ${p.name} | ${p.brand} | S/${p.price} | CPU: ${p.specs?.processor ?? 'N/A'} | GPU: ${p.specs?.gpu ?? 'N/A'} | RAM: ${p.specs?.ram ?? 'N/A'} | Disco: ${p.specs?.storage ?? 'N/A'} | Pantalla: ${p.specs?.screen ?? 'N/A'}`,
      )
      .join('\n')

    const brandNote = brandPreference
      ? `\n- Preferencia de marca: ${brandPreference} (priorizar equipos con procesador ${brandPreference} si es posible, pero no descartar alternativas superiores)`
      : ''

    const prompt = `Eres un asesor experto en hardware y tecnología para el mercado peruano. Analiza los siguientes equipos y recomienda los 3 mejores para el usuario. Debes ser técnico y específico en tus explicaciones.

ESTÁNDARES MÍNIMOS RECOMENDADOS (2025):
- RAM: 16GB mínimo para cualquier uso. 8GB es insuficiente para multitarea moderna. Si el equipo tiene menos de 16GB, ADVERTIR al usuario que tendrá limitaciones y que lo hace bajo su responsabilidad.
- Almacenamiento: SSD obligatorio. HDD como almacenamiento secundario únicamente.
- Para gaming: GPU dedicada obligatoria, mínimo 6GB VRAM para juegos AAA.
- Para programación: mínimo 16GB RAM (idealmente 32GB si usa Docker/VMs).
- Para diseño: pantalla con buena cobertura de color (sRGB 100%+), mínimo 16GB RAM.
- Si un equipo no cumple estos estándares, DEBE mencionarse como desventaja o limitación.

CONOCIMIENTO TÉCNICO DE PROCESADORES Y GRÁFICOS:
- Los gráficos integrados Intel (UHD, Iris Xe) son MALOS para gaming y diseño pesado. Solo sirven para ofimática y navegación. Si el equipo solo tiene gráficos Intel y el uso es gaming/diseño, debe ser una desventaja clara.
- Intel tiene mejor rendimiento en single-core (un solo núcleo) — más estable para aplicaciones que dependen de un hilo principal (juegos, apps de oficina, compilación secuencial).
- AMD Ryzen tiene mejor rendimiento multi-core — superior en tareas paralelas (renderizado, compilación multi-hilo, VMs, streaming).
- Ryzen tiene menor estabilidad en mono-núcleo comparado con Intel de misma generación.
- Para GAMING: Intel suele dar más FPS por su single-core superior.
- Para PRODUCTIVIDAD/MULTITAREA: Ryzen suele ser mejor por más núcleos/hilos por el precio.
- Estas diferencias DEBEN reflejarse en las ventajas/desventajas según el uso del usuario.

    PERFIL DEL USUARIO:
    - Tipo de equipo: ${deviceType}
    - Uso principal: ${usageType}
    - Presupuesto: S/ ${budget}
    - Prioridad: ${priority}${brandNote}

    PRODUCTOS DISPONIBLES:
    ${productsDescription}

    INSTRUCCIONES:
    1. Selecciona exactamente 3 productos (o menos si no hay suficientes).
    2. Ordénalos de menor a mayor precio (económica, recomendada, mejor opción).
    3. Evalúa cada uno con un score de 1 a 10 basado en qué tan bien se ajusta al perfil.
    4. Explica por qué recomiendas cada uno en español, máximo 2 oraciones claras. El reason DEBE ser 100% positivo — solo menciona por qué es buena opción para el usuario. NO incluyas comparaciones negativas ni desventajas en el reason, esas van en el campo disadvantages.
    5. Lista ventajas técnicas (máximo 3).
    6. Lista desventajas o puntos débiles (máximo 3).
    7. Lista limitaciones técnicas a futuro — cosas como máxima RAM soportada, slots disponibles, compatibilidad de upgrades, limitaciones del socket o chipset (máximo 3).
    8. Lista opciones de mejora futura — qué componentes podría cambiar o agregar después para mejorar rendimiento (máximo 3).
    9. Evalúa si el precio es justo: compara el precio con lo que ofrecen las especificaciones. Si el precio está significativamente inflado para lo que ofrece, marca overpriced=true. Si es precio justo o buena oferta, marca overpriced=false.

    Responde SOLO en JSON con este formato exacto (sin markdown ni texto extra):
    [
      {
        "productId": <number>,
        "score": <number 1-10>,
        "reason": "<string>",
        "advantages": ["<string>", ...],
        "disadvantages": ["<string>", ...],
        "limitations": ["<string>", ...],
        "upgradeOptions": ["<string>", ...],
        "overpriced": <boolean>,
        "priceVerdict": "<string corto: 'Buen precio', 'Precio justo', 'Precio elevado', etc.>"
      }
    ]`

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '[]'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(jsonStr) as AIRecommendation[]

      const validIds = new Set(products.map((p) => p.id))

      return parsed.filter((r) => validIds.has(r.productId))
    } catch (error) {
      console.error('OpenAI recommendation error:', error)

      return []
    }
  }

  async generatePCBuild(params: {
    usageType: string
    budget: number
    brandPreference?: string | null
    availableComponents?: Array<{ id: number; name: string; brand: string | null; category: string | null; price: number; companyId: number }>
  }): Promise<{
    components: Array<{ category: string; name: string; brand: string; price: number; tier: string; reason: string }>
    totalPrice: number
    summary: { level: string; compatibilityScore: number; whyThisConfig: string[] }
    compatibility: Array<{ check: string; status: string }>
    warnings: string[]
    performance: { ratings: Array<{ category: string; score: number }>; capabilities: string[] }
    powerConsumption: { estimated: number; recommended: number; margin: number }
    futureUpgrades: string[]
    explanation: string
  } | null> {
    const { usageType, budget, brandPreference, availableComponents } = params

    const brandNote = brandPreference && brandPreference !== 'sin preferencia'
      ? `\n- Preferencia de procesador: ${brandPreference}`
      : ''

    const inventorySection = availableComponents && availableComponents.length > 0
      ? `\nCOMPONENTES DISPONIBLES EN INVENTARIO (prioriza estos):
${availableComponents.map((c) => `- ID:${c.id} | ${c.name} | ${c.brand} | ${c.category} | S/${c.price}`).join('\n')}`
      : ''

    const prompt = `Eres un experto armador de PCs para el mercado peruano. Genera una configuración completa con análisis detallado.

REGLAS CRÍTICAS:
- Si el CPU no tiene gráficos integrados (termina en F, ej: i5-13600KF), DEBES incluir GPU dedicada obligatoriamente. Esto es un error grave si no se detecta.
- RAM mínimo 16GB en Dual Channel (2 sticks).
- SSD NVMe obligatorio.
- Fuente 80+ con al menos 100W de margen.
- Todos los componentes deben ser compatibles (socket, chipset, tipo RAM, factor forma).
- Explica TODO en lenguaje sencillo, como si hablaras con alguien que no sabe de hardware.

PERFIL:
- Uso: ${usageType}
- Presupuesto: S/ ${budget}${brandNote}
${inventorySection}

Responde SOLO en JSON (sin markdown):
{
  "components": [
    { "category": "Procesador", "name": "<modelo>", "brand": "<marca>", "price": <number>, "tier": "<entrada|media|alta|entusiasta>", "reason": "<explicación simple de por qué este componente>" }
  ],
  "totalPrice": <number>,
  "summary": {
    "level": "<Gama entrada|media|alta|entusiasta>",
    "compatibilityScore": <80-100>,
    "whyThisConfig": ["<razón simple 1>", "<razón simple 2>", "<razón simple 3>"]
  },
  "compatibility": [
    { "check": "<qué se validó>", "status": "ok|warning|error" }
  ],
  "warnings": ["<advertencia importante si la hay, ej: requiere GPU dedicada>"],
  "performance": {
    "ratings": [
      { "category": "<uso>", "score": <1-5> }
    ],
    "capabilities": ["<qué podrás hacer con esta PC, lenguaje simple>"]
  },
  "powerConsumption": {
    "estimated": <watts consumo>,
    "recommended": <watts fuente>,
    "margin": <watts disponibles>
  },
  "futureUpgrades": ["<mejora posible>"],
  "explanation": "<resumen de 2 oraciones de por qué esta config es ideal>"
}`

    try {
      const client = this.client
      if (!client) return null
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '{}'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')

      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('OpenAI PC build error:', error)

      return null
    }
  }

  async generateComparison(params: {
    product1: ProductForAI
    product2: ProductForAI
    product3?: ProductForAI
    usageContext?: string
  }): Promise<{
    recommendation: { productName: string; score: number; keyReasons: string[]; tradeoffs: string[] }
    summary: Array<{ useCase: string; icon: string; bestProduct: string }>
    specs_comparison: Array<{ category: string; product1: string; product2: string; product3?: string; winner: string }>
    ratings: Array<{ category: string; product1Score: number; product2Score: number; product3Score?: number }>
  } | null> {
    const { product1, product2, product3, usageContext } = params

    if (!this.client) {
      console.warn('OPENAI_API_KEY no configurada: comparación IA omitida')
      return null
    }

    const formatProduct = (p: ProductForAI) =>
      `${p.name} | ${p.brand} | S/${p.price} | CPU: ${p.specs?.processor ?? 'N/A'} | GPU: ${p.specs?.gpu ?? 'N/A'} | RAM: ${p.specs?.ram ?? 'N/A'} | Disco: ${p.specs?.storage ?? 'N/A'} | Pantalla: ${p.specs?.screen ?? 'N/A'}`

    const usageNote = usageContext ? `\nEl usuario busca un equipo para: ${usageContext}` : ''

    const productCount = product3 ? 3 : 2
    const productsText = product3
      ? `PRODUCTO 1: ${formatProduct(product1)}\nPRODUCTO 2: ${formatProduct(product2)}\nPRODUCTO 3: ${formatProduct(product3)}`
      : `PRODUCTO 1: ${formatProduct(product1)}\nPRODUCTO 2: ${formatProduct(product2)}`

    const specsFormat = product3
      ? '{ "category": "<spec>", "product1": "<spec>", "product2": "<spec>", "product3": "<spec>", "winner": "product1|product2|product3|empate" }'
      : '{ "category": "<spec>", "product1": "<spec>", "product2": "<spec>", "winner": "product1|product2|empate" }'

    const ratingsFormat = product3
      ? '{ "category": "<cat>", "product1Score": <1-5>, "product2Score": <1-5>, "product3Score": <1-5> }'
      : '{ "category": "<cat>", "product1Score": <1-5>, "product2Score": <1-5> }'

    const prompt = `Eres un experto en hardware para el mercado peruano. Compara estos ${productCount} equipos de forma clara y visual.${usageNote}

${productsText}

INSTRUCCIONES:
1. Da una recomendación contextual. NO uses la palabra "Ganador". Usa "Nuestra recomendación" o "La mejor opción según tu perfil".
2. Da 3 razones clave en bullets cortos de por qué recomiendas ese producto.
3. Menciona 1-2 cosas que sacrificas al elegir esa opción.
4. Genera un resumen rápido: para cada tipo de uso (Gaming, Productividad, Calidad-precio), indica cuál de los ${productCount} productos es mejor.
5. Compara specs de los ${productCount} productos con indicador de cuál gana.
6. Puntúa cada producto del 1 al 5 en: Gaming, Productividad, Portabilidad, Relación precio/rendimiento.

Responde SOLO en JSON (sin markdown):
{
  "recommendation": {
    "productName": "<nombre del producto recomendado>",
    "score": <número 1-100>,
    "keyReasons": ["<razón corta 1>", "<razón corta 2>", "<razón corta 3>"],
    "tradeoffs": ["<lo que sacrificas 1>", "<lo que sacrificas 2>"]
  },
  "summary": [
    { "useCase": "Gaming", "icon": "🎮", "bestProduct": "<nombre>" },
    { "useCase": "Productividad", "icon": "💼", "bestProduct": "<nombre>" },
    { "useCase": "Calidad-precio", "icon": "💰", "bestProduct": "<nombre>" }
  ],
  "specs_comparison": [
    ${specsFormat},
    ...
  ],
  "ratings": [
    ${ratingsFormat},
    ...
  ]
}`

    try {
      const client = this.client
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '{}'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')

      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('OpenAI comparison error:', error)

      return null
    }
  }

  async generateScrapeConfig(params: {
    name: string
    website: string
    pageHints?: Array<{
      url: string
      title: string | null
      sampleLinks: string[]
      categoryLinks?: string[]
      bodySnippet: string
      htmlSnippet: string
      error?: string
    }>
  }): Promise<Record<string, unknown> | null> {
    if (!this.client) {
      console.warn('OPENAI_API_KEY no configurada: scrapeConfig IA omitido')
      return null
    }

    const { name, website, pageHints = [] } = params

    const hintsBlock =
      pageHints.length > 0
        ? pageHints
            .map(
              (h, i) =>
                `--- PAGINA ${i + 1}: ${h.url}
title: ${h.title ?? 'N/A'}
error: ${h.error ?? 'none'}
categoryLinks detectados:
${(h.categoryLinks || []).slice(0, 30).join('\n') || '(ninguno)'}
productLinks / sampleLinks:
${(h.sampleLinks || []).slice(0, 25).join('\n') || '(ninguno)'}
bodySnippet:
${h.bodySnippet || '(vacío)'}
htmlSnippet:
${h.htmlSnippet || '(vacío)'}`,
            )
            .join('\n\n')
        : '(sin HTML capturado; usa tu conocimiento de la tienda y patrones típicos de e-commerce PE de hardware)'

    const prompt = `Eres un experto en web scraping con Playwright.
El usuario te pide exactamente esto (como en ChatGPT):
"Establéceme un JSON robusto de la web ${website} (tienda: ${name}) para la finalidad de hacerle scraping de catálogo/productos."

TU TRABAJO:
- Analiza la web (nombre + URL + evidencia HTML/links si hay).
- TÚ identificas las URLs de categorías relevantes (laptops, procesadores, RAM, monitores, etc.).
- TÚ defines selectores, paginación y anti-bot.
- El usuario NO te pasa URLs de categoría; debes descubrirlas.

EVIDENCIA CAPTURADA DEL SITIO:
${hintsBlock}

REGLAS:
1. Responde SOLO JSON válido (sin markdown ni texto extra).
2. categories DEBE incluir URLs reales detectadas en la evidencia cuando existan. Si no hay evidencia, propone rutas plausibles del mismo dominio y acláralo en notes.
3. listing.productLinkSelector obligatorio y estable.
4. product: name, price, priceCurrencyHint ("S/"), image, specs.
5. pagination.type: link | query | client | unknown.
6. Si hay Cloudflare/anti-bot, márcalo en antiBot y notes.
7. baseUrl = origen canónico de ${website}.
8. Incluye sampleProductUrl si aparece un link de ficha claro.
9. JSON robusto y listo para scrapear (waitMs, maxPages).

SCHEMA EXACTO:
{
  "baseUrl": "https://...",
  "platform": "unknown|nextjs|custom-php|woocommerce|shopify|other",
  "notes": "string",
  "categories": [{ "name": "laptops", "url": "https://..." }],
  "sampleProductUrl": "https://... o null",
  "pagination": { "type": "link|query|client|unknown", "nextSelector": "string?", "param": "page?", "start": 1 },
  "listing": { "productLinkSelector": "string", "waitMs": 2500, "maxPages": 20 },
  "product": {
    "name": "string",
    "price": "string",
    "priceCurrencyHint": "S/",
    "image": "string",
    "specs": "string"
  },
  "antiBot": { "cloudflare": false, "requiresPlaywrightStealth": false }
}`

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content?.trim() ?? '{}'
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null
      }

      if (!parsed.baseUrl) parsed.baseUrl = website
      return parsed
    } catch (error) {
      console.error('OpenAI scrapeConfig error:', error)
      return null
    }
  }
}

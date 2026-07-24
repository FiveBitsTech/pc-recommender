import { Inject, Injectable } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../products/domain/repositories/product.repository'
import { OpenAIService } from '../../../../shared/openai/openai.service'

const COMPONENT_CATEGORIES = [
  'procesador',
  'placa madre',
  'ram',
  'memoria ram',
  'gpu',
  'tarjeta gráfica',
  'ssd',
  'almacenamiento',
  'fuente',
  'fuente de poder',
  'case',
  'gabinete',
]

@Injectable()
export class BuildPCUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly openAIService: OpenAIService,
  ) {}

  async execute(params: { usageType: string; budget: number; brandPreference?: string | null }) {
    // 1. Fetch real components from DB
    const allProducts = await this.productRepository.findAll()

    const realComponents = allProducts.filter((p) =>
      COMPONENT_CATEGORIES.some((cat) =>
        p.category?.toLowerCase().includes(cat),
      ),
    )

    // 2. Generate build with AI (passing real components if available)
    const result = await this.openAIService.generatePCBuild({
      ...params,
      availableComponents: realComponents.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: Number(p.latestPrice?.price ?? 0),
        companyId: p.companyId,
      })),
    })

    if (!result) {
      return {
        components: [],
        totalPrice: 0,
        compatibility: [],
        explanation: 'No se pudo generar la configuración en este momento. Intenta de nuevo.',
        futureUpgrades: [],
      }
    }

    // 3. Match AI suggestions with real products from DB
    const enrichedComponents = result.components.map((comp) => {
      // Try to find a real product that matches this component
      const match = realComponents.find((p) => {
        const nameMatch = p.name.toLowerCase().includes(comp.name.toLowerCase()) ||
          comp.name.toLowerCase().includes(p.name?.toLowerCase() ?? '')

        const categoryMatch = p.category?.toLowerCase().includes(comp.category.toLowerCase()) ||
          comp.category.toLowerCase().includes(p.category?.toLowerCase() ?? '')

        return nameMatch || (categoryMatch && p.brand?.toLowerCase() === comp.brand.toLowerCase())
      })

      if (match) {
        return {
          ...comp,
          price: Number(match.latestPrice?.price ?? comp.price),
          productId: match.id,
          companyId: match.companyId,
          productUrl: null, // Will be enriched if needed
          source: 'database' as const,
        }
      }

      return {
        ...comp,
        productId: null,
        companyId: null,
        productUrl: null,
        source: 'estimated' as const,
      }
    })

    const totalPrice = enrichedComponents.reduce((sum, c) => sum + c.price, 0)

    return {
      components: enrichedComponents,
      totalPrice,
      compatibility: result.compatibility,
      explanation: result.explanation,
      futureUpgrades: result.futureUpgrades,
      hasRealPrices: enrichedComponents.some((c) => c.source === 'database'),
    }
  }
}

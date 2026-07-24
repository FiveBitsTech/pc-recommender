import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { OpenAIService } from '../../../../shared/openai/openai.service'
import { ScrapeConfigHtmlProbe } from '../../infrastructure/scrape-config-html.probe'

@Injectable()
export class GenerateScrapeConfigUseCase {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly htmlProbe: ScrapeConfigHtmlProbe,
  ) {}

  async execute(input: {
    name: string
    website: string
    probe?: boolean
  }) {
    const name = input.name?.trim()
    const website = this.normalizeUrl(input.website)

    if (!name || name.length < 2) {
      throw new BadRequestException('name es obligatorio')
    }
    if (!website) {
      throw new BadRequestException('website/url de la tienda es obligatorio')
    }

    const shouldProbe = input.probe !== false
    const pageHints = shouldProbe ? await this.htmlProbe.captureFromWebsite(website) : []

    const scrapeConfig = await this.openAIService.generateScrapeConfig({
      name,
      website,
      pageHints,
    })

    if (!scrapeConfig) {
      throw new ServiceUnavailableException(
        'No se pudo generar scrapeConfig con IA. Verifica OPENAI_API_KEY o reintenta.',
      )
    }

    return {
      scrapeConfig,
      meta: {
        name,
        website,
        probed: shouldProbe,
        pagesProbed: pageHints.map((h) => ({ url: h.url, ok: !h.error, error: h.error ?? null })),
      },
    }
  }

  private normalizeUrl(raw?: string | null): string | null {
    const value = String(raw || '').trim()
    if (!value) return null
    try {
      const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
      const url = new URL(withProtocol)
      if (!['http:', 'https:'].includes(url.protocol)) return null
      return url.toString()
    } catch {
      return null
    }
  }
}

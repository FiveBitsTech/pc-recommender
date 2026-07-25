import { Injectable, Logger } from '@nestjs/common'

export type PageHints = {
  url: string
  title: string | null
  sampleLinks: string[]
  categoryLinks: string[]
  bodySnippet: string
  htmlSnippet: string
  error?: string
}

const CATEGORY_HINT =
  /categor|subcategor|listado|search|laptop|procesador|memoria|monitor|placa|disco|pc-|desktop|gpu|grafica|fuente|case|producto/i

@Injectable()
export class ScrapeConfigHtmlProbe {
  private readonly logger = new Logger(ScrapeConfigHtmlProbe.name)

  async captureFromWebsite(website: string): Promise<PageHints[]> {
    const base = website?.trim()
    if (!base) return []

    try {
      const { chromium } = await import('playwright')
      const browser = await chromium.launch({ headless: true })

      try {
        const page = await browser.newPage()
        const home = await this.readPage(page, base)
        const results: PageHints[] = [home]

        const followUps = [...new Set([...(home.categoryLinks || []), ...(home.sampleLinks || [])])]
          .filter((href) => {
            try {
              return new URL(href).host.replace(/^www\./, '') === new URL(base).host.replace(/^www\./, '')
            } catch {
              return false
            }
          })
          .filter((href) => CATEGORY_HINT.test(href) && href !== base)
          .slice(0, 2)

        for (const url of followUps) {
          results.push(await this.readPage(page, url))
        }

        return results
      } finally {
        await browser.close()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.warn(`Playwright unavailable for scrapeConfig probe: ${message}`)
      return [
        {
          url: base,
          title: null,
          sampleLinks: [],
          categoryLinks: [],
          bodySnippet: '',
          htmlSnippet: '',
          error: message,
        },
      ]
    }
  }

  private async readPage(
    page: { goto: Function; evaluate: Function },
    url: string,
  ): Promise<PageHints> {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
      const extracted = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'))
          .map((a) => ({
            href: (a as HTMLAnchorElement).href,
            text: (a.textContent || '').trim().toLowerCase(),
          }))
          .filter((a) => a.href)

        const productish = anchors
          .map((a) => a.href)
          .filter((href) => /producto|product|\/p\/|laptop|computadora|notebook/i.test(href))

        const categoryish = anchors
          .filter(
            (a) =>
              /categor|subcategor|listado|laptop|procesador|ram|memoria|monitor|placa|disco|gpu|fuente|case|pc /i.test(
                `${a.href} ${a.text}`,
              ) && !/producto\/|product\//i.test(a.href),
          )
          .map((a) => a.href)

        const pickProducts = [...new Set(productish)].slice(0, 25)
        const pickCategories = [...new Set(categoryish)].slice(0, 30)

        const clone = document.documentElement.cloneNode(true) as HTMLElement
        clone.querySelectorAll('script, style, noscript, svg, iframe').forEach((el) => el.remove())
        const html = clone.outerHTML.replace(/\s+/g, ' ').trim().slice(0, 12000)
        const body = (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 4000)

        return {
          title: document.title || null,
          sampleLinks: pickProducts.length ? pickProducts : [...new Set(anchors.map((a) => a.href))].slice(0, 25),
          categoryLinks: pickCategories,
          bodySnippet: body,
          htmlSnippet: html,
        }
      })

      return { url, ...extracted }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.warn(`HTML probe failed url=${url}: ${message}`)
      return {
        url,
        title: null,
        sampleLinks: [],
        categoryLinks: [],
        bodySnippet: '',
        htmlSnippet: '',
        error: message,
      }
    }
  }
}

import { chromium } from 'playwright'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const out = join(process.cwd(), 'fixtures', 'scraping', 'html')
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true })

async function dump(name, url) {
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2500)
  const info = await page.evaluate(() => {
    const hrefs = [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href))]
    const products = hrefs.filter(h => /\/producto\//i.test(h)).slice(0, 10)
    const cards = [...document.querySelectorAll('[class*="product"], .card, article, .item')]
      .slice(0, 5)
      .map(el => el.className)
    const next = document.querySelector('a[rel="next"], .pagination a.next, a.next')?.href
    const pageLinks = [...document.querySelectorAll('.pagination a, nav a')]
      .map(a => ({ t: a.textContent.trim(), h: a.href }))
      .filter(x => /\d+|siguiente|next/i.test(x.t))
      .slice(0, 10)
    return { products, cards, next, pageLinks, title: document.title }
  })
  console.log(name, JSON.stringify(info, null, 2))
  await writeFile(join(out, `${name}-listing.html`), await page.content(), 'utf8')
  if (info.products[0]) {
    await page.goto(info.products[0], { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    const detail = await page.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent?.trim(),
      price: document.querySelector('[class*="price"], .price, [itemprop="price"]')?.textContent?.trim()?.slice(0, 80),
      img: document.querySelector('meta[property="og:image"]')?.content,
    }))
    console.log(name, 'DETAIL', detail)
    await writeFile(join(out, `${name}-product.html`), await page.content(), 'utf8')
  }
  await page.close()
}

await dump('impacto', 'https://www.impacto.com.pe/search?category=PROCESADOR')
await dump('memory-kings', 'https://www.memorykings.pe/subcategorias/29/case-fuentes')
await dump('deltron', 'https://www.deltron.com.pe/modulos/productos/items/ctBuscador/templates/buscador.php?GL=MEM&STK=1')

await browser.close()

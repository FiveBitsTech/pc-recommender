import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'fixtures', 'scraping', 'html')
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const url = 'https://cyccomputer.pe/categoria/234-tarjetas-graficas'
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(2500)

const info = await page.evaluate(() => {
  const articles = [...document.querySelectorAll('article.product-miniature, .product-miniature, .js-product-miniature')]
  const fromArticles = articles.map(a => {
    const link = a.querySelector('a.thumbnail, a.product-thumbnail, a.product-title, h2 a, h3 a, a[href]')
    const name = a.querySelector('.product-title, .h3.product-title, h2, h3')?.textContent?.trim()
    const price = a.querySelector('.price, .product-price')?.textContent?.trim()
    return { href: link?.href, name, price, classes: String(a.className).slice(0, 120) }
  })

  const allHrefs = [...document.querySelectorAll('a[href]')]
    .map(a => a.href)
    .filter(h => h.includes('cyccomputer.pe'))

  const patterns = {}
  for (const h of allHrefs) {
    try {
      const u = new URL(h)
      const parts = u.pathname.split('/').filter(Boolean)
      const key = parts[0] || '/'
      patterns[key] = (patterns[key] || 0) + 1
    } catch {}
  }

  const likelyProducts = [...new Set(allHrefs)].filter(h => {
    try {
      const u = new URL(h)
      if (u.search) return false
      const p = u.pathname
      if (p.includes('/categoria/')) return false
      if (p.includes('/content/')) return false
      if (p.includes('/mi-cuenta')) return false
      return /\/\d{2,}[-a-z0-9]+\.html?$/i.test(p) || /\/\d{2,}-[a-z0-9-]+\/?$/i.test(p)
    } catch {
      return false
    }
  }).slice(0, 15)

  const pagination = {
    next: document.querySelector('a.next, .pagination .next a, a[rel="next"]')?.href || null,
    pages: [...document.querySelectorAll('.pagination a, nav.pagination a, ul.page-list a')]
      .map(a => ({ href: a.href, text: a.textContent.trim() }))
      .filter(x => x.text)
      .slice(0, 15),
  }

  return {
    articleCount: articles.length,
    fromArticles: fromArticles.slice(0, 8),
    patterns,
    likelyProducts,
    pagination,
  }
})

console.log(JSON.stringify(info, null, 2))
await writeFile(join(outDir, 'cyccomputer-listing-gpus.html'), await page.content(), 'utf8')

const productUrl =
  info.fromArticles.find(x => x.href && !x.href.includes('categoria') && !x.href.includes('?'))?.href ||
  info.likelyProducts[0]

if (productUrl) {
  console.log('GOTO PRODUCT', productUrl)
  await page.goto(productUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  const detail = await page.evaluate(() => ({
    url: location.href,
    h1: document.querySelector('h1')?.textContent?.trim(),
    price:
      document.querySelector('.current-price, .product-price, [itemprop="price"], .current-price-value')?.textContent?.trim() ||
      document.querySelector('.price')?.textContent?.trim(),
    img:
      document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector('.product-cover img, .js-qv-product-cover')?.src,
    brand: document.querySelector('[itemprop="brand"], .product-manufacturer a')?.textContent?.trim(),
    sku: document.querySelector('[itemprop="sku"], .product-reference span')?.textContent?.trim(),
    specs: [...document.querySelectorAll('.product-features li, .data-sheet dd, section.product-features li')]
      .map(el => el.innerText.trim())
      .filter(Boolean)
      .slice(0, 20),
  }))
  console.log('DETAIL', JSON.stringify(detail, null, 2))
  await writeFile(join(outDir, 'cyccomputer-product.html'), await page.content(), 'utf8')
}

await browser.close()

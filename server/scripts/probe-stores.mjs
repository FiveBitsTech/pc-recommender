import { chromium } from 'playwright'

const sites = [
  ['impacto', 'https://www.impacto.com.pe/'],
  ['deltron', 'https://www.deltron.com.pe/'],
  ['memory-kings', 'https://memorykings.pe/'],
]

const browser = await chromium.launch({ headless: true })
for (const [name, url] of sites) {
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(2000)
    const info = await page.evaluate(() => {
      const hrefs = [...document.querySelectorAll('a[href]')].map(a => a.href)
      return {
        title: document.title,
        generator: document.querySelector('meta[name="generator"]')?.getAttribute('content') || null,
        miniatures: document.querySelectorAll('article.product-miniature, .product-miniature').length,
        sample: hrefs
          .filter(h => /producto|product|categoria|category|collection|tienda/i.test(h))
          .slice(0, 10),
      }
    })
    console.log(name, JSON.stringify(info))
  } catch (e) {
    console.log(name, 'ERR', e.message)
  }
  await page.close()
}
await browser.close()

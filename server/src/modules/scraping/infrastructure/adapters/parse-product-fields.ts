import type { ScrapedSpecs } from '../../domain/ports/store-scraper.port'

export type SpecPair = { label: string; value: string }

export type ProductSignals = {
  title: string
  breadcrumbs: string[]
  jsonLdCategory: string | null
  jsonLdBrand: string | null
  jsonLdSku: string | null
  metaBrand: string | null
  specPairs: SpecPair[]
  bodyText: string
  productUrl: string
  listingUrl: string | null
  categoryHint: string | null
  priceCandidates: string[]
  priceCurrency: string | null
}

export const clamp = (value: string | null | undefined, max: number): string | null => {
  const clean = (value ?? '').replace(/\s+/g, ' ').trim()
  if (!clean) return null
  return clean.length > max ? clean.slice(0, max).trim() : clean
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-/+|,]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()

const pathOf = (url: string | null) => {
  if (!url) return ''
  try {
    return decodeURIComponent(new URL(url).pathname)
  } catch {
    return ''
  }
}

// Equipos completos primero: un breadcrumb "Componentes > Laptops" debe caer en laptop.
const CATEGORY_RULES: Array<[string, RegExp]> = [
  ['laptop', /\b(laptops?|notebooks?|portatiles?|portatil|ultrabooks?|macbooks?)\b/],
  ['desktop', /\b(all in one|aio|escritorio|desktops?|pc gamer|pcs gamer|torre armada|computadoras?|workstations?)\b/],
  ['tablet', /\b(tablets?|ipad)\b/],
  ['monitor', /\b(monitores?|pantallas?|displays?)\b/],
  ['procesador', /\b(procesadores?|microprocesadores?|processors?|\bcpu\b|cpus)\b/],
  [
    'tarjeta-grafica',
    /\b(tarjetas? de video|tarjetas? graficas?|graphics? cards?|video cards?|gpus?|vga|geforce|radeon)\b/,
  ],
  ['placa-madre', /\b(placas? madre|placas? base|tarjetas? madre|motherboards?|mainboards?)\b/],
  [
    'memoria-ram',
    /\b(memorias? ram|memorias?|\brams?\b|memorias? dimm|sodimm|modulos? de memoria|ddr[345]l?|lpddr[45]x?)\b/,
  ],
  ['almacenamiento', /\b(almacenamiento|discos? duros?|discos? solidos?|\bssds?\b|\bnvme\b|\bhdds?\b|m\.2)\b/],
  ['fuente-poder', /\b(fuentes? de poder|fuentes? de alimentacion|fuentes?|\bpsus?\b|power supply)\b/],
  ['case', /\b(cases?|gabinetes?|chasis|chassis)\b/],
  ['refrigeracion', /\b(refrigeracion|coolers?|disipadores?|ventiladores?|water cooling|liquid cooling|aio cooler)\b/],
  ['teclado', /\b(teclados?|keyboards?)\b/],
  ['mouse', /\b(mouses?|mice|ratones?)\b/],
  ['audifonos', /\b(audifonos?|auriculares?|headsets?|headphones?)\b/],
  ['parlantes', /\b(parlantes?|speakers?)\b/],
  ['impresora', /\b(impresoras?|multifuncionales?|printers?)\b/],
  ['ups', /\b(ups|estabilizadores?)\b/],
  ['red', /\b(routers?|access points?|tarjetas? de red|switch(?:es)? de red|networking|wifi)\b/],
  ['silla', /\b(sillas?)\b/],
  ['webcam', /\b(webcams?|camaras? web)\b/],
  ['microfono', /\b(microfonos?|microphones?)\b/],
]

// Cuando el título no dice "procesador" pero es un Core i7 / Ryzen suelto.
const TITLE_CATEGORY_HINTS: Array<[string, RegExp]> = [
  ['procesador', /\b(core\s+i[3579]|core\s+ultra|ryzen\s+[3579]|athlon|celeron|pentium|snapdragon)\b/],
  ['tarjeta-grafica', /\b((?:geforce\s+)?rtx\s*\d{3,4}|gtx\s*\d{3,4}|radeon\s+rx\s*\d{3,4}|arc\s+a\d{3})\b/],
  ['memoria-ram', /\b(\d{1,3}\s*gb\s*(?:ddr[345]|lpddr|ram)|fury|vengeance|trident\s*z)\b/],
  ['almacenamiento', /\b(\d+(?:\.\d+)?\s*(?:gb|tb)\s*(?:ssd|nvme|hdd)|wd\s+black|samsung\s+990)\b/],
  ['laptop', /\b(ideapad|thinkpad|vivobook|zenbook|inspiron|pavilion|victus|katana|legion|macbook)\b/],
]

const matchCategory = (text: string): string | null => {
  const hit = CATEGORY_RULES.find(([, pattern]) => pattern.test(text))
  return hit?.[0] ?? null
}

const slugifyHint = (raw: string): string | null => {
  const text = normalize(raw)
  if (!text || text.length < 2 || text.length > 80) return null
  // Evita hints genéricos que no aportan categoría útil.
  if (/^(ofertas?|promociones?|novedades?|destacados?|ver todo|todos?|home|inicio|tienda|shop|catalogo)$/.test(text)) {
    return null
  }
  return text.replace(/\s+/g, '-').slice(0, 100)
}

export const detectCategory = (signals: ProductSignals): string | null => {
  const sources = [
    signals.breadcrumbs.join(' > '),
    signals.categoryHint ?? '',
    signals.jsonLdCategory ?? '',
    pathOf(signals.listingUrl),
    pathOf(signals.productUrl),
    signals.title,
  ]

  for (const source of sources) {
    const text = normalize(source)
    if (!text) continue
    const hit = matchCategory(text)
    if (hit) return hit
  }

  const title = normalize(signals.title)
  if (title) {
    const fromTitle = TITLE_CATEGORY_HINTS.find(([, pattern]) => pattern.test(title))
    if (fromTitle) return fromTitle[0]
  }

  // Último recurso: conservar el hint de la IA/listing como slug legible.
  return slugifyHint(signals.categoryHint ?? '') ?? slugifyHint(signals.jsonLdCategory ?? '')
}

const BRAND_ALIASES: Record<string, string> = {
  hp: 'HP',
  pavilion: 'HP',
  omen: 'HP',
  victus: 'HP',
  compaq: 'HP',
  dell: 'Dell',
  inspiron: 'Dell',
  latitude: 'Dell',
  alienware: 'Dell',
  lenovo: 'Lenovo',
  ideapad: 'Lenovo',
  thinkpad: 'Lenovo',
  legion: 'Lenovo',
  asus: 'Asus',
  vivobook: 'Asus',
  zenbook: 'Asus',
  rog: 'Asus',
  tuf: 'Asus',
  acer: 'Acer',
  nitro: 'Acer',
  predator: 'Acer',
  msi: 'MSI',
  katana: 'MSI',
  apple: 'Apple',
  macbook: 'Apple',
  imac: 'Apple',
  samsung: 'Samsung',
  lg: 'LG',
  huawei: 'Huawei',
  xiaomi: 'Xiaomi',
  toshiba: 'Toshiba',
  gigabyte: 'Gigabyte',
  aorus: 'Gigabyte',
  asrock: 'ASRock',
  intel: 'Intel',
  amd: 'AMD',
  nvidia: 'NVIDIA',
  zotac: 'Zotac',
  galax: 'GALAX',
  pny: 'PNY',
  evga: 'EVGA',
  kingston: 'Kingston',
  hyperx: 'HyperX',
  corsair: 'Corsair',
  crucial: 'Crucial',
  adata: 'ADATA',
  xpg: 'XPG',
  patriot: 'Patriot',
  teamgroup: 'TeamGroup',
  'g skill': 'G.Skill',
  'western digital': 'Western Digital',
  seagate: 'Seagate',
  sandisk: 'SanDisk',
  logitech: 'Logitech',
  razer: 'Razer',
  redragon: 'Redragon',
  thermaltake: 'Thermaltake',
  'cooler master': 'Cooler Master',
  deepcool: 'DeepCool',
  nzxt: 'NZXT',
  antec: 'Antec',
  'be quiet': 'be quiet!',
  viewsonic: 'ViewSonic',
  aoc: 'AOC',
  benq: 'BenQ',
  epson: 'Epson',
  canon: 'Canon',
  brother: 'Brother',
  'tp link': 'TP-Link',
  halion: 'Halion',
  teros: 'Teros',
  antryx: 'Antryx',
}

const BRAND_KEYS = Object.keys(BRAND_ALIASES).sort((a, b) => b.length - a.length)

const canonicalBrand = (raw: string | null): string | null => {
  const text = normalize(raw ?? '')
  if (!text) return null
  return BRAND_ALIASES[text] ?? clamp(raw, 100)
}

export const detectBrand = (signals: ProductSignals): string | null => {
  const declared = canonicalBrand(signals.jsonLdBrand) ?? canonicalBrand(signals.metaBrand)
  if (declared) return declared

  const fromPair = signals.specPairs.find(pair => /\b(marca|brand|fabricante)\b/.test(normalize(pair.label)))
  const fromPairBrand = canonicalBrand(fromPair?.value ?? null)
  if (fromPairBrand) return fromPairBrand

  const title = normalize(signals.title)
  const key = BRAND_KEYS.find(brand => new RegExp(`\\b${brand.replace(/\./g, '\\.')}\\b`).test(title))
  return key ? BRAND_ALIASES[key] : null
}

const UNIT_TOKEN = /^(\d+(\.\d+)?)(gb|tb|mb|kb|ghz|mhz|hz|w|mm|cm|kg|v|nm|pulg|")$/i

export const detectModel = (signals: ProductSignals, brand: string | null): string | null => {
  const fromPair = signals.specPairs.find(pair => /\b(modelo|model|mpn|part number)\b/.test(normalize(pair.label)))
  if (fromPair) return clamp(fromPair.value, 100)

  const brandWords = new Set(normalize(brand ?? '').split(' ').filter(Boolean))
  const token = signals.title
    .split(/\s+/)
    .map(word => word.replace(/^[([{"']+|[)\]}"',.;:]+$/g, ''))
    .find(word => {
      const plain = normalize(word)
      if (!plain || brandWords.has(plain)) return false
      if (plain.length < 3 || plain.length > 40) return false
      if (UNIT_TOKEN.test(plain)) return false
      return /\d/.test(plain) && /[a-z]/.test(plain)
    })

  return clamp(token ?? null, 100)
}

const SPEC_LABELS: Array<[keyof ScrapedSpecs, RegExp]> = [
  ['processor', /\b(procesador|processor|cpu)\b/],
  ['gpu', /\b(tarjeta de video|tarjeta grafica|grafica|graficos|gpu|video)\b/],
  ['ram', /\b(memoria ram|memoria|ram)\b/],
  ['storage', /\b(almacenamiento|disco duro|disco solido|disco|ssd|hdd|storage)\b/],
  ['screen', /\b(pantalla|display|tamano de pantalla|screen)\b/],
  ['operatingSystem', /\b(sistema operativo|operating system|so)\b/],
]

const SPEC_PATTERNS: Array<[keyof ScrapedSpecs, RegExp]> = [
  [
    'processor',
    /\b(intel\s+core\s+ultra\s+[3579][\w\s-]{0,12}|core\s+i[3579][\w-]*(?:\s+\d{4,5}[a-z]*)?|ryzen\s+[3579]\s*\d{3,4}[a-z]{0,3}|athlon[\w\s-]{0,12}|celeron[\w\s-]{0,12}|pentium[\w\s-]{0,12}|apple\s+m[1-5](?:\s+(?:pro|max|ultra))?|snapdragon[\w\s-]{0,12})/i,
  ],
  [
    'gpu',
    /\b((?:geforce\s+)?rtx\s*\d{4}\s*(?:ti|super)?|gtx\s*\d{3,4}\s*(?:ti)?|radeon\s+rx\s*\d{3,4}\s*(?:xt)?|arc\s+a\d{3}|iris\s+xe|uhd\s+graphics|radeon\s+graphics)/i,
  ],
  ['ram', /\b(\d{1,3}\s*gb\s*(?:de\s*)?(?:ram|ddr[345]l?|lpddr[45]x?|sodimm))/i],
  ['storage', /\b((?:\d{3,4}\s*gb|\d{1,2}\s*tb)\s*(?:ssd|nvme|m\.2|hdd|emmc)|(?:ssd|nvme|hdd)\s*(?:de\s*)?(?:\d{3,4}\s*gb|\d{1,2}\s*tb))/i],
  ['screen', /\b(\d{2}(?:\.\d)?\s*(?:pulgadas|pulg|"|''|inch|in)\b)/i],
  ['operatingSystem', /\b(windows\s*1[01](?:\s*(?:home|pro))?|windows\s*\d+|chrome\s*os|macos|ubuntu|linux|freedos)/i],
]

const SPEC_MAX_LENGTH: Record<string, number> = {
  processor: 255,
  gpu: 255,
  ram: 100,
  storage: 100,
  screen: 100,
  operatingSystem: 100,
}

export const extractSpecs = (signals: ProductSignals): ScrapedSpecs => {
  const specs: ScrapedSpecs = {}
  const fallbackText = `${signals.title} ${signals.bodyText}`

  for (const [key, labelPattern] of SPEC_LABELS) {
    const pair = signals.specPairs.find(item => labelPattern.test(normalize(item.label)))
    if (pair) {
      const value = clamp(pair.value, SPEC_MAX_LENGTH[key as string] ?? 100)
      if (value) specs[key as string] = value
    }
  }

  for (const [key, pattern] of SPEC_PATTERNS) {
    if (specs[key as string]) continue
    const match = fallbackText.match(pattern)
    if (match) {
      const value = clamp(match[1], SPEC_MAX_LENGTH[key as string] ?? 100)
      if (value) specs[key as string] = value
    }
  }

  return specs
}

export const buildTags = (input: {
  category: string | null
  brand: string | null
  title: string
  specs: ScrapedSpecs
}): string[] => {
  const tags = new Set<string>()
  const title = normalize(input.title)
  const storage = normalize(String(input.specs.storage ?? ''))
  const gpu = normalize(String(input.specs.gpu ?? ''))
  const ram = normalize(String(input.specs.ram ?? ''))

  if (input.category) tags.add(input.category)
  if (input.brand) tags.add(input.brand.toLowerCase())
  if (/\b(gamer|gaming)\b/.test(title)) tags.add('gamer')
  if (/\b(ssd|nvme)\b/.test(storage)) tags.add('ssd')
  if (/\b(rtx|gtx|radeon rx|arc a)\b/.test(gpu)) tags.add('gpu-dedicada')

  const ramSize = ram.match(/(\d{1,3})\s*gb/)
  if (ramSize) tags.add(`${ramSize[1]}gb-ram`)

  return [...tags].slice(0, 8)
}

export const detectSku = (signals: ProductSignals): string | null => {
  if (signals.jsonLdSku) return clamp(signals.jsonLdSku, 100)
  const pair = signals.specPairs.find(item => /\b(sku|codigo|cod|ean|upc)\b/.test(normalize(item.label)))
  return clamp(pair?.value ?? null, 100)
}

// Interpreta separadores de miles/decimales de forma robusta (formato PE: "S/ 3,499.00").
export const parseMoney = (raw: string | null | undefined): number => {
  if (raw == null) return 0
  const cleaned = String(raw).replace(/[^0-9.,]/g, '')
  if (!cleaned) return 0

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  let normalized: string
  if (lastComma === -1 && lastDot === -1) {
    normalized = cleaned
  } else if (lastComma !== -1 && lastDot !== -1) {
    // El separador más a la derecha es el decimal; el otro es de miles.
    const decimalSep = lastComma > lastDot ? ',' : '.'
    const thousandSep = decimalSep === ',' ? '.' : ','
    normalized = cleaned.split(thousandSep).join('').replace(decimalSep, '.')
  } else {
    const sep = lastComma !== -1 ? ',' : '.'
    const parts = cleaned.split(sep)
    const last = parts[parts.length - 1]
    // Varios separadores o grupo final de 3 dígitos => miles; 1-2 dígitos => decimal.
    normalized = parts.length > 2 || last.length === 3 ? parts.join('') : parts.join('.')
  }

  const value = Number(normalized)
  return Number.isFinite(value) && value > 0 ? Number(value.toFixed(2)) : 0
}

const normalizeCurrency = (raw: string | null | undefined): string | null => {
  const text = (raw ?? '').trim().toLowerCase()
  if (!text) return null
  if (/us\$|usd|d[oó]lar|dollar|^\$$/.test(text) || text === 'usd') return 'USD'
  if (/s\/|soles|\bpen\b|nuevo sol/.test(text) || text === 'pen') return 'PEN'
  const iso = text.toUpperCase().match(/^[A-Z]{3}$/)
  return iso ? iso[0] : null
}

const currencyFromRaw = (raw: string): string | null => {
  const text = raw.toLowerCase()
  if (/us\$|usd|d[oó]lar/.test(text)) return 'USD'
  if (/s\/|soles|\bpen\b/.test(text)) return 'PEN'
  return null
}

export const detectPrice = (signals: ProductSignals): { price: number; currency: string } => {
  const declared = normalizeCurrency(signals.priceCurrency)

  // First pass: look for explicit PEN/soles prices (highest priority)
  for (const raw of signals.priceCandidates) {
    if (/S\/|soles|\bpen\b/i.test(raw)) {
      // Extract only the soles portion from strings like "$ 165,00 (S/ 572,55)" or "soles 200" or "pen 200"
      const penMatch = raw.match(/(?:S\/\.?|soles|pen)\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/i)
        || raw.match(/([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)\s*(?:soles|pen)\b/i)
      if (penMatch) {
        const value = parseMoney(penMatch[1])
        if (value > 1) {
          return { price: value, currency: 'PEN' }
        }
      }
    }
  }

  // Second pass: take first valid price from candidates that don't mix currencies
  for (const raw of signals.priceCandidates) {
    // Skip candidates that contain both $ and S/ (mixed currency strings)
    if (/\$/.test(raw) && /S\//.test(raw)) continue
    const value = parseMoney(raw)
    if (value > 1) {
      return { price: value, currency: declared ?? currencyFromRaw(raw) ?? 'PEN' }
    }
  }

  return { price: 0, currency: declared ?? 'PEN' }
}

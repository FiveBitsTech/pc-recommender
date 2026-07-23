import type { ScrapedSpecs } from '../../domain/ports/store-scraper.port'

const asText = (value: unknown): string | null => {
  if (value == null) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const parts = [
      obj.brand,
      obj.model,
      obj.size,
      obj.capacity,
      obj.type,
      obj.vram,
      obj.speed,
      obj.interface,
      obj.resolution,
      obj.panel,
      obj.refresh_rate,
      obj.cores != null ? `${obj.cores}c` : null,
      obj.threads != null ? `${obj.threads}t` : null,
    ].filter(Boolean)
    if (parts.length) return parts.join(' ')
    return JSON.stringify(value)
  }
  return null
}

export const projectSpecsToFlat = (specs?: ScrapedSpecs | null) => {
  if (!specs) {
    return {
      processor: null,
      gpu: null,
      ram: null,
      storage: null,
      screen: null,
      operatingSystem: null,
    }
  }

  return {
    processor: asText(specs.processor),
    gpu: asText(specs.gpu),
    ram: asText(specs.ram),
    storage: asText(specs.storage),
    screen: asText(specs.screen),
    operatingSystem: asText(specs.operating_system ?? specs.operatingSystem),
  }
}

export const normalizeTagName = (tag: string) => tag.trim().toLowerCase()

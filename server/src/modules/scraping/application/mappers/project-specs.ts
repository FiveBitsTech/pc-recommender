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

// Los VarChar de product_specs son 255 (processor, gpu) y 100 (resto).
const clamp = (value: string | null, max: number) => (value && value.length > max ? value.slice(0, max) : value)

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
    processor: clamp(asText(specs.processor), 255),
    gpu: clamp(asText(specs.gpu), 255),
    ram: clamp(asText(specs.ram), 100),
    storage: clamp(asText(specs.storage), 100),
    screen: clamp(asText(specs.screen), 100),
    operatingSystem: clamp(asText(specs.operating_system ?? specs.operatingSystem), 100),
  }
}

export const normalizeTagName = (tag: string) => tag.trim().toLowerCase()

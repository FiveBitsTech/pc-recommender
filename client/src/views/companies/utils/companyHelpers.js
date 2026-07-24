export const slugify = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)

export const emptyCompanyForm = () => ({
  id: null,
  slug: '',
  name: '',
  website: '',
  logoUrl: '',
  active: true,
  scrapeConfigText:
    '{\n  "baseUrl": "",\n  "categories": [],\n  "listing": { "productLinkSelector": "" },\n  "product": { "name": "h1", "price": ".price" }\n}'
})

export const companyToForm = company => ({
  id: company?.id ?? null,
  slug: company?.slug ?? '',
  name: company?.name ?? '',
  website: company?.website ?? '',
  logoUrl: company?.logoUrl ?? '',
  active: company?.active ?? true,
  scrapeConfigText: company?.scrapeConfig
    ? JSON.stringify(company.scrapeConfig, null, 2)
    : emptyCompanyForm().scrapeConfigText
})

export const parseScrapeConfigText = text => {
  const raw = String(text || '').trim()
  if (!raw) return { ok: true, value: undefined }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'scrapeConfig debe ser un objeto JSON' }
    }
    return { ok: true, value: parsed }
  } catch {
    return { ok: false, error: 'JSON de scrapeConfig inválido' }
  }
}

export const formToPayload = form => {
  const scrape = parseScrapeConfigText(form.scrapeConfigText)
  if (!scrape.ok) return { ok: false, error: scrape.error }

  const website = form.website?.trim() || ''
  if (!website) {
    return { ok: false, error: 'El sitio web es obligatorio' }
  }

  return {
    ok: true,
    value: {
      slug: form.slug.trim(),
      name: form.name.trim(),
      website,
      logoUrl: form.logoUrl?.trim() || undefined,
      active: Boolean(form.active),
      scrapeConfig: scrape.value
    }
  }
}

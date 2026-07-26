import { Injectable } from '@nestjs/common'

export type ScrapingProgressPhase = 'idle' | 'listing' | 'products' | 'ingest' | 'done' | 'failed'

export type ScrapingProgressSnapshot = {
  companyId: number
  source: string | null
  status: ScrapingProgressPhase
  phase: string
  visited: number
  total: number
  persisted: number
  productsFound: number
  startedAt: string | null
  updatedAt: string
  etaSeconds: number | null
  message: string | null
}

@Injectable()
export class ScrapingProgressService {
  private readonly runs = new Map<number, ScrapingProgressSnapshot>()

  start(companyId: number, source?: string | null) {
    const now = new Date().toISOString()
    const snapshot: ScrapingProgressSnapshot = {
      companyId,
      source: source ?? null,
      status: 'listing',
      phase: 'Explorando listados…',
      visited: 0,
      total: 0,
      persisted: 0,
      productsFound: 0,
      startedAt: now,
      updatedAt: now,
      etaSeconds: null,
      message: null,
    }
    this.runs.set(companyId, snapshot)
    return snapshot
  }

  setListing(companyId: number, message?: string) {
    this.patch(companyId, {
      status: 'listing',
      phase: message || 'Explorando listados…',
    })
  }

  setProductsTotal(companyId: number, total: number) {
    this.patch(companyId, {
      status: 'products',
      phase: 'Visitando fichas…',
      total: Math.max(0, total),
      visited: 0,
    })
  }

  tickProduct(companyId: number, visited: number, total?: number) {
    const current = this.runs.get(companyId)
    if (!current) return
    const nextTotal = total ?? current.total
    const nextVisited = Math.min(Math.max(0, visited), nextTotal || visited)
    const elapsedMs = current.startedAt ? Date.now() - new Date(current.startedAt).getTime() : 0
    const remaining = nextTotal > nextVisited && nextVisited > 0
      ? Math.round((elapsedMs / nextVisited) * (nextTotal - nextVisited) / 1000)
      : null

    this.patch(companyId, {
      status: 'products',
      phase: 'Visitando fichas…',
      visited: nextVisited,
      total: nextTotal,
      etaSeconds: remaining,
    })
  }

  setPersisted(companyId: number, persisted: number) {
    this.patch(companyId, { persisted })
  }

  setIngest(companyId: number, productsFound: number) {
    this.patch(companyId, {
      status: 'ingest',
      phase: 'Guardando en base de datos…',
      productsFound,
      visited: Math.max(this.runs.get(companyId)?.visited ?? 0, productsFound),
      total: Math.max(this.runs.get(companyId)?.total ?? 0, productsFound),
      etaSeconds: null,
    })
  }

  finish(companyId: number, productsFound: number) {
    this.patch(companyId, {
      status: 'done',
      phase: 'Completado',
      productsFound,
      visited: Math.max(this.runs.get(companyId)?.total ?? 0, productsFound),
      total: Math.max(this.runs.get(companyId)?.total ?? 0, productsFound),
      etaSeconds: 0,
      message: null,
    })
  }

  fail(companyId: number, message: string) {
    this.patch(companyId, {
      status: 'failed',
      phase: 'Error',
      etaSeconds: null,
      message: message.slice(0, 240),
    })
  }

  get(companyId: number): ScrapingProgressSnapshot {
    return (
      this.runs.get(companyId) ?? {
        companyId,
        source: null,
        status: 'idle',
        phase: 'Sin corrida activa',
        visited: 0,
        total: 0,
        persisted: 0,
        productsFound: 0,
        startedAt: null,
        updatedAt: new Date().toISOString(),
        etaSeconds: null,
        message: null,
      }
    )
  }

  private patch(companyId: number, partial: Partial<ScrapingProgressSnapshot>) {
    const current = this.runs.get(companyId)
    if (!current) return
    this.runs.set(companyId, {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    })
  }
}

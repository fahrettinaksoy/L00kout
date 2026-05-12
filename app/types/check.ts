export type { TargetInfo } from '../../shared/url'

export type CheckCategory =
  | 'security'
  | 'dns'
  | 'network'
  | 'performance'
  | 'metadata'
  | 'crawling'
  | 'reputation'

export type CheckStatus = 'idle' | 'loading' | 'success' | 'error'

export interface CheckMeta {
  id: string
  icon: string
  category: CheckCategory
  endpoint: string
  estimatedMs: number
  requiresKey?: boolean
  heavy?: boolean
}

export interface CheckErrorPayload {
  code: string
  context?: Record<string, unknown>
}

export interface CheckResult<T = unknown> {
  id: string
  status: CheckStatus
  data?: T
  error?: CheckErrorPayload
  startedAt?: number
  finishedAt?: number
}

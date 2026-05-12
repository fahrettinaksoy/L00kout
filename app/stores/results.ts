import { defineStore } from 'pinia'
import type { CheckErrorPayload, CheckResult } from '~/types/check'

export const useResultsStore = defineStore('results', {
  state: () => ({
    target: '' as string,
    results: {} as Record<string, CheckResult>,
  }),
  getters: {
    statusOf: (s) => (id: string) => s.results[id]?.status ?? 'idle',
    completed: (s) =>
      Object.values(s.results).filter((r) => r.status === 'success' || r.status === 'error').length,
    total: (s) => Object.keys(s.results).length,
  },
  actions: {
    reset(target: string, ids: string[]) {
      this.target = target
      this.results = {}
      for (const id of ids) {
        this.results[id] = { id, status: 'idle' }
      }
    },
    start(id: string) {
      this.results[id] = { id, status: 'loading', startedAt: Date.now() }
    },
    success(id: string, data: unknown) {
      const prev = this.results[id]
      this.results[id] = {
        id,
        status: 'success',
        data,
        startedAt: prev?.startedAt,
        finishedAt: Date.now(),
      }
    },
    fail(id: string, error: CheckErrorPayload) {
      const prev = this.results[id]
      this.results[id] = {
        id,
        status: 'error',
        error,
        startedAt: prev?.startedAt,
        finishedAt: Date.now(),
      }
    },
  },
})

/**
 * Orchestrates parallel check execution with cancellation, timeouts, and
 * structured error reporting. Per-check failures are stored in the results
 * store as `{ code, context }` so the UI can localise them via i18n.
 *
 * Scheduling: uses a worker pool keyed by `concurrency`. Checks are sorted
 * by descending `estimatedMs` so the slow ones start first — total
 * wall-clock time ≈ `max(individual)` rather than `sum/concurrency`.
 */

import type { CheckErrorPayload, CheckMeta } from '~/types/check'
import { useResultsStore } from '~/stores/results'

const errorFromCaught = (e: unknown, timeoutMs: number): CheckErrorPayload => {
  if (e instanceof Error) {
    if (e.name === 'TimeoutError') {
      return { code: 'UPSTREAM_TIMEOUT', context: { seconds: timeoutMs / 1000 } }
    }
    if (e.name === 'AbortError') {
      return { code: 'CANCELLED' }
    }
  }
  // $fetch errors expose data on `.data`
  const data = (e as { data?: { code?: string; context?: Record<string, unknown> } })?.data
  if (data?.code) return { code: data.code, context: data.context }
  const status = (e as { statusCode?: number })?.statusCode
  if (status === 429) return { code: 'RATE_LIMITED' }
  if (status && status >= 500) return { code: 'UPSTREAM_UNAVAILABLE', context: { status } }
  return { code: 'INTERNAL_ERROR' }
}

const runOne = async (
  meta: CheckMeta,
  target: string,
  parentSignal: AbortSignal,
  timeoutMs: number,
) => {
  const store = useResultsStore()
  store.start(meta.id)

  const ctrl = new AbortController()
  const onParentAbort = () => ctrl.abort(new DOMException('Parent aborted', 'AbortError'))
  parentSignal.addEventListener('abort', onParentAbort, { once: true })

  const timeoutId = setTimeout(
    () => ctrl.abort(new DOMException(`Timeout after ${timeoutMs}ms`, 'TimeoutError')),
    timeoutMs,
  )

  try {
    const data = await $fetch(meta.endpoint, {
      query: { url: target },
      signal: ctrl.signal,
      retry: 0,
    })
    store.success(meta.id, data)
  } catch (e: unknown) {
    if (parentSignal.aborted) {
      store.fail(meta.id, { code: 'CANCELLED' })
      return
    }
    store.fail(meta.id, errorFromCaught(e, timeoutMs))
  } finally {
    clearTimeout(timeoutId)
    parentSignal.removeEventListener('abort', onParentAbort)
  }
}

/**
 * Worker-pool scheduler. Sorts by `estimatedMs` descending and keeps
 * `concurrency` tasks in flight at any moment. Exported for unit tests.
 */
export const scheduleAdaptive = async <T extends { estimatedMs: number }>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> => {
  const queue = [...items].sort((a, b) => b.estimatedMs - a.estimatedMs)
  const workers: Promise<void>[] = []
  const next = async (): Promise<void> => {
    while (queue.length) {
      const item = queue.shift()!
      await worker(item).catch(() => undefined)
    }
  }
  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push(next())
  }
  await Promise.all(workers)
}

export const useCheckRunner = () => {
  const { all, byId } = useCheckRegistry()
  const store = useResultsStore()
  const config = useRuntimeConfig()
  let controller: AbortController | null = null

  const run = async (target: string, ids?: string[]) => {
    if (controller && !controller.signal.aborted) controller.abort()
    controller = new AbortController()
    const localCtrl = controller
    const checks = ids ? all.filter((c) => ids.includes(c.id)) : all
    store.reset(
      target,
      checks.map((c) => c.id),
    )
    const concurrency = config.public.requestBatchSize as number
    const timeoutMs = config.public.apiTimeoutMs as number
    await scheduleAdaptive(checks, concurrency, (c) =>
      runOne(c, target, localCtrl.signal, timeoutMs),
    )
  }

  const runSingle = async (id: string) => {
    const meta = byId(id)
    if (!meta || !store.target) return
    const ctrl = new AbortController()
    const timeoutMs = config.public.apiTimeoutMs as number
    await runOne(meta, store.target, ctrl.signal, timeoutMs)
  }

  const cancel = () => {
    if (controller && !controller.signal.aborted) controller.abort()
  }

  return { run, runSingle, cancel }
}

import { describe, expect, it, vi } from 'vitest'
import { scheduleAdaptive } from '../app/composables/useCheckRunner'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

describe('scheduleAdaptive', () => {
  it('runs the slowest items first', async () => {
    const order: string[] = []
    const items = [
      { id: 'fast-a', estimatedMs: 100 },
      { id: 'slow', estimatedMs: 5000 },
      { id: 'fast-b', estimatedMs: 100 },
      { id: 'mid', estimatedMs: 1000 },
    ]
    await scheduleAdaptive(items, 1, async (it) => {
      order.push(it.id)
    })
    expect(order).toEqual(['slow', 'mid', 'fast-a', 'fast-b'])
  })

  it('respects concurrency cap', async () => {
    let inFlight = 0
    let peak = 0
    const items = Array.from({ length: 10 }, (_, i) => ({ id: String(i), estimatedMs: i * 10 }))
    await scheduleAdaptive(items, 3, async () => {
      inFlight++
      peak = Math.max(peak, inFlight)
      await wait(5)
      inFlight--
    })
    expect(peak).toBeLessThanOrEqual(3)
  })

  it('processes every item exactly once', async () => {
    const seen = new Set<string>()
    const items = Array.from({ length: 31 }, (_, i) => ({ id: String(i), estimatedMs: i }))
    await scheduleAdaptive(items, 5, async (it) => {
      expect(seen.has(it.id)).toBe(false)
      seen.add(it.id)
    })
    expect(seen.size).toBe(31)
  })

  it('continues when a worker rejects', async () => {
    const handled: string[] = []
    const items = [
      { id: 'ok-1', estimatedMs: 10 },
      { id: 'boom', estimatedMs: 5 },
      { id: 'ok-2', estimatedMs: 1 },
    ]
    await scheduleAdaptive(items, 1, async (it) => {
      handled.push(it.id)
      if (it.id === 'boom') throw new Error('boom')
    })
    expect(handled.sort()).toEqual(['boom', 'ok-1', 'ok-2'])
  })

  it('handles empty input', async () => {
    const fn = vi.fn()
    await scheduleAdaptive([], 5, fn)
    expect(fn).not.toHaveBeenCalled()
  })

  it('clamps concurrency to item count', async () => {
    const items = [{ id: 'a', estimatedMs: 1 }]
    await expect(scheduleAdaptive(items, 100, async () => undefined)).resolves.toBeUndefined()
  })
})

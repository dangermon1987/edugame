import { describe, it, expect, vi } from 'vitest'
import { SyncEngine } from './SyncEngine'
import { MemoryPersistence } from './MemoryPersistence'
import type { PersistedSnapshot } from './types'
import { SCHEMA_VERSION } from './types'

function snap(updatedAt: number, value: unknown): PersistedSnapshot {
  return { schemaVersion: SCHEMA_VERSION, updatedAt, deviceId: 'd1', data: value }
}

describe('SyncEngine', () => {
  it('seeds an empty remote with the local snapshot', async () => {
    const remote = new MemoryPersistence()
    const local = snap(100, { coins: 5 })
    const engine = new SyncEngine({ getSnapshot: () => local, applyRemote: () => {} })
    engine.setRemote(remote)
    await engine.syncNow()
    const stored = await remote.load()
    expect(stored?.data).toEqual({ coins: 5 })
    engine.dispose()
  })

  it('adopts remote when it is newer', async () => {
    const remote = new MemoryPersistence(snap(200, { coins: 99 }))
    const applied: PersistedSnapshot[] = []
    const engine = new SyncEngine({
      getSnapshot: () => snap(100, { coins: 5 }),
      applyRemote: (s) => applied.push(s),
    })
    engine.setRemote(remote)
    await engine.syncNow()
    expect(applied).toHaveLength(1)
    expect(applied[0].data).toEqual({ coins: 99 })
    engine.dispose()
  })

  it('pushes local when it is newer', async () => {
    const remote = new MemoryPersistence(snap(100, { coins: 5 }))
    const engine = new SyncEngine({
      getSnapshot: () => snap(300, { coins: 42 }),
      applyRemote: () => {},
    })
    engine.setRemote(remote)
    await engine.syncNow()
    const stored = await remote.load()
    expect(stored?.data).toEqual({ coins: 42 })
    engine.dispose()
  })

  it('reports error status when remote save throws', async () => {
    const remote = new MemoryPersistence()
    vi.spyOn(remote, 'save').mockRejectedValue(new Error('network down'))
    const engine = new SyncEngine({ getSnapshot: () => snap(1, {}), applyRemote: () => {} })
    engine.setRemote(remote) // auto-kicks a sync
    await vi.waitFor(() => expect(engine.getState().status).toBe('error'))
    expect(engine.getState().error).toBe('network down')
    engine.dispose()
  })

  it('does nothing when no remote is configured', async () => {
    const engine = new SyncEngine({ getSnapshot: () => snap(1, {}), applyRemote: () => {} })
    await engine.syncNow()
    expect(engine.getState().status).toBe('disabled')
    engine.dispose()
  })
})

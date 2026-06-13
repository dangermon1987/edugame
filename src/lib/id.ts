/** Small id helpers. Uses crypto.randomUUID when available. */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const DEVICE_KEY = 'eduquest.deviceId'

/** Stable per-browser id, persisted in localStorage. */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = uuid()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return 'ephemeral'
  }
}

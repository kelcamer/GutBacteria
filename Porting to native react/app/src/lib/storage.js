// Ported from `Bo`/`Ye`/`Tt` + the `Sm`/`window.storage` wrapper in
// gut-flora-atlas.readable.html (~line 7107-7170) - localStorage, namespaced
// under "gfa:", falling back to an in-memory Map when localStorage itself
// throws (private-browsing storage limits, disabled storage, etc.) so the
// app degrades to "works this session, doesn't persist" instead of crashing.
//
// Deliberately simplified from the original: the original's `window.storage`
// used an async get/set/delete/list interface returning {key,value,shared}
// objects, shaped to match some external convention this app doesn't
// actually need (see PORTING_PLAN.md - there's no evidence of anything
// beyond plain localStorage backing it: `Bo.set` is a synchronous
// `localStorage.setItem` call under the hood). This port exposes the same
// fallback *behavior* (namespaced, resilient to storage failures) with a
// plain synchronous get/set, since there's no real backend to be async for
// once you're not routing through that wrapper shape.

const NS = 'gfa:'

function probeLocalStorage() {
  try {
    const key = '__gfa_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return window.localStorage
  } catch {
    return null
  }
}

const backing = probeLocalStorage()
const memoryFallback = new Map()

export const storage = {
  get(key) {
    return backing ? backing.getItem(NS + key) : (memoryFallback.get(NS + key) ?? null)
  },
  set(key, value) {
    if (backing) {
      try {
        backing.setItem(NS + key, value)
        return true
      } catch (e) {
        console.error('storage.set failed, falling back to in-memory', e)
        memoryFallback.set(NS + key, value)
        return false
      }
    }
    memoryFallback.set(NS + key, value)
    return false
  },
}

export function getJSON(key) {
  const raw = storage.get(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setJSON(key, value) {
  return storage.set(key, JSON.stringify(value))
}

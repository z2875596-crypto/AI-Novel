import type { StateStorage } from 'zustand/middleware'

// Zustand mutates in-memory state before persisting. A quota exception must not
// turn a completed transaction into an apparent generation failure.
export const localPersistence: StateStorage = {
  getItem: name => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(name, value) }
    catch {
      if (typeof window.dispatchEvent === 'function') window.dispatchEvent(new Event('yuanxu-storage-error'))
    }
  },
  removeItem: name => {
    if (typeof window === 'undefined') return
    try { localStorage.removeItem(name) } catch {}
  },
}

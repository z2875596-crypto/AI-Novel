'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading } = useAuthStore()

  useEffect(() => {
    let disposed = false
    let unsubscribe = () => {}
    const timeout = setTimeout(() => { if (!disposed) setIsLoading(false) }, 8000)
    try {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!disposed) setUser(session?.user ?? null)
      }).catch(() => {}).finally(() => { if (!disposed) setIsLoading(false) })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!disposed) { setUser(session?.user ?? null); setIsLoading(false) }
      })
      unsubscribe = () => subscription.unsubscribe()
    } catch { setIsLoading(false) }
    return () => { disposed = true; clearTimeout(timeout); unsubscribe() }
  }, [setUser, setIsLoading])

  return <>{children}</>
}

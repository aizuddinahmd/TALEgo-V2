'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from 'app/utils/supabase'
import { ActivityIndicator, View } from 'react-native'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Pages that don't require authentication
  const publicPages = ['/login', '/sign-up']
  const isPublicPage = publicPages.includes(pathname || '')

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (mounted) {
        setIsAuthenticated(!!session)
        setIsLoading(false)

        if (!session && !isPublicPage) {
          router.replace('/login')
        }
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        const hasSession = !!session
        setIsAuthenticated(hasSession)
        
        if (!hasSession && !isPublicPage) {
          router.replace('/login')
        } else if (hasSession && isPublicPage) {
          router.replace('/')
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [pathname, isPublicPage, router])

  // Prevent flash of content if loading or if we are redirecting away
  if ((isLoading || (!isAuthenticated && !isPublicPage)) && !isPublicPage) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#D4af37" />
      </View>
    )
  }

  return <>{children}</>
}

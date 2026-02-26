'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from 'app/components/navigation/sidebar.web'

export function ConditionalSidebar() {
  const pathname = usePathname()
  
  if (pathname === '/login' || pathname === '/sign-up') {
    return null
  }
  
  return <Sidebar />
}

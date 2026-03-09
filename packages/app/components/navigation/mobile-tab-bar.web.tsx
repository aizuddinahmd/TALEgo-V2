'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, Plus, Compass, User } from 'lucide-react'
import { useFab } from 'app/provider/fab'
import { useTheme } from 'app/provider/theme'

export function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toggleFab, isFabOpen } = useFab()
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navItems = [
    { id: 'home', name: 'Home', icon: Home, path: '/' },
    { id: 'schedule', name: 'Schedule', icon: Calendar, path: '/schedule' },
    { id: 'quick', name: '', icon: Plus, path: null, isCenter: true },
    { id: 'activity', name: 'Activity', icon: Compass, path: '/activity' },
    { id: 'profile', name: 'Profile', icon: User, path: '/profile' },
  ]

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 h-24 border-t px-4 flex items-center justify-around backdrop-blur-lg ${
      isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'
    }`}>
      {navItems.map((item) => {
        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={toggleFab}
              className="relative -top-8 flex flex-col items-center justify-center"
              style={{ zIndex: 60 }}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-200 ${
                isFabOpen 
                  ? 'bg-white border-blue-600 rotate-45' 
                  : 'bg-brand-gold border-black'
              }`}>
                <Plus 
                  size={32} 
                  strokeWidth={3} 
                  className={isFabOpen ? 'text-blue-600' : 'text-black'} 
                />
              </div>
            </button>
          )
        }

        const active = item.path ? isActive(item.path) : false

        return (
          <button
            key={item.id}
            onClick={() => item.path && router.push(item.path)}
            className="flex flex-col items-center justify-center p-2 flex-1"
          >
            <item.icon
              size={24}
              strokeWidth={active ? 2.5 : 2}
              className={active ? 'text-brand-gold' : isDark ? 'text-zinc-500' : 'text-zinc-600'}
            />
            <span className={`text-[10px] mt-1 font-bold ${
              active ? 'text-brand-gold' : isDark ? 'text-zinc-500' : 'text-zinc-600'
            }`}>
              {item.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

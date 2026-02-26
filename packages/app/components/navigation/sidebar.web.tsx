'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  Calendar, 
  Settings,
  LogOut,
  ChevronDown,
  Wallet
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '../../api/auth'
import { supabase } from '../../utils/supabase'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  
  const [user, setUser] = useState<{ displayName: string; email: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async (session: any) => {
      console.log('Sidebar: fetchProfile called with session:', session?.user?.id)
      if (!session?.user) {
        console.log('Sidebar: No session user found, returning')
        return;
      }
      
      const currentUser = session.user;
      const email = currentUser.email || '';
      const fallbackName = email ? email.split('@')[0] : 'User';
      
      console.log('Sidebar: Current user email:', email)

      try {
        if (email) {
          console.log('Sidebar: Querying staff_profiles for email:', email)
          const { data, error } = await supabase
            .from('staff_profiles')
            .select('full_name')
            .eq('email', email)
            .single()

          console.log('Sidebar: staff_profiles query result:', { data, error })

          if (data && !error) {
            setUser({
              displayName: data.full_name || fallbackName,
              email: email,
            })
            console.log('Sidebar: User set from staff_profiles:', data.full_name)
            return;
          }
        }
      } catch (err) {
        console.error('Sidebar: Error fetching profile:', err)
      }

      console.log('Sidebar: Falling back to email/fallbackName:', fallbackName)
      setUser({
        displayName: fallbackName,
        email: email,
      })
    }

    // 1. Initial fetch
    console.log('Sidebar: Fetching initial session...')
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Sidebar: Initial getSession result:', { hasSession: !!session, error })
      if (session) fetchProfile(session)
    })

    // 2. Listen for auth changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Sidebar: onAuthStateChange event:', event, 'hasSession:', !!session)
      if (session) {
        fetchProfile(session)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Extract simple path for active check
  const isActive = (path: string) => pathname === path

  const navItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, path: '/' },
    { id: 'my-record', name: 'My Record', icon: FileText, path: '/record' },
    // { id: 'apply', name: 'Apply', icon: Send, path: '/apply' },
    { id: 'schedule', name: 'Schedule', icon: Calendar, path: '/schedule' },
    { id: 'payroll', name: 'Payroll & Wallet', icon: Wallet, path: '/payroll' },
  ]

  const systemItems = [
    { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      transition={{ duration: 0.5 }} 
      className="w-64 h-full bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-black/10 dark:border-white/10 flex flex-col relative z-20 shrink-0"
    >
      <div className="p-6 flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="w-8 h-8 bg-brand-gold rounded-md mr-2 flex items-center justify-center">
             <span className="text-black font-bold">T</span>
          </div>
          <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-yellow-600 via-brand-gold to-yellow-800 dark:from-yellow-200 dark:via-brand-gold dark:to-yellow-600 bg-clip-text text-transparent">
            TALEgo
          </h1>
      </div>

      <div className="flex-1 py-6 px-3 space-y-4 overflow-y-auto">
          {/* Main Menu */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main Menu</h3>
            {navItems.map((item) => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active 
                        ? 'bg-black/5 dark:bg-white/10 text-brand-gold font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-black hover:bg-black/5 dark:hover:text-gray-200 dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} className={active ? 'text-brand-gold' : 'text-gray-500'} />
                    <span className="text-sm">{item.name}</span>
                  </button>
                )
            })}
          </div>

          {/* System */}
          <div className="space-y-1 mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System</h3>
            {systemItems.map((item) => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active 
                        ? 'bg-black/5 dark:bg-white/10 text-brand-gold font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-black hover:bg-black/5 dark:hover:text-gray-200 dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} className={active ? 'text-brand-gold' : 'text-gray-500'} />
                    <span className="text-sm">{item.name}</span>
                  </button>
                )
            })}
          </div>
      </div>

      <div className="p-4 border-t border-black/10 dark:border-white/5">
        {user ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/5 group hover:border-black/10 dark:hover:border-white/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 min-w-9 rounded-full bg-gradient-to-br from-brand-gold to-yellow-700 flex items-center justify-center text-xs font-bold text-black border border-yellow-500/30">
                      {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-black dark:group-hover:text-white transition-colors">{user.displayName || 'User'}</p>
                      <p className="text-[10px] text-gray-500 truncate group-hover:text-gray-700 dark:group-hover:text-gray-400">{user.email}</p>
                  </div>
              </div>
              <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none"
                  title="Disconnect"
              >
                  <LogOut size={18} strokeWidth={1.5} />
              </button>
          </div>
        ) : (
          <div className="h-[60px] rounded-xl bg-gray-100/50 dark:bg-black/20 animate-pulse border border-black/5 dark:border-white/5">
          <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none"
                  title="Disconnect"
              >
                  <LogOut size={18} strokeWidth={1.5} />
              </button>
          </div>
        )}  
      </div>
    </motion.div>
  )
}

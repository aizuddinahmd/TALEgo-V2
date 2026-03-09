'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

function NavItem({ 
  item, 
  pathname, 
  isActive, 
  onNavigate, 
  level = 0, 
  badge 
}: { 
  item: any; 
  pathname: string; 
  isActive: (path: string) => boolean; 
  onNavigate: (path: string) => void; 
  level?: number; 
  badge?: string; 
}) {
  const [isOpen, setIsOpen] = useState(item.defaultOpen || false)
  const active = isActive(item.path)
  const hasChildren = item.children && item.children.length > 0
  const isSelected = active || (hasChildren && item.children?.some((child: any) => isActive(child.path)))

  // Auto-expand if a child is active
  useEffect(() => {
    if (hasChildren && item.children?.some((child: any) => isActive(child.path))) {
      setIsOpen(true)
    }
  }, [pathname, hasChildren, item.children])

  return (
    <div className="space-y-1">
      <button
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen)
          } else {
            onNavigate(item.path)
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
          level > 0 ? 'ml-0' : ''
        } ${
          isSelected 
            ? 'bg-black/5 dark:bg-white/10 text-brand-gold font-medium' 
            : 'text-gray-600 dark:text-gray-400 hover:text-black hover:bg-black/5 dark:hover:text-gray-200 dark:hover:bg-white/5'
        }`}
        style={{ paddingLeft: level > 0 ? `${level * 16 + 12}px` : '12px' }}
      >
        <div className="flex items-center gap-3">
          {item.icon && <item.icon size={18} className={isSelected ? 'text-brand-gold' : 'text-gray-500'} />}
          <span className="text-sm">{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
             <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold animate-pulse">
               {badge}
             </span>
          )}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="opacity-50" />
            </motion.div>
          )}
        </div>
      </button>

      {hasChildren && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {item.children?.map((child: any) => (
                <NavItem 
                  key={child.id} 
                  item={child} 
                  pathname={pathname} 
                  isActive={isActive} 
                  onNavigate={onNavigate} 
                  level={level + 1} 
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  
  const [user, setUser] = useState<{ displayName: string; email: string } | null>(null)
  const [leaveBalances, setLeaveBalances] = useState<any[]>([])

  useEffect(() => {
    const fetchProfile = async (session: any) => {
      if (!session?.user) return;
      
      const currentUser = session.user;
      const email = currentUser.email || '';
      const fallbackName = email ? email.split('@')[0] : 'User';
      
      try {
        if (email) {
          const { data, error } = await supabase
            .from('staff_profiles')
            .select('staff_id, full_name')
            .eq('email', email)
            .single()

          if (data && !error) {
            setUser({
              displayName: data.full_name || fallbackName,
              email: email,
            })
            
            // Fetch balances for the counter
            const { data: balances } = await supabase
              .from('leave_balances')
              .select('remaining_days, leave_type:leave_types(leave_code)')
              .eq('staff_id', data.staff_id)
              .eq('year', new Date().getFullYear())
            
            if (balances) {
              setLeaveBalances(balances)
            }
            return;
          }
        }
      } catch (err) {
        console.error('Sidebar: Error fetching profile:', err)
      }

      setUser({
        displayName: fallbackName,
        email: email,
      })
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const annualLeaveRemaining = leaveBalances.find(b => b.leave_type?.leave_code?.toLowerCase().includes('ann'))?.remaining_days || 0

  const navItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, path: '/' },
    { 
      id: 'my-record', 
      name: 'My Record', 
      icon: FileText, 
      path: '/record',
      children: [
        { id: 'attendance', name: 'Attendance History', path: '/record/attendance' },
        { 
          id: 'leave', 
          name: 'Leave Balances & History', 
          path: '/record/leave',
          badge: annualLeaveRemaining > 0 ? `${annualLeaveRemaining}d` : undefined
        },
        { id: 'claims', name: 'Claims', path: '/record/claims' },
        { id: 'bill', name: 'Track Bill', path: '/record/bill' },
      ]
    },
    { id: 'schedule', name: 'Schedule', icon: Calendar, path: '/schedule' },
    { 
      id: 'payroll', 
      name: 'Payroll', 
      icon: Wallet, 
      path: '/payroll',
      children: [
        { id: 'payslips', name: 'Payslips', path: '/payroll/payslips' },
        { id: 'tax', name: 'Tax Documents', path: '/payroll/tax' },
      ]
    },
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
      className="hidden lg:flex w-64 h-full bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-black/10 dark:border-white/10 flex flex-col relative z-20 shrink-0"
    >
      <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-gold rounded-md mr-2 flex items-center justify-center">
             <span className="text-black font-bold">T</span>
          </div>
          <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-yellow-600 via-brand-gold to-yellow-800 dark:from-yellow-200 dark:via-brand-gold dark:to-yellow-600 bg-clip-text text-transparent">
            TALEgo
          </h1>
      </div>

      <div className="flex-1 py-6 px-3 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Main Menu */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main Menu</h3>
            {navItems.map((item) => (
              <NavItem 
                key={item.id} 
                item={item} 
                pathname={pathname} 
                isActive={isActive} 
                onNavigate={handleNavigate} 
                badge={(item as any).badge}
              />
            ))}
          </div>

          {/* System */}
          <div className="space-y-1 mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System</h3>
            {systemItems.map((item) => (
              <NavItem 
                key={item.id} 
                item={item} 
                pathname={pathname} 
                isActive={isActive} 
                onNavigate={handleNavigate} 
              />
            ))}
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

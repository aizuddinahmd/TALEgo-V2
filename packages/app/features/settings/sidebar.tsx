import * as React from 'react'
import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { 
  User, 
  Shield, 
  Bell, 
  FileText, 
  Wallet, 
  FileCheck, 
  HelpCircle, 
  Info, 
  LogOut,
  Camera
} from 'lucide-react-native'
import { supabase } from 'app/utils/supabase'
import { signOut } from 'app/api/auth'
import { useRouter } from 'solito/navigation'

interface SidebarItem {
  id: string
  label: string
  icon: any
  group: 'Personal' | 'Workspace' | 'System'
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'account', label: 'Account', icon: User, group: 'Personal' },
  { id: 'security', label: 'Security', icon: Shield, group: 'Personal' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Personal' },
  { id: 'documents', label: 'My Documents', icon: FileText, group: 'Workspace' },
  { id: 'payroll', label: 'Payroll', icon: Wallet, group: 'Workspace' },
  { id: 'tax', label: 'Tax Forms', icon: FileCheck, group: 'Workspace' },
  { id: 'help', label: 'Help', icon: HelpCircle, group: 'System' },
  { id: 'tos', label: 'Terms of Service', icon: Info, group: 'System' },
]

export function SettingsSidebar({ activeSection, onSectionChange }: { activeSection: string, onSectionChange: (section: string) => void }) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        const { data } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('email', session.user.email)
          .single()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const renderGroup = (group: string) => {
    const items = SIDEBAR_ITEMS.filter(item => item.group === group)
    return (
      <View className="mb-6 px-4" key={group}>
        <Text className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
          {group}
        </Text>
        {items.map(item => {
          const isActive = activeSection === item.id
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSectionChange(item.id)}
              className={`flex-row items-center py-3 px-3 rounded-lg mb-1 relative ${
                isActive ? 'bg-[#D4AF3715]' : ''
              }`}
            >
              {isActive && (
                <View className="absolute left-0 top-2 bottom-2 w-1 bg-[#D4AF37] rounded-r-md" />
              )}
              <item.icon 
                size={18} 
                color={isActive ? '#D4AF37' : '#A3A3A3'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text className={`ml-3 text-sm font-medium ${
                isActive ? 'text-[#D4AF37]' : 'text-zinc-400'
              }`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  return (
    <View className="flex-1 py-10">
      {/* Profile Header */}
      <View className="items-center mb-10 px-6">
        <View className="relative group">
          <View className="w-20 h-20 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-zinc-800 items-center justify-center">
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
            ) : (
              <Text className="text-[#D4AF37] text-2xl font-bold">
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <View className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <Camera size={20} color="white" />
          </View>
        </View>
        <Text className="text-[#D4AF37] text-lg font-bold mt-4 text-center">
          {profile?.full_name || 'User Name'}
        </Text>
        <Text className="text-zinc-500 text-sm mt-1 text-center">
          {profile?.job_title || 'Employee'}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {renderGroup('Personal')}
        {renderGroup('Workspace')}
        {renderGroup('System')}

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-3 px-7 mt-4"
        >
          <LogOut size={18} color="#A3A3A3" />
          <Text className="ml-3 text-sm font-medium text-zinc-400">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

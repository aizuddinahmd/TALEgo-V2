import * as React from 'react'
import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native'
import { SettingsLayout } from './layout'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Smartphone, 
  Globe, 
  LogOut,
  ChevronRight,
  Plus
} from 'lucide-react-native'
import { DocumentVault } from './document-vault'

export function SettingsScreen() {
  const [activeSection, setActiveSection] = useState('account')

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSection />
      case 'security':
        return <SecuritySection />
      case 'notifications':
        return <NotificationsSection />
      case 'documents':
        return <DocumentVault title="My Documents" />
      case 'payroll':
        return <DocumentVault title="Payroll History" />
      case 'tax':
        return <DocumentVault title="Tax Forms" />
      default:
        return (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-zinc-500 font-medium">This section is under development.</Text>
          </View>
        )
    }
  }

  return (
    <SettingsLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      <View className="mb-10">
        <Text className="text-3xl font-bold text-zinc-900 dark:text-white capitalize">
          {activeSection.replace('-', ' ')}
        </Text>
        <Text className="text-zinc-500 mt-2">
          Manage your {activeSection} preferences and settings.
        </Text>
      </View>
      {renderContent()}
    </SettingsLayout>
  )
}

function AccountSection() {
  return (
    <View className="space-y-6">
      <SettingsCard title="Personal Information">
        <View className="space-y-4">
          <InfoRow label="Full Name" value="Aizuddin Ahmad" icon={User} />
          <InfoRow label="Email Address" value="aizuddin@tale.so" icon={Mail} />
          <InfoRow label="Phone Number" value="+60 12-345 6789" icon={Phone} />
          <InfoRow label="Location" value="Kuala Lumpur, Malaysia" icon={MapPin} />
        </View>
      </SettingsCard>

      <SettingsCard 
        title="Emergency Contacts" 
        action={
          <TouchableOpacity className="bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg">
            <Text className="text-[#D4AF37] font-bold text-xs">Edit</Text>
          </TouchableOpacity>
        }
      >
        <View className="space-y-4">
          <View className="flex-row justify-between items-center p-3 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-100 dark:border-white/5">
            <View>
              <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Siti Aminah</Text>
              <Text className="text-xs text-zinc-500 mt-0.5">Spouse • +60 19-876 5432</Text>
            </View>
          </View>
          <TouchableOpacity className="flex-row items-center justify-center py-3 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
            <Plus size={16} color="#A3A3A3" />
            <Text className="ml-2 text-sm font-medium text-zinc-500">Add New Contact</Text>
          </TouchableOpacity>
        </View>
      </SettingsCard>
    </View>
  )
}

function SecuritySection() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  return (
    <View className="space-y-6">
      <SettingsCard title="Two-Factor Authentication (2FA)">
        <View className="flex-row gap-8">
          <View className="w-32 h-32 bg-white p-2 rounded-xl items-center justify-center shadow-sm">
            {/* Mock QR Code */}
            <View className="w-full h-full bg-zinc-100 items-center justify-center">
              <Smartphone size={40} color="#D1D5DB" />
            </View>
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">
              Secure your account with 2FA
            </Text>
            <Text className="text-xs text-zinc-500 leading-relaxed mb-4">
              Scan the QR code with your authenticator app (like Google Authenticator or 1Password) to enable two-factor authentication.
            </Text>
            <View className="flex-row items-center bg-zinc-50 dark:bg-black/40 p-3 rounded-xl">
              <Text className="flex-1 text-xs font-bold text-zinc-400">ABC-123-DEF</Text>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-[#D4AF37]">Copy Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SettingsCard>

      <SettingsCard title="Logged in Devices">
        <View className="space-y-3">
          <DeviceRow 
            device="Chrome on MacOS" 
            location="Kuala Lumpur, MY" 
            lastActive="Active Now" 
            isCurrent={true} 
          />
          <DeviceRow 
            device="TALEgo Mobile App" 
            location="iPhone 15 Pro, MY" 
            lastActive="2 hours ago" 
          />
          <DeviceRow 
            device="Safari on iPad" 
            location="Selangor, MY" 
            lastActive="3 days ago" 
          />
          
          <TouchableOpacity 
            className="mt-4 bg-rose-500/10 py-3 rounded-xl border border-rose-500/20 items-center"
          >
            <Text className="text-rose-500 font-bold text-sm">Logout All Devices</Text>
          </TouchableOpacity>
        </View>
      </SettingsCard>
    </View>
  )
}

function NotificationsSection() {
  return (
    <View className="space-y-6">
      <SettingsCard title="Communication Preferences">
        <View className="space-y-4">
          <ToggleRow label="Push Notifications" description="Receive alerts on your mobile device" defaultValue={true} />
          <ToggleRow label="Email Notifications" description="Summary of activities and payroll alerts" defaultValue={true} />
          <ToggleRow label="Marketing Emails" description="Updates on new features and services" defaultValue={false} />
        </View>
      </SettingsCard>
    </View>
  )
}

// Helper Components
function SettingsCard({ title, children, action }: { title: string, children: React.ReactNode, action?: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-white/5 shadow-sm p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{title}</Text>
        {action}
      </View>
      {children}
    </View>
  )
}

function InfoRow({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <View className="flex-row items-center py-2 border-b border-zinc-50 dark:border-white/5">
      <View className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-white/5 items-center justify-center mr-4">
        <Icon size={18} color="#A3A3A3" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{label}</Text>
        <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{value}</Text>
      </View>
      <TouchableOpacity>
        <Text className="text-xs font-bold text-[#D4AF37]">Change</Text>
      </TouchableOpacity>
    </View>
  )
}

function DeviceRow({ device, location, lastActive, isCurrent = false }: { device: string, location: string, lastActive: string, isCurrent?: boolean }) {
  return (
    <View className="flex-row items-center p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-100 dark:border-white/5">
      <View className="w-10 h-10 rounded-full bg-white dark:bg-white/5 items-center justify-center mr-4 shadow-sm">
        <Globe size={20} color={isCurrent ? '#D4AF37' : '#A3A3A3'} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{device}</Text>
          {isCurrent && (
            <View className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 rounded-md">
              <Text className="text-[8px] font-black text-emerald-500 uppercase">Current</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-zinc-500 mt-0.5">{location} • {lastActive}</Text>
      </View>
      {!isCurrent && (
        <TouchableOpacity className="p-2">
          <LogOut size={16} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  )
}

function ToggleRow({ label, description, defaultValue }: { label: string, description: string, defaultValue: boolean }) {
  const [value, setValue] = useState(defaultValue)
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 mr-4">
        <Text className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{label}</Text>
        <Text className="text-xs text-zinc-500 mt-0.5">{description}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={setValue}
        trackColor={{ false: '#3F3F46', true: '#D4AF37' }}
        thumbColor={value ? '#FFFFFF' : '#D4D4D8'}
      />
    </View>
  )
}

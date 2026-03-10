import * as React from 'react'
import { View, ScrollView } from 'react-native'
import { SettingsSidebar } from './sidebar'
import { useTheme } from 'app/provider/theme'

interface SettingsLayoutProps {
  children: React.ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SettingsLayout({ children, activeSection, onSectionChange }: SettingsLayoutProps) {
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'

  return (
    <View className="flex-1 flex-row bg-[#F8F9FA] dark:bg-zinc-950">
      {/* Left Sidebar */}
      <View className="w-[300px] h-full bg-[#121212] border-r border-white/5">
        <SettingsSidebar activeSection={activeSection} onSectionChange={onSectionChange} />
      </View>

      {/* Right Content Area */}
      <ScrollView className="flex-1" contentContainerClassName="p-8 pb-20">
        <View className="max-w-5xl w-full mx-auto">
          {children}
        </View>
      </ScrollView>
    </View>
  )
}

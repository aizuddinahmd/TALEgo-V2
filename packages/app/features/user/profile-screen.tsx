import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { User, Mail, Shield, Bell, Moon, Sun, Palette, ChevronRight, LogOut } from 'lucide-react-native';
import { useTheme } from 'app/provider/theme';

export function ProfileScreen() {
  const { colorMode, toggleColorMode, themeMode, toggleTheme } = useTheme();

  const isDark = colorMode === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8">
        {/* Profile Card */}
        <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
              <User className="text-blue-600 dark:text-blue-400" size={32} />
            </View>
            <View>
              <Text className="text-xl font-bold text-slate-800 dark:text-slate-50">John Doe</Text>
              <Text className="text-slate-500 dark:text-slate-400">Software Engineer</Text>
            </View>
          </View>
        </View>

        {/* Appearance Settings */}
        <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Appearance</Text>
        <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
          {/* Theme Mode Toggle (Light / Dark) */}
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800"
            onPress={() => toggleColorMode(isDark ? 'light' : 'dark')}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg items-center justify-center">
                {isDark ? <Moon className="text-orange-600 dark:text-orange-400" size={20} /> : <Sun className="text-orange-600 dark:text-orange-400" size={20} />}
              </View>
              <View>
                <Text className="text-slate-800 dark:text-slate-100 font-medium">Dark Mode</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs">Adjust the color scheme</Text>
              </View>
            </View>
            <View className={`w-12 h-6 rounded-full px-1 justify-center ${isDark ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
              <View className={`w-4 h-4 bg-white rounded-full ${isDark ? 'self-end' : 'self-start'}`} />
            </View>
          </TouchableOpacity>

          {/* Design Style Toggle (Classic / Neo) */}
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4"
            onPress={() => toggleTheme(themeMode === 'classic' ? 'neo' : 'classic')}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg items-center justify-center">
                <Palette className="text-purple-600 dark:text-purple-400" size={20} />
              </View>
              <View>
                <Text className="text-slate-800 dark:text-slate-100 font-medium">Design Style</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs">
                  {themeMode === 'classic' ? 'Classic Professional' : 'Neo Glassmorphism'}
                </Text>
              </View>
            </View>
            <ChevronRight className="text-slate-400" size={20} />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Account</Text>
        <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg items-center justify-center">
                <Mail className="text-slate-600 dark:text-slate-400" size={20} />
              </View>
              <Text className="text-slate-800 dark:text-slate-100 font-medium">Email Address</Text>
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-sm">john@example.com</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg items-center justify-center">
                <Shield className="text-slate-600 dark:text-slate-400" size={20} />
              </View>
              <Text className="text-slate-800 dark:text-slate-100 font-medium">Security</Text>
            </View>
            <ChevronRight className="text-slate-400" size={20} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg items-center justify-center">
                <Bell className="text-slate-600 dark:text-slate-400" size={20} />
              </View>
              <Text className="text-slate-800 dark:text-slate-100 font-medium">Notifications</Text>
            </View>
            <ChevronRight className="text-slate-400" size={20} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 flex-row items-center justify-center gap-2">
          <LogOut className="text-red-500" size={20} />
          <Text className="text-red-500 font-bold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  ChevronRight, 
  LogOut, 
  Camera, 
  FileText, 
  Receipt, 
  Lock, 
  HelpCircle,
  FileBadge
} from 'lucide-react-native';
import { useTheme } from 'app/provider/theme';

interface SettingsRowProps {
  icon: React.ReactNode;
  iconBgColor: string;
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  subLabel?: string;
  isLast?: boolean;
}

const SettingsRow = ({ 
  icon, 
  iconBgColor, 
  label, 
  trailing, 
  onPress, 
  subLabel, 
  isLast = false 
}: SettingsRowProps) => (
  <TouchableOpacity 
    onPress={onPress}
    disabled={!onPress}
    className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-slate-100 dark:border-zinc-800/50' : ''}`}
  >
    <div className="flex-row items-center flex-1 pr-4">
      <View className={`w-10 h-10 ${iconBgColor} rounded-xl items-center justify-center mr-3`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 dark:text-slate-100 font-semibold">{label}</Text>
        {subLabel && (
          <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5" numberOfLines={1}>
            {subLabel}
          </Text>
        )}
      </View>
    </div>
    <View>
      {trailing || <ChevronRight className="text-slate-400" size={18} />}
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1">
    {title}
  </Text>
);

export function ProfileScreen() {
  const { colorMode, toggleColorMode } = useTheme();
  const isDark = colorMode === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-brand-black">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8">
        
        {/* Profile Header */}
        <View className="items-center mb-8 pt-4">
          <View className="relative">
            <View className="w-24 h-24 bg-blue-100 dark:bg-brand-gold/20 rounded-full items-center justify-center border-4 border-white dark:border-brand-dark-gray shadow-sm">
              <User className="text-brand-blue dark:text-brand-gold" size={48} />
            </View>
            <TouchableOpacity 
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-blue dark:bg-brand-gold rounded-full items-center justify-center border-2 border-white dark:border-brand-dark-gray shadow-md"
              activeOpacity={0.8}
            >
              <Camera color="white" size={16} />
            </TouchableOpacity>
          </View>
          <View className="mt-4 items-center">
            <Text className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">John Doe</Text>
            <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">Senior Software Engineer</Text>
          </View>
        </View>

        {/* DOCUMENTS SECTION */}
        <SectionHeader title="Documents" />
        <View className="bg-white dark:bg-brand-dark-gray rounded-2xl border border-slate-200 dark:border-zinc-800/50 shadow-sm overflow-hidden mb-8">
          <SettingsRow 
            icon={<Receipt className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Payroll & Payslips"
            subLabel="Last Payslip: Oct 31, 2026"
            onPress={() => {}}
          />
          <SettingsRow 
            icon={<FileBadge className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Tax Documents"
            subLabel="Borang EA 2025 ready"
            onPress={() => {}}
          />
          <SettingsRow 
            icon={<FileText className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Employment Letter"
            isLast={true}
            onPress={() => {}}
          />
        </View>

        {/* ACCOUNT SETTINGS SECTION */}
        <SectionHeader title="Account Settings" />
        <View className="bg-white dark:bg-brand-dark-gray rounded-2xl border border-slate-200 dark:border-zinc-800/50 shadow-sm overflow-hidden mb-8">
          <SettingsRow 
            icon={<Mail className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Personal Information"
            subLabel="john.doe@example.com"
            onPress={() => {}}
          />
          <SettingsRow 
            icon={<Shield className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Security & Privacy"
            onPress={() => {}}
          />
          <SettingsRow 
            icon={<Bell className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Notifications"
            trailing={
              <Switch 
                value={true} 
                onValueChange={() => {}}
                trackColor={{ false: '#cbd5e1', true: '#0066FF' }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingsRow 
            icon={isDark ? <Sun className="text-brand-blue dark:text-brand-gold" size={20} /> : <Moon className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Dark Mode"
            isLast={true}
            trailing={
              <Switch 
                value={isDark} 
                onValueChange={() => toggleColorMode(isDark ? 'light' : 'dark')}
                trackColor={{ false: '#cbd5e1', true: isDark ? '#D4AF37' : '#0066FF' }}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        {/* HELP & SUPPORT SECTION */}
        <SectionHeader title="Support" />
        <View className="bg-white dark:bg-brand-dark-gray rounded-2xl border border-slate-200 dark:border-zinc-800/50 shadow-sm overflow-hidden mb-8">
          <SettingsRow 
            icon={<HelpCircle className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Help Center"
            onPress={() => {}}
          />
          <SettingsRow 
            icon={<Lock className="text-brand-blue dark:text-brand-gold" size={20} />}
            iconBgColor="bg-blue-50 dark:bg-brand-gold/10"
            label="Privacy Policy"
            isLast={true}
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity 
          className="bg-white dark:bg-brand-dark-gray rounded-2xl border border-slate-200 dark:border-zinc-800/50 shadow-sm p-4 flex-row items-center justify-center gap-2 active:bg-slate-50 dark:active:bg-zinc-800"
          activeOpacity={0.7}
        >
          <LogOut className="text-red-500" size={20} />
          <Text className="text-red-500 font-bold text-lg">Log Out</Text>
        </TouchableOpacity>
        
        <View className="items-center mt-8 mb-4">
          <Text className="text-slate-400 dark:text-zinc-600 text-xs">Talego Mobile v2.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


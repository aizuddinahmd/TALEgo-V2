import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native'
import { Eye, EyeOff, FileText, Download, Calendar } from 'lucide-react-native'
import { PayBreakdownCard } from '../../ui/pay-breakdown-card'

const PAYROLL_HISTORY = [
  {
    id: '1',
    month_year: 'October 2026',
    period_start: 'Oct 01, 2026',
    period_end: 'Oct 31, 2026',
    basic_salary: 5000.0,
    ot_amount: 250.0,
    allowances: 300.0,
    epf: 605.0,
    socso: 25.25,
    eis: 5.9,
    pcb: 150.0,
    net_pay: 4763.85,
  },
  {
    id: '2',
    month_year: 'September 2026',
    period_start: 'Sep 01, 2026',
    period_end: 'Sep 30, 2026',
    basic_salary: 5000.0,
    ot_amount: 150.0,
    allowances: 300.0,
    epf: 594.0,
    socso: 25.25,
    eis: 5.9,
    pcb: 130.0,
    net_pay: 4694.85,
  },
  {
    id: '3',
    month_year: 'August 2026',
    period_start: 'Aug 01, 2026',
    period_end: 'Aug 31, 2026',
    basic_salary: 5000.0,
    ot_amount: 0.0,
    allowances: 300.0,
    epf: 583.0,
    socso: 25.25,
    eis: 5.9,
    pcb: 110.0,
    net_pay: 4575.85,
  },
]

const STATUTORY_ITEMS = [
  { id: 'epf', label: 'EPF (KWSP)', value: 605.0 },
  { id: 'socso', label: 'SOCSO (PERKESO)', value: 25.25 },
  { id: 'eis', label: 'EIS', value: 5.9 },
  { id: 'pcb', label: 'PCB (Tax)', value: 150.0 },
]

export function PayrollScreen({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'payslips')
  const [showAmounts, setShowAmounts] = useState(true)

  const tabs = [
    { id: 'payslips', label: 'Payslips', icon: FileText },
    { id: 'tax', label: 'Tax Documents', icon: FileText },
  ]

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  // ... (keep renderAmount and other helpers)
  const renderAmount = (amount: number | string) => {
    if (!showAmounts) return '••••••'
    if (typeof amount === 'number') {
      return `RM ${amount.toFixed(2)}`
    }
    return `RM ${amount}`
  }

  // ... (keep WebHistoryTable and MobileHistoryList)
  const WebHistoryTable = () => (
    <View className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <View className="flex-row items-center border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 p-4">
        <Text style={{ flex: 2 }} className="text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase w-40">Pay Period</Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">Basic</Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">Overtime</Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">Allowances</Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">Deductions</Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-32">Net Pay</Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-center w-32">Action</Text>
      </View>
      {PAYROLL_HISTORY.map((item, index) => (
        <View key={item.id} className={`flex-row items-center p-4 ${index !== PAYROLL_HISTORY.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800' : ''}`}>
          <View style={{ flex: 2 }} className="w-40 pr-4">
            <Text className="text-slate-800 dark:text-slate-200 font-medium">{item.month_year}</Text>
          </View>
          <Text className="flex-1 text-slate-700 dark:text-slate-300 text-right w-24">{renderAmount(item.basic_salary)}</Text>
          <Text className="flex-1 text-slate-700 dark:text-slate-300 text-right w-24">{renderAmount(item.ot_amount)}</Text>
          <Text className="flex-1 text-slate-700 dark:text-slate-300 text-right w-24">{renderAmount(item.allowances)}</Text>
          <Text className="flex-1 text-slate-700 dark:text-slate-300 text-right w-24">{renderAmount(item.epf + item.socso + item.eis + item.pcb)}</Text>
          <Text className="flex-1 text-green-600 dark:text-green-400 font-bold text-right w-32">{renderAmount(item.net_pay)}</Text>
          <View className="flex-1 w-32 flex-row justify-center items-center">
            <TouchableOpacity className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-md px-3 py-1.5 flex-row items-center gap-1.5">
              <Download className="text-blue-600 dark:text-blue-400" size={14} />
              <Text className="text-blue-600 dark:text-blue-400 font-medium text-xs">Payslip</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-1">Financial Center</Text>
            <Text className="text-2xl font-bold text-slate-800 dark:text-slate-50">Payroll & Wallet</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAmounts(!showAmounts)} className="w-10 h-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full items-center justify-center shadow-sm">
            {showAmounts ? <Eye className="text-slate-500 dark:text-slate-400" size={20} /> : <EyeOff className="text-slate-500 dark:text-slate-400" size={20} />}
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row gap-2 mb-8 bg-slate-200/50 dark:bg-zinc-900/50 p-1 rounded-xl self-start">
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
            >
              <Text className={`text-sm font-bold ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'payslips' ? (
          <>
            <View className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 mb-8">
              <View className="flex-col md:flex-row justify-between gap-6">
                <View>
                  <Text className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Net Pay (Current Month)</Text>
                  <Text className="text-4xl font-bold text-green-600 dark:text-green-400">{renderAmount(4763.85)}</Text>
                </View>
                <View className="md:items-end">
                  <Text className="text-slate-500 dark:text-slate-400 font-medium mb-1">Next Payday</Text>
                  <View className="flex-row items-center gap-2">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                    <Text className="text-xl font-bold text-slate-800 dark:text-slate-50">Oct 29, 2026</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-lg font-bold text-slate-800 dark:text-slate-50 mb-4">Statutory Contributions</Text>
              <View className="flex-row flex-wrap gap-4">
                {STATUTORY_ITEMS.map((item) => (
                  <View key={item.id} className="flex-1 min-w-[140px] bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4">
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-medium">{item.label}</Text>
                    <Text className="text-xl font-bold text-slate-800 dark:text-slate-50">{renderAmount(item.value)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mb-8 overflow-hidden">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-800 dark:text-slate-50">Payroll History</Text>
              </View>
              <ScrollView horizontal={Platform.OS === 'web'} showsHorizontalScrollIndicator={false} contentContainerClassName={Platform.OS === 'web' ? 'min-w-full' : ''}>
                <View className={Platform.OS === 'web' ? 'w-full min-w-[800px]' : 'w-full'}>
                  {Platform.OS === 'web' ? <WebHistoryTable /> : (
                    <View className="flex-col gap-4">
                      {PAYROLL_HISTORY.map((item) => (
                        <PayBreakdownCard key={item.id} period={item.month_year} netPay={item.net_pay} grossPay={item.basic_salary + item.ot_amount + item.allowances} deductions={item.epf + item.socso + item.eis + item.pcb} onDownload={() => {}} onViewDetails={() => {}} />
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          <View className="mb-8 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-8 flex-col items-center justify-center text-center gap-6">
            <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
              <FileText className="text-blue-600 dark:text-blue-400" size={40} />
            </View>
            <View>
              <Text className="text-2xl font-bold text-slate-800 dark:text-slate-50">Borang EA (Tax Documents)</Text>
              <Text className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Access and download your annual salary statements for tax purposes.</Text>
            </View>
            <View className="w-full flex-col gap-4 mt-4">
              {[2025, 2024, 2023].map((year) => (
                <View key={year} className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <View className="flex-row items-center gap-3">
                    <FileText size={20} className="text-slate-400" />
                    <Text className="font-medium text-slate-700 dark:text-slate-200">Assessment Year {year}</Text>
                  </View>
                  <TouchableOpacity className="flex-row items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg">
                    <Download color="white" size={16} />
                    <Text className="text-white font-bold text-xs">Download</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

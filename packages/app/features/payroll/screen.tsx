import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native'
import { Eye, EyeOff, FileText, Download, Calendar } from 'lucide-react-native'

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

export function PayrollScreen() {
  const [showAmounts, setShowAmounts] = useState(true)

  // Helper function to obscure text if needed
  const renderAmount = (amount: number | string) => {
    if (!showAmounts) return '••••••'
    if (typeof amount === 'number') {
      return `RM ${amount.toFixed(2)}`
    }
    return `RM ${amount}`
  }

  const MobileHistoryList = () => (
    <View className="flex-col gap-4">
      {PAYROLL_HISTORY.map((item) => (
        <View
          key={item.id}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm"
        >
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-slate-800 dark:text-slate-50 font-bold text-lg">
                {item.month_year}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                {item.period_start} - {item.period_end}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 dark:text-slate-400 text-xs mb-1">
                Net Pay
              </Text>
              <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                {renderAmount(item.net_pay)}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg py-3 flex-row items-center justify-center gap-2">
            <FileText
              className="text-slate-600 dark:text-slate-300"
              size={18}
            />
            <Text className="text-slate-600 dark:text-slate-300 font-medium text-sm">
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )

  const WebHistoryTable = () => (
    <View className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <View className="flex-row items-center border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 p-4">
        <Text className="flex-2 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase w-40">
          Pay Period
        </Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">
          Basic
        </Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">
          Overtime
        </Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">
          Allowances
        </Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-24">
          Deductions
        </Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-right w-32">
          Net Pay
        </Text>
        <Text className="flex-1 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase text-center w-32">
          Action
        </Text>
      </View>

      {PAYROLL_HISTORY.map((item, index) => {
        const totalDeductions = item.epf + item.socso + item.eis + item.pcb

        return (
          <View
            key={item.id}
            className={`flex-row items-center p-4 ${index !== PAYROLL_HISTORY.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800' : ''}`}
          >
            <View className="w-40 pr-4">
              <Text className="text-slate-800 dark:text-slate-200 font-medium">
                {item.month_year}
              </Text>
            </View>
            <Text className="text-slate-700 dark:text-slate-300 text-right w-24">
              {renderAmount(item.basic_salary)}
            </Text>
            <Text className="text-slate-700 dark:text-slate-300 text-right w-24">
              {renderAmount(item.ot_amount)}
            </Text>
            <Text className="text-slate-700 dark:text-slate-300 text-right w-24">
              {renderAmount(item.allowances)}
            </Text>
            <Text className="text-slate-700 dark:text-slate-300 text-right w-24">
              {renderAmount(totalDeductions)}
            </Text>
            <Text className="text-green-600 dark:text-green-400 font-bold text-right w-32">
              {renderAmount(item.net_pay)}
            </Text>

            <View className="w-32 items-center">
              <TouchableOpacity className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-md px-3 py-1.5 flex-row items-center gap-1.5 transition-colors">
                <Download
                  className="text-blue-600 dark:text-blue-400"
                  size={14}
                />
                <Text className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                  Payslip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      })}
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 md:p-6 lg:p-8"
      >
        {/* Header & Visibility Toggle */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-1">
              Financial Center
            </Text>
            <Text className="text-2xl font-bold text-slate-800 dark:text-slate-50">
              Payroll & Wallet
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAmounts(!showAmounts)}
            className="w-10 h-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full items-center justify-center shadow-sm"
          >
            {showAmounts ? (
              <Eye className="text-slate-500 dark:text-slate-400" size={20} />
            ) : (
              <EyeOff
                className="text-slate-500 dark:text-slate-400"
                size={20}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Summary Header */}
        <View className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 mb-8">
          <View className="flex-col md:flex-row justify-between gap-6 md:gap-0">
            <View>
              <Text className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                Total Net Pay (Current Month)
              </Text>
              <Text className="text-4xl font-bold text-green-600 dark:text-green-400">
                {renderAmount(4763.85)}
              </Text>
            </View>
            <View className="md:items-end">
              <Text className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                Next Payday
              </Text>
              <View className="flex-row items-center gap-2">
                <Calendar
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
                <Text className="text-xl font-bold text-slate-800 dark:text-slate-50">
                  Oct 29, 2026
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statutory Breakdown */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-slate-800 dark:text-slate-50 mb-4">
            Statutory Contributions
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {STATUTORY_ITEMS.map((item) => (
              <View
                key={item.id}
                className="flex-1 min-w-[140px] bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4"
              >
                <Text className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-medium">
                  {item.label}
                </Text>
                <Text className="text-xl font-bold text-slate-800 dark:text-slate-50">
                  {renderAmount(item.value)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Borang EA Section */}
        <View className="mb-8 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 flex-col md:flex-row items-center justify-between gap-4">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
              <FileText
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-800 dark:text-slate-50">
                Annual Tax Summary
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Borang EA for Assessment Year 2025
              </Text>
            </View>
          </View>
          <TouchableOpacity className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors rounded-lg px-5 py-3 flex-row items-center justify-center gap-2 w-full md:w-auto">
            <Download color="white" size={18} />
            <Text className="text-white font-bold text-sm">Download PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Payroll History */}
        <View className="mb-8 text-white">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-slate-800 dark:text-slate-50">
              Payroll History
            </Text>
          </View>

          <ScrollView
            horizontal={Platform.OS === 'web'}
            showsHorizontalScrollIndicator={false}
            className={Platform.OS === 'web' ? 'w-full' : ''}
          >
            <View
              className={Platform.OS === 'web' ? 'min-w-[800px]' : 'w-full'}
            >
              {Platform.OS === 'web' ? (
                <WebHistoryTable />
              ) : (
                <MobileHistoryList />
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

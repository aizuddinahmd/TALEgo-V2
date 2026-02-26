import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { MotiView, AnimatePresence } from 'moti'
import {
  Calendar,
  Clock,
  Receipt,
  Coins,
  Activity,
  AlertCircle,
  FileText,
  MoreHorizontal,
} from 'lucide-react-native'

export function MyRecordScreen() {
  const [activeTab, setActiveTab] = useState('expenses') // Default to expenses to match screenshot
  const [filter, setFilter] = useState('All')

  // Mapped tabs for easy configuration
  const tabs = [
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'timeoff', label: 'Time off', icon: Clock },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'overtime', label: 'Overtime', icon: Coins },
    { id: 'attendance', label: 'Attendance', icon: Activity },
    { id: 'payment', label: 'Payment', icon: AlertCircle },
  ]

  const MOCK_DATA = {
    expenses: [
      {
        id: '1',
        date: '05 Feb 2026',
        refNo: 'EXP-2026-00001',
        vendorTitle: 'testing',
        vendorSubtitle: 'Bill',
        status: 'PAID',
        statusColor: 'border-green-500/50 text-green-400',
        progressMain: 'RM 100.00',
        progressMainColor: 'text-green-400',
        progressSub: 'Bal: RM 0.00',
        docs: false,
      },
      {
        id: '2',
        date: '04 Feb 2026',
        refNo: 'EXP-2026-00002',
        vendorTitle: 'Muhammad Hasnuddin',
        vendorSubtitle: 'Bill',
        status: 'PARTIAL',
        statusColor: 'border-blue-500/50 text-blue-400',
        progressMain: 'RM 2,000.00',
        progressMainColor: 'text-green-400',
        progressSub: 'Bal: RM 1,690.00',
        docs: true,
      },
    ],
    leave: [
      {
        id: '3',
        date: '01 Feb 2026',
        refNo: 'LV-2026-00001',
        vendorTitle: 'Annual Leave',
        vendorSubtitle: '2 Days',
        status: 'APPROVED',
        statusColor: 'border-green-500/50 text-green-400',
        progressMain: '100%',
        progressMainColor: 'text-slate-200',
        progressSub: 'Completed',
        docs: false,
      },
    ],
  }

  const currentData = MOCK_DATA[activeTab as keyof typeof MOCK_DATA] || []
  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label || 'Entry'

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#111111]">
      <View className="flex-1 flex-col p-6 pb-0 max-w-7xl w-full mx-auto">
        {/* Header Section */}
        <View className="flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <View>
            <Text className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-1">
              My Records
            </Text>
            <Text className="text-slate-500 dark:text-zinc-400">
              Track bills, claims, and payment history
            </Text>
          </View>

          {/* Dynamic Action Button */}
          <TouchableOpacity className="bg-amber-400 hover:bg-amber-500 rounded-lg px-6 py-3 flex-row items-center gap-2 active:opacity-80">
            <Text className="text-black font-bold text-sm">
              + New {activeTabLabel} Entry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Tabs and Actions */}
        <View className="flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          {/* Segmented Control Tabs */}
          <View className="bg-zinc-200 dark:bg-[#1A1A1A] border border-slate-300 dark:border-white/5 rounded-xl p-1 max-w-full">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row items-center"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id

                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-lg mr-1 ${
                      isActive ? 'bg-amber-400 shadow-sm' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        isActive
                          ? 'text-black'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

          {/* Example Summary Card matching screenshot 2 right side */}
          {activeTab === 'expenses' && (
            <View className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 flex-row items-center gap-3">
              <View className="bg-rose-500/20 p-2 rounded-lg">
                <Text className="text-rose-500 font-bold">$</Text>
              </View>
              <View>
                <Text className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider">
                  Total (This Month)
                </Text>
                <Text className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                  2,100.00
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Sub-Filters with generic MotiView animation */}
        <AnimatePresence exitBeforeEnter={true}>
          <MotiView
            key={activeTab}
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ type: 'timing', duration: 250 }}
            className="mb-6 h-8 justify-center"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="items-center"
            >
              <Text className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mr-4">
                Filter Status:
              </Text>
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => {
                const isFilterActive = filter === status
                return (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilter(status)}
                    className={`px-4 py-1.5 rounded-full border mr-2 ${
                      isFilterActive
                        ? 'bg-blue-50 dark:bg-white/10 border-blue-200 dark:border-white/20 shadow-sm text-blue-600 dark:text-white'
                        : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500 dark:text-zinc-500'
                    }`}
                  >
                    <Text className={`text-xs font-medium text-inherit`}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </MotiView>
        </AnimatePresence>

        {/* Table Area */}
        <View className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-t-xl border border-b-0 border-slate-200 dark:border-white/5 overflow-hidden">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerClassName="min-w-full"
          >
            <View className="min-w-[800px] w-full flex-1">
              {/* Table Header */}
              <View className="flex-row items-center border-b border-slate-200 dark:border-white/5 px-4 py-3 bg-slate-50 dark:bg-[#222222]">
                <View className="w-12 items-center justify-center">
                  <View className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-600 bg-white" />
                </View>
                <View className="flex-[1.2]">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date
                  </Text>
                </View>
                <View className="flex-[1.5]">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Ref. No
                  </Text>
                </View>
                <View className="flex-[2]">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Vendor / Type
                  </Text>
                </View>
                <View className="flex-[1.5]">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </Text>
                </View>
                <View className="flex-[1.5]">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Progress
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Docs
                  </Text>
                </View>
                <View className="w-20 items-center">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Action
                  </Text>
                </View>
              </View>

              {/* Table Body */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
              >
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center border-b border-slate-100 dark:border-white/5 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Checkbox */}
                      <View className="w-12 items-center justify-center">
                        <View className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-600 bg-white" />
                      </View>

                      {/* Date */}
                      <View className="flex-[1.2]">
                        <Text className="text-sm font-medium text-slate-600 dark:text-zinc-400 font-mono">
                          {item.date}
                        </Text>
                      </View>

                      {/* Ref No */}
                      <View className="flex-[1.5]">
                        <Text className="text-sm font-medium text-amber-600 dark:text-amber-400 font-mono">
                          {item.refNo}
                        </Text>
                      </View>

                      {/* Vendor / Type */}
                      <View className="flex-[2]">
                        <Text className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {item.vendorTitle}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                          {item.vendorSubtitle}
                        </Text>
                      </View>

                      {/* Status Box */}
                      <View className="flex-[1.5]">
                        <View
                          className={`self-start border ${item.statusColor} px-2 py-0.5 rounded`}
                        >
                          <Text
                            className={`text-[10px] font-bold tracking-wider ${item.statusColor.split(' ').find((c) => c.startsWith('text-')) || ''}`}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      {/* Progress */}
                      <View className="flex-[1.5]">
                        <Text
                          className={`text-sm font-bold font-mono ${item.progressMainColor}`}
                        >
                          {item.progressMain}
                        </Text>
                        <Text className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">
                          {item.progressSub}
                        </Text>
                      </View>

                      {/* Docs */}
                      <View className="w-20 items-center justify-center">
                        {item.docs && (
                          <View className="bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                            <FileText
                              size={16}
                              className="text-slate-500 dark:text-zinc-400"
                            />
                          </View>
                        )}
                      </View>

                      {/* Action */}
                      <View className="w-20 items-center justify-center">
                        <TouchableOpacity className="bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                          <MoreHorizontal
                            size={16}
                            className="text-slate-500 dark:text-zinc-400"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="py-12 items-center justify-center">
                    <Text className="text-slate-500 dark:text-zinc-500">
                      No records found for {activeTabLabel}.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Table Footer / Pagination Spacer */}
              <View className="flex-row items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1A1A1A]">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-slate-500 dark:text-zinc-500">
                    Show
                  </Text>
                  <View className="bg-slate-200 dark:bg-white/5 px-2 py-1 rounded">
                    <Text className="text-xs font-bold text-slate-800 dark:text-zinc-300">
                      25
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-500 dark:text-zinc-500">
                    rows
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-zinc-500 ml-2">
                    Total: {currentData.length}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 dark:text-zinc-500">
                  Page 1 of 1
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

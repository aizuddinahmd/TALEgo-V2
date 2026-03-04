import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
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
  Search,
  MoreHorizontal,
} from 'lucide-react-native'
import { fetchLeaveBalances, getStaffProfile, fetchLeaveRecords, fetchExpenseRecords, fetchAttendanceRecords } from '../../api/records'
import { LeaveApplicationModal } from './LeaveApplicationModal'

export function MyRecordScreen({ initialTab }: { initialTab?: string }) {
  const activeTab = initialTab || 'expenses'
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [staffId, setStaffId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [balances, setBalances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const initStaff = async () => {
      try {
        const profile = await getStaffProfile()
        if (profile) {
          setStaffId(profile.staff_id)
          setOrgId(profile.org_id)
          
          // Fetch balances for the cards
          const leaveBalances = await fetchLeaveBalances(profile.staff_id)
          setBalances(leaveBalances)
        }
      } catch (err) {
        console.error('Failed to get staff profile', err)
      }
    }
    initStaff()
  }, [])

  const loadData = async () => {
    if (!staffId && activeTab !== 'attendance') return
    setIsLoading(true)
    try {
      let rawData: any[] = []
      if (activeTab === 'leave') {
        rawData = await fetchLeaveRecords(staffId!)
      } else if (activeTab === 'expenses' || activeTab === 'claims') {
        rawData = await fetchExpenseRecords(staffId!)
      } else if (activeTab === 'attendance') {
        rawData = await fetchAttendanceRecords()
      }
      setRecords(rawData)
    } catch (err) {
      console.error('Failed to fetch records', err)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setRecords([])
    loadData()
  }, [activeTab, staffId])

  const tabs = [
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: Activity },
    { id: 'claims', label: 'Claims', icon: Receipt },
    { id: 'bill', label: 'Track Bill', icon: Coins },
  ]

  const getMappedData = () => {
    return records.map((record: any) => {
      if (activeTab === 'leave') {
        const typeName = record.leave_type?.leave_name || 'Leave'
        const statusText = record.status?.toUpperCase() || 'UNKNOWN'
        const reqId = record.request_id || 'UNKNOWN'
        return {
          id: reqId,
          date: new Date(record.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          refNo: `LV-${reqId.slice(0,8).toUpperCase()}`,
          vendorTitle: typeName,
          vendorSubtitle: `${record.total_days} Days`,
          status: statusText,
          statusColor: record.status === 'approved' ? 'border-green-500/50 text-green-400' :
                       record.status === 'rejected' ? 'border-red-500/50 text-red-400' : 'border-blue-500/50 text-blue-400',
          progressMain: '',
          progressMainColor: 'text-slate-200',
          progressSub: `${new Date(record.start_date).toLocaleDateString()} - ${new Date(record.end_date).toLocaleDateString()}`,
          docs: false,
        }
      } else if (activeTab === 'expenses' || activeTab === 'claims') {
        const catName = record.category?.category_name || 'Expense'
        const statusText = record.status?.toUpperCase() || 'UNKNOWN'
        const claimId = record.claim_id || 'UNKNOWN'
        return {
          id: claimId,
          date: new Date(record.claim_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          refNo: `EXP-${claimId.slice(0,8).toUpperCase()}`,
          vendorTitle: record.description,
          vendorSubtitle: catName,
          status: statusText,
          statusColor: record.status === 'approved' ? 'border-green-500/50 text-green-400' :
                       record.status === 'rejected' ? 'border-red-500/50 text-red-400' :
                       record.status === 'paid' ? 'border-purple-500/50 text-purple-400' : 'border-blue-500/50 text-blue-400',
          progressMain: `RM ${Number(record.amount || 0).toFixed(2)}`,
          progressMainColor: 'text-green-400',
          progressSub: '',
          docs: false,
        }
      } else if (activeTab === 'attendance') {
        const statusText = record.status?.toUpperCase() || 'PRESENT'
        const logId = record.log_id || record.id || 'UNKNOWN'
        return {
          id: logId,
          date: record.checkin_time ? new Date(record.checkin_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown',
          refNo: `ATT-${logId.slice(0,8).toUpperCase()}`,
          vendorTitle: statusText,
          vendorSubtitle: `Clock In: ${record.checkin_time ? new Date(record.checkin_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}`,
          status: statusText,
          statusColor: record.status === 'present' ? 'border-green-500/50 text-green-400' :
                       record.status === 'late' ? 'border-orange-500/50 text-orange-400' : 'border-red-500/50 text-red-400',
          progressMain: record.checkout_time ? `Out: ${new Date(record.checkout_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Not checked out',
          progressMainColor: 'text-slate-200',
          progressSub: record.working_hours ? `${Number(record.working_hours).toFixed(2)} Hrs` : '',
          docs: false,
        }
      }
      return null
    }).filter(Boolean) as any[]
  }

  let currentData = getMappedData()
  if (filter !== 'All') {
    currentData = currentData.filter(item => item.status === filter.toUpperCase())
  }
  if (searchQuery) {
    currentData = currentData.filter(item => 
      item.vendorTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.refNo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label || 'Entry'

  const annualBalance = balances.find(b => b.leave_type?.leave_code?.toLowerCase().includes('ann'))
  const sickBalance = balances.find(b => b.leave_type?.leave_code?.toLowerCase().includes('sick'))
  const medicalBalance = balances.find(b => b.leave_type?.leave_code?.toLowerCase().includes('med'))

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#111111]">
      <View className="flex-1 flex-col p-6 pb-0 max-w-7xl w-full mx-auto">
        {/* Header Section */}
        <View className="flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <View>
            <Text className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-1">
              {activeTab === 'leave' ? 'Leave Balances & History' : 'My Records'}
            </Text>
            <Text className="text-slate-500 dark:text-zinc-400">
              {activeTab === 'leave' 
                ? 'View your annual leave balances and request history' 
                : 'Track bills, claims, and payment history'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (activeTab === 'leave') {
                if (!staffId) {
                  alert("You must have a registered staff profile to apply for leave.")
                } else {
                  setIsModalOpen(true)
                }
              }
            }}
            className="bg-brand-gold rounded-lg px-6 py-3 flex-row items-center gap-2 active:opacity-80 shadow-lg shadow-brand-gold/20"
          >
            <Text className="text-black font-bold text-sm">
              + New {activeTabLabel} Entry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Split-View: Top Row Mini-Cards (Only for Leave Tab) */}
        {activeTab === 'leave' && (
          <View className="flex-row flex-wrap gap-4 mb-8">
            {[
              { label: 'Annual Leave', value: annualBalance?.remaining_days || 0, total: annualBalance?.entitled_days || 0, color: 'bg-blue-500' },
              { label: 'Sick Leave', value: sickBalance?.remaining_days || 0, total: sickBalance?.entitled_days || 0, color: 'bg-rose-500' },
              { label: 'Medical Leave', value: medicalBalance?.remaining_days || 0, total: medicalBalance?.entitled_days || 0, color: 'bg-emerald-500' },
            ].map((card, i) => (
              <View key={i} className="flex-1 min-w-[200px] bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                <View className="flex-row justify-between items-start mb-4">
                  <View className={`w-10 h-10 ${card.color} rounded-xl items-center justify-center opacity-80`}>
                    <Calendar size={20} color="white" />
                  </View>
                  <View className="bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                    <Text className="text-[10px] font-bold text-slate-400">DAYS</Text>
                  </View>
                </View>
                <Text className="text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-3xl font-bold text-slate-800 dark:text-white">{card.value}</Text>
                  <Text className="text-slate-400 dark:text-zinc-600 font-medium">/ {card.total}</Text>
                </View>
                <View className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
                  <View 
                    className={`${card.color} h-full rounded-full`} 
                    style={{ width: `${(card.value / (card.total || 1)) * 100}%` }} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Search bar */}
        <View className="flex-col lg:flex-row justify-end items-center mb-6 gap-4">
          <View className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 flex-row items-center gap-3 w-full lg:w-64">
            <Search size={16} className="text-slate-400" />
            <TextInput 
              placeholder="Search records..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
              className="bg-transparent text-sm text-slate-800 dark:text-white outline-none w-full"
            />
          </View>
        </View>

        {/* Sub-Filters */}
        <AnimatePresence>
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
                        ? 'bg-brand-gold/10 dark:bg-brand-gold/20 border-brand-gold/30 shadow-sm text-brand-gold'
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
        <View className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-t-xl border border-b-0 border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
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
                  <View className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-600 bg-white dark:bg-transparent" />
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
                    {activeTab === 'leave' ? 'Leave Type' : 'Vendor / Type'}
                  </Text>
                </View>
                <View className="flex-[1.5]">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </Text>
                </View>
                <View className="flex-[1.5]">
                  <Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    {activeTab === 'leave' ? 'Duration' : 'Amount / Hours'}
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
                {isLoading ? (
                  <View className="py-12 items-center justify-center">
                    <ActivityIndicator color="#3B82F6" />
                    <Text className="text-slate-500 dark:text-zinc-500 mt-4 font-medium">
                      Fetching your records...
                    </Text>
                  </View>
                ) : currentData.length > 0 ? (
                  currentData.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center border-b border-slate-100 dark:border-white/5 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Checkbox */}
                      <View className="w-12 items-center justify-center">
                        <View className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-600 bg-white dark:bg-transparent" />
                      </View>

                      {/* Date */}
                      <View className="flex-[1.2]">
                        <Text className="text-sm font-medium text-slate-600 dark:text-zinc-400 font-mono">
                          {item.date}
                        </Text>
                      </View>

                      {/* Ref No */}
                      <View className="flex-[1.5]">
                        <Text className="text-sm font-medium text-brand-gold dark:text-brand-gold font-mono">
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
                          className={`self-start border ${item.statusColor || 'border-blue-500/50 text-blue-400'} px-2 py-0.5 rounded-full`}
                        >
                          <Text
                            className={`text-[10px] font-bold tracking-wider ${(item.statusColor || 'text-blue-400').split(' ').find((c: string) => c.startsWith('text-')) || ''}`}
                          >
                            {item.status || 'UNKNOWN'}
                          </Text>
                        </View>
                      </View>

                      {/* Progress */}
                      <View className="flex-[1.5]">
                        <Text
                          className={`text-sm font-bold font-mono ${item.progressMainColor || 'text-slate-200'}`}
                        >
                          {item.progressMain || ''}
                        </Text>
                        <Text className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono mt-0.5">
                          {item.progressSub || ''}
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
                  <View className="py-24 items-center justify-center">
                    <Text className="text-slate-400 dark:text-zinc-600 font-medium">
                      No records found for {activeTabLabel}.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Table Footer */}
              <View className="flex-row items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1A1A1A]">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-slate-500 dark:text-zinc-500">
                    Show rows:
                  </Text>
                  <View className="bg-slate-200 dark:bg-white/5 px-2 py-1 rounded">
                    <Text className="text-xs font-bold text-slate-800 dark:text-zinc-300">
                      25
                    </Text>
                  </View>
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
      
      {/* Leave Modal */}
      {staffId && orgId && (
        <LeaveApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          staffId={staffId}
          orgId={orgId}
          onSuccess={() => {
            loadData()
          }}
        />
      )}
    </SafeAreaView>
  )
}

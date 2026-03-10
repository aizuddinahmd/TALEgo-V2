import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native'
import { MotiView, AnimatePresence } from 'moti'
import {
  Calendar,
  Clock,
  Receipt,
  Activity as ActivityIcon,
  Search,
  X,
  ChevronRight,
  Filter,
  Info,
  MapPin,
  MessageSquare,
  FileText,
} from 'lucide-react-native'
import { getStaffProfile, fetchLeaveRecords, fetchExpenseRecords, fetchAttendanceRecords } from '../../api/records'
import { useTheme } from 'app/provider/theme'
import { Modal } from 'react-native'
import { LeaveApplicationModal } from '../my-record/LeaveApplicationModal'
import { ClaimApplicationModal } from '../my-record/ClaimApplicationModal'
import { Plus } from 'lucide-react-native'

const { width } = Dimensions.get('window')

type ActivityCategory = 'All' | 'Leaves' | 'Claims' | 'Attendance'
type ActivityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'RESOLVED' | 'PRESENT' | 'LATE' | 'ABSENT'

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  date: Date
  category: ActivityCategory
  status: string
  icon: React.ElementType
  iconColor: string
  rawData: any
}

export function ActivityScreen() {
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'

  const [activeFilter, setActiveFilter] = useState<ActivityCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null)
  
  // Modal states
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getStaffProfile()
        if (profile) {
          setStaffId(profile.staff_id)
          setOrgId(profile.org_id)
        }
      } catch (err) {
        console.error('Failed to get staff profile', err)
      }
    }
    init()
  }, [])

  const loadData = async (isRefreshing = false) => {
    if (!staffId) return
    if (isRefreshing) setRefreshing(true)
    else setIsLoading(true)

    try {
      const [leaveData, expenseData, attendanceData] = await Promise.all([
        fetchLeaveRecords(staffId),
        fetchExpenseRecords(staffId),
        fetchAttendanceRecords(),
      ])

      const mappedLeaves: ActivityItem[] = leaveData.map((r: any) => ({
        id: r.request_id,
        title: r.leave_type?.leave_name || 'Leave Request',
        subtitle: `${new Date(r.start_date).toLocaleDateString()} - ${new Date(r.end_date).toLocaleDateString()} • ${r.total_days} Days`,
        date: new Date(r.start_date),
        category: 'Leaves' as ActivityCategory,
        status: r.status?.toUpperCase(),
        icon: Calendar,
        iconColor: '#3B82F6', // Blue
        rawData: r,
      }))

      const mappedExpenses: ActivityItem[] = expenseData.map((r: any) => ({
        id: r.claim_id,
        title: r.description || 'Expense Claim',
        subtitle: `${r.category?.category_name || 'Expense'} • RM ${Number(r.amount).toFixed(2)}`,
        date: new Date(r.claim_date),
        category: 'Claims' as ActivityCategory,
        status: r.status?.toUpperCase(),
        icon: Receipt,
        iconColor: '#8B5CF6', // Purple
        rawData: r,
      }))

      const mappedAttendance: ActivityItem[] = attendanceData.map((r: any) => ({
        id: r.log_id || r.id,
        title: r.status?.toUpperCase() || 'Attendance',
        subtitle: `Check-in: ${r.checkin_time ? new Date(r.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}`,
        date: new Date(r.checkin_time || r.date),
        category: 'Attendance' as ActivityCategory,
        status: r.status?.toUpperCase(),
        icon: Clock,
        iconColor: '#10B981', // Emerald
        rawData: r,
      }))

      const allActivities = [...mappedLeaves, ...mappedExpenses, ...mappedAttendance].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      )

      setActivities(allActivities)
    } catch (err) {
      console.error('Failed to fetch activities', err)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (staffId) loadData()
  }, [staffId])

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const matchesFilter = activeFilter === 'All' || item.category === activeFilter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [activities, activeFilter, searchQuery])

  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: ActivityItem[] } = {}
    filteredActivities.forEach((activity) => {
      const dateKey = activity.date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(activity)
    })
    return groups
  }, [filteredActivities])

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'approved' || s === 'processed' || s === 'present' || s === 'resolved') {
        return { bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50', text: 'text-emerald-500' }
    }
    if (s === 'pending') {
        return { bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50', text: 'text-amber-500' }
    }
    if (s === 'rejected' || s === 'absent' || s === 'late') {
        return { bg: isDark ? 'bg-rose-500/10' : 'bg-rose-50', text: 'text-rose-500' }
    }
    return { bg: isDark ? 'bg-slate-500/10' : 'bg-slate-50', text: 'text-slate-500' }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0F0F0F]">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 dark:border-white/5">
        <AnimatePresence>
            {!isSearchVisible ? (
                <MotiView 
                    from={{ opacity: 0, translateX: -10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -10 }}
                    key="title"
                >
                    <Text className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                        Activity
                    </Text>
                </MotiView>
            ) : (
                <MotiView 
                    from={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: width - 100 }}
                    exit={{ opacity: 0, width: 0 }}
                    key="search"
                    className="flex-1 bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-2 flex-row items-center"
                >
                    <Search size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                    <TextInput
                        autoFocus
                        placeholder="Search activity..."
                        placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-2 text-slate-800 dark:text-white text-base"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>
                    )}
                </MotiView>
            )}
        </AnimatePresence>
        
        <TouchableOpacity 
            onPress={() => {
                setIsSearchVisible(!isSearchVisible)
                if (isSearchVisible) setSearchQuery('')
            }}
            className="ml-4 p-2 rounded-full bg-slate-50 dark:bg-white/5"
        >
            {isSearchVisible ? (
                <X size={22} color={isDark ? '#fff' : '#000'} />
            ) : (
                <Search size={22} color={isDark ? '#fff' : '#000'} />
            )}
        </TouchableOpacity>
      </View>

      {/* Pill Filters */}
      <View className="py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
        >
          <View className={`flex-row gap-2 ${width >= 1024 ? 'bg-midnight-charcoal/50 p-1 rounded-xl border border-white/5' : ''}`}>
            {(['All', 'Leaves', 'Claims', 'Attendance'] as ActivityCategory[]).map((filter) => {
              const isActive = activeFilter === filter
              const isDesktop = width >= 1024
              
              if (isDesktop) {
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    className={`px-6 py-2 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-brand-gold border-brand-gold'
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        isActive ? 'text-black' : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                )
              }

              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-brand-gold border-brand-gold'
                      : 'bg-transparent border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isActive ? 'text-black' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      </View>

      {/* Timeline Feed */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#D4AF37" />
        }
      >
        {isLoading && !refreshing ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="mt-4 text-slate-400">Loading your history...</Text>
          </View>
        ) : filteredActivities.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20 px-10">
            <View className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full items-center justify-center mb-6">
                <Info size={40} color={isDark ? '#334155' : '#e2e8f0'} />
            </View>
            <Text className="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center">
              No Activity Found
            </Text>
            <Text className="text-slate-500 dark:text-zinc-500 text-center">
              We couldn't find any records matching your criteria. Try adjusting your filters or search terms.
            </Text>
          </View>
        ) : (
          Object.entries(groupedActivities).map(([date, items]) => (
            <View key={date} className="px-6 mb-6">
              <Text className="text-sm font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
                {date}
              </Text>
              <View className="gap-3">
                {items.map((item) => {
                  const statusStyle = getStatusStyle(item.status)
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setSelectedItem(item)}
                      className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 flex-row items-center border border-slate-100 dark:border-white/5 shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-[0.98]"
                    >
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${item.iconColor}15` }}
                      >
                        <item.icon size={22} color={item.iconColor} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row justify-between items-start">
                          <Text className="text-base font-bold text-slate-800 dark:text-white flex-1 mr-2" numberOfLines={1}>
                            {item.title}
                          </Text>
                          <View className={`px-2 py-1 rounded-md ${statusStyle.bg}`}>
                            <Text className={`text-[10px] font-bold tracking-tight ${statusStyle.text}`}>
                              {item.status}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm text-slate-500 dark:text-zinc-500 mt-1" numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={isDark ? '#334155' : '#cbd5e1'} className="ml-2" />
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <DetailBottomSheet 
        item={selectedItem} 
        isVisible={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        isDark={isDark}
      />

      {/* FAB and Action Modals */}
      {staffId && orgId && (
        <>
          <View className="absolute bottom-10 right-6 items-end">
            <AnimatePresence>
              {isFabMenuOpen && (
                <MotiView
                  from={{ opacity: 0, scale: 0.5, translateY: 20 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.5, translateY: 20 }}
                  className="mb-4 gap-3 items-end"
                >
                  <TouchableOpacity 
                    onPress={() => {
                      setIsLeaveModalOpen(true)
                      setIsFabMenuOpen(false)
                    }}
                    className="flex-row items-center bg-[#1A1A1A] border border-white/10 px-4 py-3 rounded-2xl shadow-xl"
                  >
                    <Text className="text-white font-bold mr-3">Apply Leave</Text>
                    <View className="w-10 h-10 bg-brand-gold rounded-xl items-center justify-center">
                      <Calendar size={20} color="black" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => {
                      setIsClaimModalOpen(true)
                      setIsFabMenuOpen(false)
                    }}
                    className="flex-row items-center bg-[#1A1A1A] border border-white/10 px-4 py-3 rounded-2xl shadow-xl"
                  >
                    <Text className="text-white font-bold mr-3">Submit Claim</Text>
                    <View className="w-10 h-10 bg-brand-gold rounded-xl items-center justify-center">
                      <Receipt size={20} color="black" />
                    </View>
                  </TouchableOpacity>
                </MotiView>
              )}
            </AnimatePresence>

            <TouchableOpacity 
              onPress={() => setIsFabMenuOpen(!isFabMenuOpen)}
              className="w-16 h-16 bg-brand-gold rounded-2xl items-center justify-center shadow-2xl shadow-brand-gold/40 active:scale-95 transition-all"
            >
              <MotiView
                animate={{ rotate: isFabMenuOpen ? '45deg' : '0deg' }}
              >
                <Plus size={32} color="black" />
              </MotiView>
            </TouchableOpacity>
          </View>

          <LeaveApplicationModal
            isOpen={isLeaveModalOpen}
            onClose={() => setIsLeaveModalOpen(false)}
            staffId={staffId}
            orgId={orgId}
            onSuccess={() => loadData(true)}
          />

          <ClaimApplicationModal
            isOpen={isClaimModalOpen}
            onClose={() => setIsClaimModalOpen(false)}
            staffId={staffId}
            orgId={orgId}
            onSuccess={() => loadData(true)}
          />
        </>
      )}
    </SafeAreaView>
  )
}

function DetailBottomSheet({ item, isVisible, onClose, isDark }: { item: ActivityItem | null, isVisible: boolean, onClose: () => void, isDark: boolean }) {
    if (!item) return null

    const statusStyle = (status: string) => {
        const s = status.toLowerCase()
        if (s === 'approved' || s === 'processed' || s === 'present' || s === 'resolved') {
            return { bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50', text: 'text-emerald-500' }
        }
        if (s === 'pending') {
            return { bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50', text: 'text-amber-500' }
        }
        if (s === 'rejected' || s === 'absent' || s === 'late') {
            return { bg: isDark ? 'bg-rose-500/10' : 'bg-rose-50', text: 'text-rose-500' }
        }
        return { bg: isDark ? 'bg-slate-500/10' : 'bg-slate-50', text: 'text-slate-500' }
    }

    const sStyle = statusStyle(item.status)

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end">
                <TouchableOpacity 
                    className="absolute inset-0 bg-black/40" 
                    activeOpacity={1} 
                    onPress={onClose} 
                />
                <MotiView
                    from={{ translateY: 300 }}
                    animate={{ translateY: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                    className="bg-white dark:bg-[#1A1A1A] rounded-t-[32px] p-6 pb-12 w-full border-t border-slate-100 dark:border-white/5"
                >
                    <View className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full self-center mb-8" />
                    
                    <View className="flex-row items-center mb-6">
                        <View 
                            className="w-16 h-16 rounded-2xl items-center justify-center mr-5"
                            style={{ backgroundColor: `${item.iconColor}15` }}
                        >
                            <item.icon size={32} color={item.iconColor} />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-start">
                                <Text className="text-xl font-bold text-slate-800 dark:text-white flex-1 mr-2">
                                    {item.title}
                                </Text>
                                <View className={`px-3 py-1 rounded-full ${sStyle.bg}`}>
                                    <Text className={`text-xs font-bold tracking-wider ${sStyle.text}`}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-slate-500 dark:text-zinc-500 mt-1">
                                {item.category}
                            </Text>
                        </View>
                    </View>

                    <View className="space-y-6">
                        {/* Time/Date Section */}
                        <View className="flex-row items-start">
                            <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 items-center justify-center mr-4">
                                <Calendar size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Date & Duration</Text>
                                <Text className="text-base text-slate-700 dark:text-slate-200">{item.subtitle}</Text>
                            </View>
                        </View>

                        {/* Description/Comments */}
                        {item.rawData.reason || item.rawData.description || item.rawData.comments ? (
                            <View className="flex-row items-start">
                                <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 items-center justify-center mr-4">
                                    <MessageSquare size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Details / Reason</Text>
                                    <Text className="text-base text-slate-700 dark:text-slate-200">
                                        {item.rawData.reason || item.rawData.description || item.rawData.comments || 'No additional details provided.'}
                                    </Text>
                                </View>
                            </View>
                        ) : null}

                        {/* Location (for Attendance) */}
                        {item.category === 'Attendance' && (
                            <View className="flex-row items-start">
                                <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 items-center justify-center mr-4">
                                    <MapPin size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Clock-in Location</Text>
                                    <Text className="text-base text-slate-700 dark:text-slate-200">
                                        {item.rawData.latitude && item.rawData.longitude 
                                            ? `${item.rawData.latitude.toFixed(4)}, ${item.rawData.longitude.toFixed(4)}`
                                            : 'Location data unavailable'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Documents */}
                        {item.rawData.document_url && (
                             <View className="flex-row items-start">
                                <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 items-center justify-center mr-4">
                                    <FileText size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Attachment</Text>
                                    <TouchableOpacity className="flex-row items-center mt-1">
                                        <Text className="text-brand-blue font-bold">View Document</Text>
                                        <ChevronRight size={16} color="#0066FF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity 
                        onPress={onClose}
                        className="mt-10 bg-brand-gold py-4 rounded-2xl items-center"
                    >
                        <Text className="text-black font-bold text-lg">Close Details</Text>
                    </TouchableOpacity>
                </MotiView>
            </View>
        </Modal>
    )
}

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { X, Calendar as CalendarIcon, FileText, ChevronDown } from 'lucide-react-native'
import { MotiView } from 'moti'
import { fetchLeaveBalances, fetchLeaveTypes, submitLeaveRequest } from '../../api/records'

interface LeaveApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  staffId: string
  orgId: string
  onSuccess: () => void
}

export function LeaveApplicationModal({
  isOpen,
  onClose,
  staffId,
  orgId,
  onSuccess,
}: LeaveApplicationModalProps) {
  const [balances, setBalances] = useState<any[]>([])
  const [allLeaveTypes, setAllLeaveTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Form State
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [halfDayPeriod, setHalfDayPeriod] = useState<'Morning' | 'Afternoon'>('Morning')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && staffId) {
      loadData()
    } else {
      resetForm()
    }
  }, [isOpen, staffId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [balData, typesData] = await Promise.all([
        fetchLeaveBalances(staffId),
        fetchLeaveTypes()
      ])
      
      setBalances(balData)
      setAllLeaveTypes(typesData)
    } catch (err) {
      console.error('Failed to load leave data', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedType(null)
    setStartDate('')
    setEndDate('')
    setIsHalfDay(false)
    setHalfDayPeriod('Morning')
    setReason('')
    setIsDropdownOpen(false)
  }

  // Simple date diff (assuming YYYY-MM-DD format for demo purposes)
  const calculateDays = (start: string, end: string, halfDay: boolean) => {
    if (halfDay) return 0.5
    if (!start || !end) return 0
    const d1 = new Date(start)
    const d2 = new Date(end)
    const diff = d2.getTime() - d1.getTime()
    const days = diff / (1000 * 3600 * 24) + 1
    return days > 0 ? days : 0
  }

  const handleSubmit = async () => {
    if (!selectedType || !startDate || (!isHalfDay && !endDate) || !reason) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const totalDays = calculateDays(startDate, endDate, isHalfDay)
    if (!isHalfDay && totalDays <= 0) {
      Alert.alert('Error', 'End date must be after or same as start date')
      return
    }

    setIsSubmitting(true)
    try {
      await submitLeaveRequest({
        org_id: orgId,
        staff_id: staffId,
        leave_type_id: selectedType,
        start_date: startDate,
        end_date: isHalfDay ? startDate : endDate,
        total_days: totalDays,
        reason,
        is_half_day: isHalfDay,
        half_day_period: isHalfDay ? halfDayPeriod : null,
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Submit error:', err)
      Alert.alert('Error', 'Failed to submit leave. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find info about the currently selected type
  const selectedTypeDetails = allLeaveTypes.find(t => t.leave_type_id === selectedType)
  // Check if we have a balance record for this specific type
  const matchingBalance = balances.find(b => b.leave_type?.leave_type_id === selectedType)

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="bg-[#111111] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-white/5">
            <View>
              <Text className="text-xl font-bold tracking-tight text-white mb-1">
                New Leave Application
              </Text>
              <Text className="text-sm text-zinc-500">
                Submit a new time-off request for approval
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 border border-white/5 rounded-lg bg-white/5 hover:bg-white/10">
              <X size={20} className="text-zinc-400" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            {loading ? (
              <ActivityIndicator size="large" color="#fbbf24" className="my-8" />
            ) : (
              <View className="gap-6 pb-4">
                {/* Leave Type Dropdown */}
                <View className="relative z-50">
                  <Text className="text-sm font-bold text-zinc-300 mb-2">
                    Select Leave Type *
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex-row justify-between items-center p-4 rounded-xl border ${
                      isDropdownOpen 
                        ? 'border-brand-gold bg-[#1A1A1A]' 
                        : 'border-white/10 bg-[#1A1A1A] hover:bg-white/5'
                    } transition-colors`}
                  >
                    <View>
                      {selectedTypeDetails ? (
                         <View>
                            <Text className="font-bold text-white text-base">
                              {selectedTypeDetails.leave_name}
                            </Text>
                            {matchingBalance ? (
                               <Text className="text-xs text-brand-gold mt-1 font-mono">
                                  Balance: {matchingBalance.remaining_days} days remaining
                               </Text>
                            ) : (
                               <Text className="text-xs text-zinc-500 mt-1 font-mono">
                                  No documented balance for this year
                               </Text>
                            )}
                         </View>
                      ) : (
                        <Text className="text-zinc-500">Choose a leave type...</Text>
                      )}
                    </View>
                    <ChevronDown size={20} className={isDropdownOpen ? "text-brand-gold" : "text-zinc-500"} />
                  </TouchableOpacity>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <View className="absolute top-[85px] left-0 right-0 bg-[#1A1A1A] border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50 max-h-60 mt-2">
                      <ScrollView nestedScrollEnabled>
                        {allLeaveTypes.map((type) => {
                          const isSelected = selectedType === type.leave_type_id
                          const balInfo = balances.find(b => b.leave_type?.leave_type_id === type.leave_type_id)
                          
                          return (
                            <TouchableOpacity
                              key={type.leave_type_id}
                              onPress={() => {
                                setSelectedType(type.leave_type_id)
                                setIsDropdownOpen(false)
                              }}
                              className={`p-4 border-b border-white/5 flex-row justify-between items-center ${
                                isSelected ? 'bg-brand-gold/10' : 'hover:bg-white/5'
                              }`}
                            >
                              <View>
                                <Text className={`font-bold ${isSelected ? 'text-brand-gold' : 'text-zinc-200'}`}>
                                  {type.leave_name}
                                </Text>
                                {balInfo && (
                                  <Text className="text-xs text-zinc-500 mt-0.5 font-mono">
                                    Bal: {balInfo.remaining_days} | Pnd: {balInfo.pending_days}
                                  </Text>
                                )}
                              </View>
                              <View className={`w-4 h-4 rounded-full border items-center justify-center ${isSelected ? 'border-brand-gold' : 'border-zinc-700'}`}>
                                {isSelected && <View className="w-2 h-2 rounded-full bg-brand-gold" />}
                              </View>
                            </TouchableOpacity>
                          )
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Dates */}
                <View className={`${isDropdownOpen ? 'opacity-30 z-0' : 'z-10'} gap-6 transition-opacity`}>
                  {/* Half Day Toggle */}
                  <View className="flex-row items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <View>
                      <Text className="text-white font-bold">Half Day Application</Text>
                      <Text className="text-xs text-zinc-500">Apply for 0.5 day leave</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setIsHalfDay(!isHalfDay)}
                      className={`w-12 h-6 rounded-full px-1 justify-center ${isHalfDay ? 'bg-brand-gold' : 'bg-zinc-800'}`}
                    >
                      <MotiView 
                        animate={{ translateX: isHalfDay ? 24 : 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="w-4 h-4 rounded-full bg-white"
                      />
                    </TouchableOpacity>
                  </View>

                  {isHalfDay ? (
                    <View className="gap-4">
                      <View>
                        <Text className="text-sm font-bold text-zinc-300 mb-2">
                          Date *
                        </Text>
                        <View className="flex-row items-center border border-white/10 rounded-lg bg-[#1A1A1A] px-3 focus-within:border-brand-gold transition-colors">
                          <CalendarIcon size={16} className="text-zinc-500" />
                          <TextInput
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="YYYY-MM-DD"
                            className="flex-1 py-3 px-2 text-white font-mono"
                            placeholderTextColor="#71717a"
                          />
                        </View>
                      </View>
                      <View>
                        <Text className="text-sm font-bold text-zinc-300 mb-2">
                          Period *
                        </Text>
                        <View className="flex-row gap-2">
                          {(['Morning', 'Afternoon'] as const).map((period) => (
                            <TouchableOpacity
                              key={period}
                              onPress={() => setHalfDayPeriod(period)}
                              className={`flex-1 py-3 rounded-lg border items-center justify-center ${
                                halfDayPeriod === period 
                                  ? 'border-brand-gold bg-brand-gold/10' 
                                  : 'border-white/10 bg-white/5'
                              }`}
                            >
                              <Text className={`font-bold ${halfDayPeriod === period ? 'text-brand-gold' : 'text-zinc-500'}`}>
                                {period}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-zinc-300 mb-2">
                          Start Date *
                        </Text>
                        <View className="flex-row items-center border border-white/10 rounded-lg bg-[#1A1A1A] px-3 focus-within:border-brand-gold transition-colors">
                          <CalendarIcon size={16} className="text-zinc-500" />
                          <TextInput
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="YYYY-MM-DD"
                            className="flex-1 py-3 px-2 text-white font-mono"
                            placeholderTextColor="#71717a"
                          />
                        </View>
                      </View>

                      <View className="flex-1">
                        <Text className="text-sm font-bold text-zinc-300 mb-2">
                          End Date *
                        </Text>
                        <View className="flex-row items-center border border-white/10 rounded-lg bg-[#1A1A1A] px-3 focus-within:border-brand-gold transition-colors">
                          <CalendarIcon size={16} className="text-zinc-500" />
                          <TextInput
                            value={endDate}
                            onChangeText={setEndDate}
                            placeholder="YYYY-MM-DD"
                            className="flex-1 py-3 px-2 text-white font-mono"
                            placeholderTextColor="#71717a"
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* Info Text */}
                {((isHalfDay && startDate) || (startDate && endDate && calculateDays(startDate, endDate, isHalfDay) > 0)) && !isDropdownOpen && (
                  <View className="bg-brand-gold/10 border border-brand-gold/20 p-3 rounded-lg flex-row justify-between items-center">
                    <Text className="text-sm text-brand-gold/80 flex-1">
                      Computed duration based on inputs:
                    </Text>
                    <Text className="text-sm font-bold text-brand-gold font-mono">
                      {calculateDays(startDate, endDate, isHalfDay)} Days
                    </Text>
                  </View>
                )}

                {/* Reason */}
                <View className={isDropdownOpen ? 'opacity-30 z-0' : 'z-10'}>
                  <Text className="text-sm font-bold text-zinc-300 mb-2">
                    Reason / Details *
                  </Text>
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={4}
                    placeholder="Provide details for this leave application... e.g., 'Family vacation' or 'Dentist appointment'"
                    className="border border-white/10 rounded-lg bg-[#1A1A1A] p-3 h-24 text-white focus:border-brand-gold transition-colors"
                    placeholderTextColor="#71717a"
                    textAlignVertical="top"
                  />
                  {selectedTypeDetails?.requires_document && (
                     <Text className="text-xs text-rose-400 mt-2 font-medium">
                       * This leave type requires supporting documents (e.g. MC) which can be uploaded after submission.
                     </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View className={`px-6 py-4 bg-[#141414] border-t border-black flex-row justify-end gap-3 ${isDropdownOpen ? 'opacity-30' : 'opacity-100'}`}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg border border-white/10 items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <Text className="font-bold text-zinc-300">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !selectedType || !startDate || (!isHalfDay && !endDate) || !reason}
              className={`px-6 py-3 rounded-lg flex-row items-center justify-center gap-2 ${
                isSubmitting || !selectedType || !startDate || (!isHalfDay && !endDate) || !reason
                  ? 'bg-brand-gold/30'
                  : 'bg-brand-gold shadow-[0_0_15px_rgba(251,191,36,0.3)] active:scale-95 hover:bg-yellow-400'
              } transition-all`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <FileText size={16} className={`text-black ${(!selectedType || !startDate || !endDate || !reason) ? 'opacity-50' : 'opacity-100'}`} />
                  <Text className={`font-bold text-black ${(!selectedType || !startDate || !endDate || !reason) ? 'opacity-50' : 'opacity-100'}`}>Submit Application</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

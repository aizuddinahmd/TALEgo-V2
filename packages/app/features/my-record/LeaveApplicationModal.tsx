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
import { X, Calendar as CalendarIcon, FileText } from 'lucide-react-native'
import { fetchLeaveBalances, submitLeaveRequest } from '../../api/records'

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
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && staffId) {
      loadBalances()
    } else {
      resetForm()
    }
  }, [isOpen, staffId])

  const loadBalances = async () => {
    setLoading(true)
    try {
      const data = await fetchLeaveBalances(staffId)
      setBalances(data)
    } catch (err) {
      console.error('Failed to load leave balances', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedType(null)
    setStartDate('')
    setEndDate('')
    setReason('')
  }

  // Simple date diff (assuming YYYY-MM-DD format for demo purposes)
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const d1 = new Date(start)
    const d2 = new Date(end)
    const diff = d2.getTime() - d1.getTime()
    const days = diff / (1000 * 3600 * 24) + 1
    return days > 0 ? days : 0
  }

  const handleSubmit = async () => {
    if (!selectedType || !startDate || !endDate || !reason) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const totalDays = calculateDays(startDate, endDate)
    if (totalDays <= 0) {
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
        end_date: endDate,
        total_days: totalDays,
        reason,
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

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
            <Text className="text-xl font-bold text-slate-800 dark:text-slate-50">
              New Leave Application
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={20} className="text-slate-500 dark:text-zinc-400" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            {loading ? (
              <ActivityIndicator size="large" className="my-8" />
            ) : (
              <View className="gap-6">
                {/* Leave Type Selection */}
                <View>
                  <Text className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3">
                    Select Leave Type
                  </Text>
                  <View className="gap-2">
                    {balances.map((balance: any) => {
                      const type = balance.leave_type
                      const isSelected = selectedType === type.leave_type_id
                      return (
                        <TouchableOpacity
                          key={type.leave_type_id}
                          onPress={() => setSelectedType(type.leave_type_id)}
                          className={`flex-row justify-between items-center p-4 border rounded-xl ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                              : 'border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          <View>
                            <Text className={`font-bold ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {type.leave_name}
                            </Text>
                            <Text className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                              Bal: {balance.remaining_days} days | Pnd: {balance.pending_days}
                            </Text>
                          </View>
                          <View className={`w-5 h-5 rounded-full border items-center justify-center ${isSelected ? 'border-amber-400' : 'border-slate-300 dark:border-zinc-600'}`}>
                            {isSelected && <View className="w-3 h-3 rounded-full bg-amber-400" />}
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>

                {/* Dates */}
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                      Start Date
                    </Text>
                    <View className="flex-row items-center border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800/50 px-3">
                      <CalendarIcon size={16} className="text-slate-400" />
                      <TextInput
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="YYYY-MM-DD"
                        className="flex-1 py-3 px-2 text-slate-800 dark:text-slate-200"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                      End Date
                    </Text>
                    <View className="flex-row items-center border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800/50 px-3">
                      <CalendarIcon size={16} className="text-slate-400" />
                      <TextInput
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="YYYY-MM-DD"
                        className="flex-1 py-3 px-2 text-slate-800 dark:text-slate-200"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>
                </View>

                {/* Info Text */}
                {startDate && endDate && (
                  <Text className="text-sm font-medium text-slate-500 dark:text-zinc-400 text-right">
                    Total Duration: {calculateDays(startDate, endDate)} days
                  </Text>
                )}

                {/* Reason */}
                <View>
                  <Text className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                    Reason
                  </Text>
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={4}
                    placeholder="Provide details for this leave application..."
                    className="border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800/50 p-3 h-24 text-slate-800 dark:text-slate-200"
                    placeholderTextColor="#9ca3af"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View className="p-6 border-t border-slate-200 dark:border-zinc-800 flex-row justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg border border-slate-200 dark:border-zinc-700 items-center justify-center"
            >
              <Text className="font-bold text-slate-600 dark:text-zinc-300">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !selectedType || !startDate || !endDate || !reason}
              className={`px-6 py-3 rounded-lg flex-row items-center justify-center gap-2 ${
                isSubmitting || !selectedType || !startDate || !endDate || !reason
                  ? 'bg-amber-300 opacity-50'
                  : 'bg-amber-400 active:bg-amber-500 hover:bg-amber-500'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <FileText size={18} color="#000" />
                  <Text className="font-bold text-black">Submit Application</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

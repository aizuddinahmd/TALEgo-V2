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
import { X, Calendar as CalendarIcon, FileText, ChevronDown, DollarSign } from 'lucide-react-native'
import { fetchClaimCategories, submitExpenseClaim } from '../../api/records'

interface ClaimApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  staffId: string
  orgId: string
  onSuccess: () => void
}

export function ClaimApplicationModal({
  isOpen,
  onClose,
  staffId,
  orgId,
  onSuccess,
}: ClaimApplicationModalProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
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
      const catData = await fetchClaimCategories()
      setCategories(catData)
    } catch (err) {
      console.error('Failed to load claim categories', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setClaimDate(new Date().toISOString().split('T')[0])
    setAmount('')
    setDescription('')
    setIsDropdownOpen(false)
  }

  const handleSubmit = async () => {
    if (!selectedCategory || !claimDate || !amount || !description) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }

    setIsSubmitting(true)
    try {
      await submitExpenseClaim({
        org_id: orgId,
        staff_id: staffId,
        category_id: selectedCategory,
        claim_date: claimDate,
        amount: numAmount,
        description,
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Submit error:', err)
      Alert.alert('Error', 'Failed to submit claim. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategoryDetails = categories.find(c => c.category_id === selectedCategory)

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
                New Expense Claim
              </Text>
              <Text className="text-sm text-zinc-500">
                Submit a new expense for reimbursement
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
                {/* Category Dropdown */}
                <View className="relative z-50">
                  <Text className="text-sm font-bold text-zinc-300 mb-2">
                    Claim Category *
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
                      {selectedCategoryDetails ? (
                        <Text className="font-bold text-white text-base">
                          {selectedCategoryDetails.category_name}
                        </Text>
                      ) : (
                        <Text className="text-zinc-500">Choose a category...</Text>
                      )}
                    </View>
                    <ChevronDown size={20} className={isDropdownOpen ? "text-brand-gold" : "text-zinc-500"} />
                  </TouchableOpacity>

                  {isDropdownOpen && (
                    <View className="absolute top-[85px] left-0 right-0 bg-[#1A1A1A] border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50 max-h-60 mt-2">
                      <ScrollView nestedScrollEnabled>
                        {categories.map((cat) => {
                          const isSelected = selectedCategory === cat.category_id
                          return (
                            <TouchableOpacity
                              key={cat.category_id}
                              onPress={() => {
                                setSelectedCategory(cat.category_id)
                                setIsDropdownOpen(false)
                              }}
                              className={`p-4 border-b border-white/5 flex-row justify-between items-center ${
                                isSelected ? 'bg-brand-gold/10' : 'hover:bg-white/5'
                              }`}
                            >
                              <Text className={`font-bold ${isSelected ? 'text-brand-gold' : 'text-zinc-200'}`}>
                                {cat.category_name}
                              </Text>
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

                {/* Date & Amount */}
                <View className={`${isDropdownOpen ? 'opacity-30 z-0' : 'z-10'} flex-row gap-4 transition-opacity`}>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-zinc-300 mb-2">
                      Claim Date *
                    </Text>
                    <View className="flex-row items-center border border-white/10 rounded-lg bg-[#1A1A1A] px-3 focus-within:border-brand-gold transition-colors">
                      <CalendarIcon size={16} className="text-zinc-500" />
                      <TextInput
                        value={claimDate}
                        onChangeText={setClaimDate}
                        placeholder="YYYY-MM-DD"
                        className="flex-1 py-3 px-2 text-white font-mono"
                        placeholderTextColor="#71717a"
                      />
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-bold text-zinc-300 mb-2">
                      Amount (RM) *
                    </Text>
                    <View className="flex-row items-center border border-white/10 rounded-lg bg-[#1A1A1A] px-3 focus-within:border-brand-gold transition-colors">
                      <DollarSign size={16} className="text-zinc-500" />
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="numeric"
                        className="flex-1 py-3 px-2 text-white font-mono"
                        placeholderTextColor="#71717a"
                      />
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View className={isDropdownOpen ? 'opacity-30 z-0' : 'z-10'}>
                  <Text className="text-sm font-bold text-zinc-300 mb-2">
                    Description / Purpose *
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholder="Provide details for this claim..."
                    className="border border-white/10 rounded-lg bg-[#1A1A1A] p-3 h-24 text-white focus:border-brand-gold transition-colors"
                    placeholderTextColor="#71717a"
                    textAlignVertical="top"
                  />
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
              disabled={isSubmitting || !selectedCategory || !claimDate || !amount || !description}
              className={`px-6 py-3 rounded-lg flex-row items-center justify-center gap-2 ${
                isSubmitting || !selectedCategory || !claimDate || !amount || !description
                  ? 'bg-brand-gold/30'
                  : 'bg-brand-gold shadow-[0_0_15px_rgba(251,191,36,0.3)] active:scale-95 hover:bg-yellow-400'
              } transition-all`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <FileText size={16} className="text-black" />
                  <Text className="font-bold text-black">Submit Claim</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

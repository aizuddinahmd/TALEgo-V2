import * as React from 'react'
import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Platform, Dimensions } from 'react-native'
import { MotiView, AnimatePresence } from 'moti'
import { 
  CalendarPlus, 
  Briefcase, 
  CalendarClock, 
  Clock, 
  CircleDollarSign, 
  ListChecks, 
  FileCheck, 
  MessageSquare 
} from 'lucide-react-native'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'

interface FabOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const ACTION_ITEMS = [
  { id: 'leave', label: 'Apply Leave', icon: CalendarPlus, color: '#0FA3B1' },
  { id: 'claim', label: 'Apply Claim', icon: Briefcase, color: '#0FA3B1' },
  { id: 'overtime', label: 'Apply Overtime', icon: CalendarClock, color: '#0FA3B1' },
  { id: 'timeoff', label: 'Apply Timeoff', icon: Clock, color: '#0FA3B1' },
  { id: 'gajinow', label: 'Apply GajiNow', icon: CircleDollarSign, color: '#0FA3B1' },
  { id: 'attendance', label: 'Attendance', icon: ListChecks, color: '#0FA3B1' },
  { id: 'approval', label: 'Approval', icon: FileCheck, color: '#0FA3B1' },
  { id: 'helpdesk', label: 'Helpdesk', icon: MessageSquare, color: '#0FA3B1' },
]

const ActionItem = React.memo(({ item, index, width, onPress }: any) => {
  const itemWidth = (width - 48) / 3

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.8, 
        translateY: 10,
      }}
      transition={{
        type: 'spring',
        delay: index * 20,
        damping: 20,
        stiffness: 250,
      }}
      style={{ width: itemWidth }}
      className="items-center mb-6"
    >
      <TouchableOpacity
        onPress={() => onPress(item.id)}
        className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md mb-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <item.icon color={item.color} size={28} strokeWidth={2} />
      </TouchableOpacity>
      <Text 
        className="text-white text-[12px] font-semibold text-center"
        numberOfLines={1}
      >
        {item.label}
      </Text>
    </MotiView>
  )
})

export function FabOverlay({ isOpen, onClose }: FabOverlayProps) {
  
  useEffect(() => {
    if (isOpen) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }, [isOpen])

  const handleItemPress = React.useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    console.log('Pressed item:', id)
    onClose()
  }, [onClose])

  const { width } = Dimensions.get('window')

  return (
    <AnimatePresence>
      {isOpen && (
        <View 
          style={StyleSheet.absoluteFill} 
          className="z-50"
          pointerEvents={isOpen ? 'auto' : 'none'}
        >
          {/* Gaussian Blur / Dark Overlay */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 150 }}
            style={StyleSheet.absoluteFill}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill}>
                <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
              </BlurView>
            ) : (
              <Pressable 
                onPress={onClose} 
                className="flex-1 bg-white/80 backdrop-blur-md" 
                style={StyleSheet.absoluteFill} 
              />
            )}
          </MotiView>

          {/* Action Grid */}
          <View className="absolute inset-x-0 bottom-32 px-6">
            <View className="flex-row flex-wrap justify-start">
              {ACTION_ITEMS.map((item, index) => (
                <ActionItem
                  key={item.id}
                  item={item}
                  index={index}
                  width={width}
                  onPress={handleItemPress}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </AnimatePresence>
  )
}

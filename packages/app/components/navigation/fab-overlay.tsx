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
// import { BlurView } from 'expo-blur'
// import * as Haptics from 'expo-haptics'

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

const ActionItem = React.memo(({ item, index, width, onPress, isExit }: any) => {
  const itemWidth = (width - 48) / 3

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, translateY: 10 }}
      transition={{
        type: 'timing',
        duration: isExit ? 80 : 150,
        delay: isExit ? 0 : index * 10,
      }}
      style={{ width: itemWidth }}
      className="items-center mb-6"
    >
      <TouchableOpacity
        onPress={() => onPress(item.id)}
        className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md mb-2"
        activeOpacity={0.7}
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
    if (isOpen && Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      } catch (e) {
        console.warn('Haptics not available', e)
      }
    }
  }, [isOpen])

  const handleItemPress = React.useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch (e) {
        // ignore
      }
    }
    onClose()
  }, [onClose])

  const { width } = Dimensions.get('window')

  return (
    <AnimatePresence>
      {isOpen && (
        <View 
          style={[StyleSheet.absoluteFill, { zIndex: 999 }]} 
          pointerEvents="auto" // Always auto when mounted
        >
          {/* Gaussian Blur / Dark Overlay */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 100 }}
            style={StyleSheet.absoluteFill}
          >
            {Platform.OS === 'ios' ? (
              (() => {
                const { BlurView } = require('expo-blur')
                return (
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill}>
                    <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
                  </BlurView>
                )
              })()
            ) : (
              <Pressable 
                onPress={onClose} 
                className="flex-1 bg-white/80 backdrop-blur-md" 
                style={StyleSheet.absoluteFill} 
              />
            )}
          </MotiView>

          {/* Action Grid */}
          <View className="absolute inset-x-0 bottom-32 px-6" pointerEvents="box-none">
            <View className="flex-row flex-wrap justify-start" pointerEvents="box-none">
              {ACTION_ITEMS.map((item, index) => (
                <ActionItem
                  key={item.id}
                  item={item}
                  index={index}
                  width={width}
                  onPress={handleItemPress}
                  isExit={!isOpen}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </AnimatePresence>
  )
}

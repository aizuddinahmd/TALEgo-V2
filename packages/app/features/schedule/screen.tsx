import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronRight, User, AlertCircle, RefreshCw, Send, ChevronLeft, ChevronDown, ChevronUp, Users, CalendarDays, ExternalLink, CalendarPlus, Plus } from 'lucide-react-native';
import { Image, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Helper to format date to YYYY-MM-DD in local time
const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mock Data
type Member = { id: string; name: string; avatar: string };

const TEAM_MEMBERS: Member[] = [
  { id: 'u1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Mike', avatar: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', name: 'Emily', avatar: 'https://i.pravatar.cc/150?u=u4' },
];

type Shift = {
  id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  role?: string;
  status?: string;
  duration?: string;
  team?: Member[];
  type?: 'shift' | 'leave';
  leave_type?: string;
  coordinates?: { lat: number, lng: number };
};

const SHIFTS_MOCK: Shift[] = [
  { 
    id: 'active-1', 
    date: '2026-03-09', // Today based on context
    start_time: '09:00 AM', 
    end_time: '06:00 PM', 
    location: 'HQ Office • Level 4, Studio A', 
    role: 'MORNING SHIFT', 
    status: 'Confirmed', 
    duration: '8h',
    team: TEAM_MEMBERS,
  },
  { 
    id: 'upcoming-1', 
    date: '2026-03-11', 
    start_time: '09:00', 
    end_time: '18:00', 
    role: 'Regular Shift', 
    type: 'shift'
  },
  { 
    id: 'upcoming-2', 
    date: '2026-03-12', 
    role: 'Day Off', 
    type: 'leave',
    leave_type: 'Scheduled Rest'
  }
];

// Helper to generate dates starting from a specific week's Monday
const generateWeekDates = (baseDate: Date, weekOffset = 0): { dayName: string; dayNumber: string; fullDate: string }[] => {
  const dates: { dayName: string; dayNumber: string; fullDate: string }[] = [];
  
  // Get day of week (0-6, 0 is Sunday)
  const day = baseDate.getDay();
  // Calculate distance to previous Monday (1)
  // If it's Sunday (0), we need to go back 6 days.
  const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
  
  // Create a new date object for Monday of the offset week
  const startDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), diff);
  
  // Generate 14 days starting from that Monday
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    
    dates.push({
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate().toString().padStart(2, '0'),
      fullDate: formatDateISO(d)
    });
  }
  return dates;
};

// Note: Unused helper functions (getStatusBadgeStyles, getStatusDotColor, TeamPulse, MonthView) removed as per redesign.

export function ScheduleScreen() {
  const [viewDate, setViewDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const weekDates = generateWeekDates(viewDate, weekOffset).slice(0, 7); // Show 7 days for the row
  const activeShift = SHIFTS_MOCK.find(shift => shift.date === selectedDate);
  const upcomingShifts = SHIFTS_MOCK.filter(shift => shift.date > selectedDate);

  const { width } = Dimensions.get('window');

  return (
    <SafeAreaView className="flex-1 bg-brand-black">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8">
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-10 px-2">
          <Text className="text-2xl font-bold text-white">My Schedule</Text>
          <TouchableOpacity className="w-12 h-12 bg-zinc-900 rounded-full items-center justify-center border border-white/5">
            <CalendarPlus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Date Selector Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerClassName="px-2 mb-10 gap-3"
        >
          {weekDates.map((dateObj) => {
            const isSelected = selectedDate === dateObj.fullDate;
            return (
              <TouchableOpacity
                key={dateObj.fullDate}
                onPress={() => setSelectedDate(dateObj.fullDate)}
                className={`items-center justify-center rounded-2xl w-[72px] h-[96px] ${
                  isSelected
                    ? 'bg-brand-gold'
                    : 'bg-zinc-900 border border-white/5'
                }`}
              >
                <Text className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${isSelected ? 'text-brand-black' : 'text-zinc-500'}`}>
                  {dateObj.dayName}
                </Text>
                <Text className={`text-xl font-bold ${isSelected ? 'text-brand-black' : 'text-zinc-400'}`}>
                  {dateObj.dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Shift Card / Selected Day Content */}
        <View className="px-2 mb-12">
          {activeShift ? (
            <View className="bg-zinc-900/50 rounded-[32px] p-8 border border-white/5">
              <View className="flex-row justify-between items-center mb-8">
                <View className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{activeShift.role || 'SHIFT'}</Text>
                </View>
                <Text className="text-zinc-500 font-bold text-sm">{activeShift.duration} Total</Text>
              </View>

              <Text className="text-3xl font-bold text-white mb-3">
                {activeShift.start_time} — {activeShift.end_time}
              </Text>
              <Text className="text-zinc-400 font-medium text-sm mb-8">
                {activeShift.location}
              </Text>

              {/* Team Avatars */}
              <View className="flex-row items-center">
                <View className="flex-row">
                  {activeShift.team?.slice(0, 2).map((member, index) => (
                    <View 
                      key={member.id} 
                      className={`w-10 h-10 rounded-full border-2 border-zinc-900 overflow-hidden ${index > 0 ? '-ml-3' : ''}`}
                    >
                      <Image source={{ uri: member.avatar }} className="w-full h-full" />
                    </View>
                  ))}
                  {(activeShift.team?.length ?? 0) > 2 && (
                    <View className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 items-center justify-center -ml-3">
                      <Text className="text-xs font-bold text-white">+{(activeShift.team?.length ?? 0) - 2}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-zinc-900/50 rounded-[32px] p-12 border border-white/5 items-center justify-center border-dashed">
               <CalendarIcon size={48} className="text-zinc-800 mb-4" />
               <Text className="text-xl font-bold text-white mb-2">No Shift Scheduled</Text>
               <Text className="text-zinc-500 text-center">Enjoy your day off!</Text>
            </View>
          )}
        </View>

        {/* Upcoming Section */}
        <View className="px-2">
          <Text className="text-xs font-bold text-zinc-500 uppercase tracking-[1px] mb-6">Upcoming</Text>
          
          <View className="gap-4">
            {upcomingShifts.map((shift) => {
               const [y, m, d] = shift.date.split('-').map(Number);
               const dateObj = new Date(y!, m! - 1, d!);
               const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
               const day = dateObj.getDate().toString().padStart(2, '0');

               return (
                 <View key={shift.id} className="flex-row items-center bg-zinc-900/30 rounded-3xl p-4 border border-white/5">
                   {/* Date Block */}
                   <View className="w-16 h-16 bg-zinc-900 rounded-2xl items-center justify-center mr-4 border border-white/5">
                      <Text className="text-[10px] font-bold text-zinc-500 mb-0.5 uppercase tracking-wider">{month}</Text>
                      <Text className="text-lg font-bold text-white">{day}</Text>
                   </View>

                   {/* Shift Details */}
                   <View>
                     <Text className="text-base font-bold text-white mb-1">{shift.role || shift.leave_type}</Text>
                     <Text className="text-zinc-500 font-medium text-xs">
                        {shift.type === 'leave' ? 'Scheduled Rest' : `${shift.start_time} - ${shift.end_time}`}
                     </Text>
                   </View>
                 </View>
               );
            })}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

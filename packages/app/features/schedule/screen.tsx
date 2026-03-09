import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { 
  Calendar as CalendarIcon, Clock, MapPin, ChevronRight, User, AlertCircle, 
  RefreshCw, Send, ChevronLeft, ChevronDown, ChevronUp, Users, 
  CalendarDays, ExternalLink, CalendarPlus, Plus, MoreHorizontal,
  Trash2, Copy, Search, Filter as FilterIcon, Bell
} from 'lucide-react-native';
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
    date: '2026-03-09', 
    start_time: '05:00 PM', 
    end_time: '05:45 PM', 
    location: 'Conference Room A', 
    role: 'Monday standup', 
    status: 'Confirmed', 
    duration: '45m',
    team: TEAM_MEMBERS,
    type: 'shift'
  },
  { 
    id: 'shift-2', 
    date: '2026-03-09', 
    start_time: '07:00 PM', 
    end_time: '08:00 PM', 
    location: 'Studio B', 
    role: 'Content planning', 
    status: 'Confirmed', 
    duration: '1h',
    type: 'shift'
  },
  { 
    id: 'shift-3', 
    date: '2026-03-10', 
    start_time: '06:30 PM', 
    end_time: '07:30 PM', 
    location: 'Online', 
    role: 'Product demo', 
    status: 'Confirmed', 
    duration: '1h',
    type: 'shift'
  },
  { 
    id: 'shift-4', 
    date: '2026-03-11', 
    start_time: '05:00 PM', 
    end_time: '06:00 PM', 
    location: 'Office', 
    role: 'Deep work', 
    status: 'Confirmed', 
    duration: '1h',
    type: 'shift'
  },
  { 
    id: 'shift-5', 
    date: '2026-03-11', 
    start_time: '06:00 PM', 
    end_time: '06:45 PM', 
    location: 'Office', 
    role: 'One-on-one w/ Eva', 
    status: 'Confirmed', 
    duration: '45m',
    type: 'shift'
  },
  { 
    id: 'shift-6', 
    date: '2026-03-11', 
    start_time: '06:30 PM', 
    end_time: '07:30 PM', 
    location: 'Office', 
    role: 'Design sync', 
    status: 'Confirmed', 
    duration: '1h',
    type: 'shift'
  },
  { 
    id: 'shift-7', 
    date: '2026-03-12', 
    start_time: '08:00 PM', 
    end_time: '09:00 PM', 
    location: 'Online', 
    role: 'Lunch with Olivia', 
    status: 'Confirmed', 
    duration: '1h',
    type: 'shift'
  },
  { 
    id: 'leave-1', 
    date: '2026-03-14', 
    role: 'Weekend Off', 
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

type ViewType = 'day' | 'week' | 'month';

export function ScheduleScreen() {
  const [viewDate, setViewDate] = useState(new Date(2026, 2, 9)); // Set to March 9, 2026 as per images
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date(2026, 2, 9)));
  const [viewType, setViewType] = useState<ViewType>('week');
  const [hasMounted, setHasMounted] = useState(false);
  const { width } = Dimensions.get('window');
  const isWebDesktop = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const weekDates = generateWeekDates(viewDate, weekOffset).slice(0, 7);
  const activeShift = SHIFTS_MOCK.find(shift => shift.date === selectedDate);
  const upcomingShifts = SHIFTS_MOCK.filter(shift => shift.date > selectedDate);

  if (!hasMounted) return null;

  if (isWebDesktop) {
    return (
      <View className="flex-1 bg-[#090909]">
        <View className="p-6">
          {/* Web Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 bg-zinc-900 rounded-xl items-center justify-center border border-white/5">
                <Text className="text-[10px] font-bold text-zinc-500 uppercase">MAR</Text>
                <Text className="text-xl font-bold text-white">9</Text>
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl font-bold text-white">March 2026</Text>
                  <View className="bg-zinc-800 px-2 py-0.5 rounded">
                    <Text className="text-[10px] font-bold text-zinc-400">Week 2</Text>
                  </View>
                </View>
                <Text className="text-zinc-500 text-sm">
                  {viewType === 'month' ? '1 Mar 2026 – 31 Mar 2026' : '9 Mar 2026 – 15 Mar 2026'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-2 mr-2">
                <TouchableOpacity className="p-2 bg-zinc-900 rounded-lg border border-white/5">
                  <Search size={16} color="zinc-500" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-zinc-900 rounded-lg border border-white/5">
                  <FilterIcon size={16} color="zinc-500" />
                </TouchableOpacity>
              </View>

              <View className="flex-row bg-zinc-900 rounded-lg p-1 border border-white/5">
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => setWeekOffset(prev => prev - 1)}
                >
                  <ChevronLeft size={16} color="zinc-400" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-4 py-2 bg-zinc-800 rounded-md"
                  onPress={() => {
                    setViewDate(new Date(2026, 2, 9));
                    setWeekOffset(0);
                    setSelectedDate(formatDateISO(new Date(2026, 2, 9)));
                  }}
                >
                  <Text className="text-xs font-bold text-white">Today</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => setWeekOffset(prev => prev + 1)}
                >
                  <ChevronRight size={16} color="zinc-400" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                className="flex-row items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-white/5"
                onPress={() => setViewType(viewType === 'day' ? 'week' : viewType === 'week' ? 'month' : 'day')}
              >
                <Text className="text-xs font-bold text-white uppercase">{viewType} view</Text>
                <ChevronDown size={14} color="zinc-400" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center gap-2 bg-[#7C3AED] px-4 py-2 rounded-lg">
                <Plus size={16} color="white" />
                <Text className="text-xs font-bold text-white">Add event</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Web Views */}
          {viewType === 'week' && <WebWeekView shifts={SHIFTS_MOCK} dates={weekDates} />}
          {viewType === 'month' && <WebMonthView shifts={SHIFTS_MOCK} />}
          {viewType === 'day' && <WebDayView shifts={SHIFTS_MOCK} selectedDate={selectedDate} />}
        </View>
      </View>
    );
  }

  // Mobile View
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

// --- Web Desktop Components ---

function WebWeekView({ shifts, dates }: { shifts: Shift[], dates: any[] }) {
  const hours = Array.from({ length: 9 }, (_, i) => i + 14); // 2pm - 10pm for better range

  const getEventStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('standup')) return 'bg-zinc-800/80 border-zinc-700 text-white';
    if (r.includes('design') || r.includes('content') || r.includes('product')) return 'bg-blue-900/40 border-blue-500/30 text-blue-100';
    if (r.includes('lunch') || r.includes('eva')) return 'bg-green-900/40 border-green-500/30 text-green-100';
    if (r.includes('rest') || r.includes('off')) return 'bg-zinc-900/50 border-white/5 text-zinc-500';
    return 'bg-purple-900/40 border-purple-500/30 text-purple-100';
  };

  return (
    <View className="flex-1 border border-white/5 rounded-2xl overflow-hidden bg-black/20">
      {/* Header Row */}
      <View className="flex-row border-b border-white/5 bg-zinc-900/30">
        <View className="w-16 py-4 items-center justify-center border-r border-white/5" />
        {dates.map((date, i) => (
          <View key={i} className="flex-1 py-4 items-center justify-center border-r border-white/5">
             <View className="flex-row items-center gap-2">
                <Text className="text-zinc-500 text-xs font-bold uppercase tracking-tight">{date.dayName}</Text>
                <View className={`w-7 h-7 rounded-full items-center justify-center ${i === 0 ? 'bg-[#6366f1]' : 'bg-zinc-800/50 border border-white/5'}`}>
                  <Text className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-zinc-400'}`}>{parseInt(date.dayNumber)}</Text>
                </View>
             </View>
          </View>
        ))}
      </View>

      {/* Grid Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {hours.map((hour) => (
          <View key={hour} className="flex-row border-b border-white/5 min-h-[120px]">
            <View className="w-16 items-start justify-start pt-3 pl-3 border-r border-white/5">
               <Text className="text-[10px] font-bold text-zinc-600 uppercase">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'pm' : 'am'}</Text>
            </View>
            {dates.map((date, i) => {
              const dayShifts = shifts.filter(s => s.date === date.fullDate && s.start_time?.includes(`${hour > 12 ? hour - 12 : hour}:`));
              return (
                <View key={i} className="flex-1 border-r border-white/5 p-1 relative">
                  {dayShifts.map(s => (
                    <TouchableOpacity 
                      key={s.id} 
                      className={`rounded-xl p-3 border ${getEventStyle(s.role || '')} mb-1 h-[90%] justify-center`}
                    >
                      <Text className="text-[11px] font-bold mb-1" numberOfLines={1}>{s.role}</Text>
                      <Text className="text-[10px] font-bold opacity-60">{s.start_time?.toLowerCase()}</Text>
                    </TouchableOpacity>
                  ))}
                  {/* Subtle placeholder for interaction like the image (+) */}
                  {dayShifts.length === 0 && (
                    <View className="w-full h-full items-center justify-center opacity-0 hover:opacity-100">
                       <TouchableOpacity className="w-8 h-8 bg-zinc-800 rounded-lg items-center justify-center border border-white/5">
                          <Plus size={14} color="zinc-400" />
                       </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function WebMonthView({ shifts }: { shifts: Shift[] }) {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Adjusted grid for March 2026 (Starts on Sunday Mar 1)
  const grid = Array.from({ length: 35 }, (_, i) => i - 0); // 0-34
  
  const getEventStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('standup')) return 'bg-zinc-800/80 border-zinc-700 text-white';
    if (r.includes('design') || r.includes('content') || r.includes('product')) return 'bg-blue-900/40 border-blue-500/30 text-blue-100';
    if (r.includes('lunch') || r.includes('eva')) return 'bg-green-900/40 border-green-500/30 text-green-100';
    return 'bg-purple-900/40 border-purple-500/30 text-purple-100';
  };

  return (
    <View className="flex-1 border border-white/5 rounded-2xl overflow-hidden bg-black/20">
      <View className="flex-row border-b border-white/5 py-4 bg-zinc-900/30">
        {dayNames.map(d => (
          <View key={d} className="flex-1 items-center"><Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{d}</Text></View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {grid.map((i) => {
          // Calculation for a generic Mar 2026 grid starting Feb 23
          const dayNum = i - 5; 
          const isCurrentMonth = dayNum > 0 && dayNum <= 31;
          const displayNum = isCurrentMonth ? dayNum : (dayNum <= 0 ? 23 + i : i - 31 + 5);
          const dateStr = isCurrentMonth ? `2026-03-${dayNum.toString().padStart(2, '0')}` : null;
          const dayShifts = dateStr ? shifts.filter(s => s.date === dateStr) : [];

          return (
            <View key={i} className={`w-[14.28%] aspect-square border-r border-b border-white/5 p-3 ${!isCurrentMonth ? 'opacity-40' : ''}`}>
               <View className="flex-row justify-between items-start mb-2">
                 <View className={`w-6 h-6 rounded-full items-center justify-center ${dayNum === 9 ? 'bg-[#6366f1]' : ''}`}>
                   <Text className={`text-xs font-bold ${dayNum === 9 ? 'text-white' : 'text-zinc-600'}`}>
                     {displayNum}
                   </Text>
                 </View>
                 {dayNum === 12 && <TouchableOpacity className="opacity-60"><Plus size={14} color="zinc-500" /></TouchableOpacity>}
               </View>
               <View className="gap-1.5">
                 {dayShifts.slice(0, 3).map(s => (
                   <View key={s.id} className={`rounded-md px-2 py-1 border ${getEventStyle(s.role || '')}`}>
                     <Text className="text-[9px] font-bold" numberOfLines={1}>{s.role}</Text>
                   </View>
                 ))}
                 {dayShifts.length > 3 && (
                   <Text className="text-[9px] font-bold text-zinc-500 ml-1">{dayShifts.length - 3} more...</Text>
                 )}
               </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function WebDayView({ shifts, selectedDate }: { shifts: Shift[], selectedDate: string }) {
  const dayShifts = shifts.filter(s => s.date === selectedDate);
  const hours = Array.from({ length: 9 }, (_, i) => i + 14);

  return (
    <View className="flex-1 flex-row gap-8">
      {/* Timeline Section */}
      <View className="flex-[2.5] border border-white/5 rounded-2xl bg-black/20 overflow-hidden">
        <ScrollView showsVerticalScrollIndicator={false}>
          {hours.map((hour) => (
            <View key={hour} className="flex-row border-b border-white/5 min-h-[140px]">
              <View className="w-20 items-start pt-4 pl-4 border-r border-white/5">
                 <Text className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                   {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'pm' : 'am'}
                 </Text>
              </View>
              <View className="flex-1 p-3">
                {dayShifts.filter(s => s.start_time?.includes(`${hour > 12 ? hour - 12 : hour}:`)).map(s => (
                  <TouchableOpacity key={s.id} className="bg-blue-600/30 border border-blue-500/30 rounded-2xl p-6 h-full justify-center">
                     <Text className="text-lg font-bold text-white mb-2">{s.role}</Text>
                     <Text className="text-sm text-blue-400 font-bold">{s.start_time?.toLowerCase()}</Text>
                  </TouchableOpacity>
                ))}
                {dayShifts.length === 0 && (
                   <View className="flex-1 items-center justify-center opacity-0 hover:opacity-100 border border-dashed border-white/5 rounded-xl">
                      <Plus size={20} color="zinc-800" />
                   </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Sidebar Details */}
      <View className="flex-1 gap-6">
        {/* Mini Calendar Container */}
        <View className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5">
          <View className="flex-row justify-between items-center mb-6 px-1">
             <TouchableOpacity><ChevronLeft size={16} color="zinc-500" /></TouchableOpacity>
             <Text className="text-sm font-bold text-white">March 2026</Text>
             <TouchableOpacity><ChevronRight size={16} color="zinc-500" /></TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
              <View key={d} className="w-[14.28%] items-center mb-4">
                <Text className="text-[10px] font-bold text-zinc-700">{d}</Text>
              </View>
            ))}
            {Array.from({ length: 35 }, (_, i) => i - 5).map((d, i) => (
              <TouchableOpacity key={i} className="w-[14.28%] aspect-square items-center justify-center mb-1">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${d === 9 ? 'bg-[#6366f1]' : d === 10 ? 'bg-zinc-800' : ''}`}>
                  <Text className={`text-[11px] font-bold ${d === 9 ? 'text-white' : d > 0 && d <= 31 ? 'text-zinc-400' : 'text-zinc-800'}`}>
                    {d > 0 && d <= 31 ? d : d <= 0 ? 23 + i : i - 31 + 5}
                  </Text>
                </View>
                {d === 2 || d === 3 || d === 6 || d === 7 || d === 10 || d === 11 || d === 12 || d === 13 || d === 14 || d === 16 || d === 18 || d === 19 || d === 20 || d === 23 || d === 25 || d === 26 || d === 27 || d === 28 || d === 29 || d === 30 || d === 31 ? (
                  <View className="w-1 h-1 bg-purple-500 rounded-full mt-0.5" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Event Detail Card */}
        {dayShifts[0] ? (
          <View className="bg-zinc-900/40 rounded-3xl p-8 border border-white/5">
             <View className="flex-row justify-between items-center mb-8">
                <Text className="text-xl font-bold text-white">{dayShifts[0].role}</Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity><Copy size={18} color="zinc-500" /></TouchableOpacity>
                  <TouchableOpacity><Trash2 size={18} color="zinc-500" /></TouchableOpacity>
                  <TouchableOpacity><ExternalLink size={18} color="zinc-500" /></TouchableOpacity>
                </View>
             </View>
             
             <View className="gap-6 mb-10">
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-zinc-800 rounded-xl items-center justify-center border border-white/5">
                    <CalendarIcon size={18} color="zinc-400" />
                  </View>
                  <Text className="text-sm font-bold text-zinc-300">Monday, Mar 9, 2026</Text>
                </View>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-zinc-900 rounded-xl items-center justify-center border border-white/5">
                    <Clock size={18} color="zinc-400" />
                  </View>
                  <Text className="text-sm font-bold text-zinc-300">{dayShifts[0].start_time} - {dayShifts[0].end_time}</Text>
                </View>
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 bg-zinc-900 rounded-xl items-center justify-center border border-white/5">
                    <Bell size={18} color="zinc-400" />
                  </View>
                  <Text className="text-sm font-bold text-zinc-300">10 min before</Text>
                </View>
             </View>

             {/* Guest Section from Image */}
             <View className="mb-8">
               <View className="flex-row items-center gap-2 mb-4">
                 <View className="flex-row">
                    {TEAM_MEMBERS.map((m, i) => (
                      <View key={m.id} className={`w-8 h-8 rounded-full border-2 border-zinc-900 overflow-hidden ${i > 0 ? '-ml-2' : ''}`}>
                        <Image source={{ uri: m.avatar }} className="w-full h-full" />
                      </View>
                    ))}
                    <View className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 items-center justify-center -ml-2">
                       <Text className="text-[10px] font-bold text-white">OR</Text>
                    </View>
                    <TouchableOpacity className="w-8 h-8 rounded-full border border-dashed border-zinc-600 items-center justify-center ml-2">
                       <Plus size={14} color="zinc-500" />
                    </TouchableOpacity>
                 </View>
               </View>
               <View className="flex-row items-center gap-2">
                 <Text className="text-xs font-bold text-white">6 guests</Text>
                 <View className="w-1 h-1 bg-zinc-800 rounded-full" />
                 <Text className="text-xs font-bold text-zinc-500">5 yes</Text>
                 <View className="w-1 h-1 bg-zinc-800 rounded-full" />
                 <Text className="text-xs font-bold text-zinc-500">1 awaiting</Text>
               </View>
             </View>

             <View>
               <Text className="text-xs font-bold text-white mb-2 uppercase tracking-wide">About this event</Text>
               <Text className="text-[12px] text-zinc-500 leading-5">
                 Sienna is inviting you to a scheduled Zoom meeting. This session covers the upcoming product roadmap and content strategies for Q2 2026.
               </Text>
             </View>
          </View>
        ) : (
          <View className="bg-zinc-900/40 rounded-3xl p-12 border border-white/5 items-center justify-center border-dashed">
             <CalendarIcon size={40} className="text-zinc-800 mb-4" />
             <Text className="text-sm font-bold text-zinc-500">Select an event to see details</Text>
          </View>
        )}
      </View>
    </View>
  );
}

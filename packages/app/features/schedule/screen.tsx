import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
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
    id: '1', 
    date: '2026-03-05', 
    start_time: '08:00 AM', 
    end_time: '05:00 PM', 
    location: 'HQ Building - Floor 3', 
    role: 'Front Desk', 
    status: 'Confirmed', 
    duration: '9h',
    team: [TEAM_MEMBERS[0]!, TEAM_MEMBERS[1]!, TEAM_MEMBERS[2]!],
    coordinates: { lat: 3.1390, lng: 101.6869 } 
  },
  { 
    id: '2', 
    date: '2026-03-06', 
    start_time: '10:00 AM', 
    end_time: '06:00 PM', 
    location: 'Branch Office A', 
    role: 'Customer Support', 
    status: 'Pending', 
    duration: '8h',
    team: [TEAM_MEMBERS[1]!, TEAM_MEMBERS[3]!],
    coordinates: { lat: 3.1412, lng: 101.6845 }
  },
  { 
    id: '3', 
    date: '2026-03-07', 
    start_time: '09:00 AM', 
    end_time: '01:00 PM', 
    location: 'HQ Building - Floor 2', 
    role: 'Admin Assist', 
    status: 'Completed', 
    duration: '4h',
    team: [TEAM_MEMBERS[0]!],
    coordinates: { lat: 3.1390, lng: 101.6869 }
  },
  {
    id: 'leave-1',
    date: '2026-03-08',
    type: 'leave',
    leave_type: 'Annual Leave',
    status: 'Approved'
  }
];

// Helper to generate dates starting from a specific week's Monday
const generateWeekDates = (weekOffset = 0): { dayName: string; dayNumber: string; fullDate: string }[] => {
  const dates: { dayName: string; dayNumber: string; fullDate: string }[] = [];
  const today = new Date();
  
  // Get current day of week (0-6, 0 is Sunday)
  const day = today.getDay();
  // Calculate distance to previous Monday (1)
  // If it's Sunday (0), we need to go back 6 days.
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
  
  // Create a new date object for Monday of the offset week
  const startDay = new Date(today.getFullYear(), today.getMonth(), diff);
  
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

const getStatusBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'completed':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
    case 'cancelled':
    case 'holiday':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
};

const getStatusDotColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed': return 'bg-green-500';
    case 'upcoming':
    case 'pending': return 'bg-blue-500';
    case 'swap': return 'bg-yellow-500';
    case 'holiday': return 'bg-red-500';
    case 'completed': return 'bg-green-600';
    default: return 'bg-slate-300 dark:bg-zinc-600';
  }
};

const TeamPulse = ({ team }: { team?: Member[] }) => {
  if (!team || team.length === 0) return null;
  return (
    <View className="flex-row items-center mt-3">
      <View className="flex-row">
        {team.slice(0, 3).map((member, index) => (
          <View 
            key={member.id} 
            className={`w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden ${index > 0 ? '-ml-2' : ''}`}
          >
            <Image source={{ uri: member.avatar }} className="w-full h-full" />
          </View>
        ))}
        {team.length > 3 && (
          <View className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 items-center justify-center -ml-2">
            <Text className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">+{team.length - 3}</Text>
          </View>
        )}
      </View>
      <Text className="text-xs text-slate-500 dark:text-zinc-400 ml-2 font-medium">Team Pulse</Text>
    </View>
  );
};

const MonthView = ({ selectedDate, onSelectDate, getShiftStatusForDate }: { selectedDate: string, onSelectDate: (d: string) => void, getShiftStatusForDate: (d: string) => string | null }) => {
  const dates: (string | null)[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Adjusted first day to Monday-start (0 = Mon, 6 = Sun)
  const firstDayIdx = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);

  // Fill empty days
  for (let i = 0; i < firstDayIdx; i++) {
    dates.push(null);
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    dates.push(formatDateISO(d));
  }

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-xl mb-6">
      <View className="flex-row mb-4">
        {dayNames.map((name, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{name}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {dates.map((date, i) => {
          if (!date) return <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />;
          const isSelected = selectedDate === date;
          const status = getShiftStatusForDate(date);
          const dayNum = date.split('-')[2]!;
          
          return (
            <TouchableOpacity 
              key={date} 
              onPress={() => onSelectDate(date)}
              className="w-[14.28%] aspect-square items-center justify-center relative"
            >
              <View className={`w-10 h-10 items-center justify-center rounded-2xl ${isSelected ? 'bg-brand-blue shadow-md' : ''}`}>
                <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-zinc-300'}`}>
                  {parseInt(dayNum)}
                </Text>
              </View>
              {status && (
                <View className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${getStatusDotColor(status)}`} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export function ScheduleScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [isMonthView, setIsMonthView] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const toggleCalendarView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMonthView(!isMonthView);
  };

  const weekDates = generateWeekDates(weekOffset);
  const filteredShifts = SHIFTS_MOCK.filter(shift => shift.date === selectedDate);
  const totalHoursThisWeek = '32h'; // Mocked aggregation

  const getShiftStatusForDate = (date: string): string | null => {
    const shift = SHIFTS_MOCK.find(s => s.date === date);
    if (!shift) return null;
    if (shift.type === 'leave') return 'holiday';
    return shift.status || null;
  };

  const renderMobileShiftItem = ({ item }: { item: Shift }) => {
    if (item.type === 'leave') {
      return (
        <View className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 p-5 mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full items-center justify-center">
                <Send size={20} className="text-amber-600 dark:text-amber-400" />
              </View>
              <View>
                <Text className="text-lg font-bold text-amber-800 dark:text-amber-300">{item.leave_type}</Text>
                <Text className="text-sm text-amber-600 dark:text-amber-500 font-medium">Approved Leave</Text>
              </View>
            </View>
            <View className="bg-amber-200 dark:bg-amber-900/50 px-3 py-1 rounded-full">
              <Text className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">On Leave</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 mb-4 overflow-hidden">
        {/* Top Section: Time & Status */}
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <View className="flex-row items-center gap-1.5 mb-1">
              <Clock size={14} className="text-slate-400" />
              <Text className="text-slate-800 dark:text-white font-bold text-lg">{item.start_time} - {item.end_time}</Text>
            </View>
            <Text className="text-slate-500 dark:text-zinc-400 text-sm font-medium">{item.duration} Duration</Text>
          </View>
          <View className={`px-3 py-1 rounded-full border ${getStatusBadgeStyles(item.status || '')}`}>
            <Text className="text-[10px] uppercase font-bold tracking-wider text-inherit">{item.status}</Text>
          </View>
        </View>
        
        {/* Role & Location */}
        <View className="flex-1">
          <Text className="text-slate-800 dark:text-white font-bold text-xl mb-2">{item.role}</Text>
          <TouchableOpacity 
            className="flex-row items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700"
            onPress={() => console.log('Open Maps', item.location)}
          >
            <MapPin size={16} className="text-brand-blue" />
            <Text className="text-brand-blue font-semibold text-sm flex-1" numberOfLines={1}>{item.location}</Text>
            <ExternalLink size={14} className="text-brand-blue opacity-60" />
          </TouchableOpacity>
        </View>

        {/* Team Pulse */}
        <TeamPulse team={item.team} />

        {/* Divider */}
        <View className="h-[1px] bg-slate-100 dark:bg-zinc-800 my-4" />

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 py-3 rounded-xl items-center justify-center flex-row gap-2">
            <RefreshCw size={14} className="text-slate-600 dark:text-zinc-300" />
            <Text className="text-slate-700 dark:text-zinc-200 font-bold text-xs uppercase">Request Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 py-3 rounded-xl items-center justify-center flex-row gap-2">
            <Plus size={14} className="text-slate-600 dark:text-zinc-300" />
            <Text className="text-slate-700 dark:text-zinc-200 font-bold text-xs uppercase">Offer Pickup</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#111111]">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <View className="flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <View>
            <Text className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-2">My Schedule</Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/50 flex-row items-center gap-1.5">
                <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                <Text className="text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">Total this week: {totalHoursThisWeek}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <TouchableOpacity className="flex-1 md:flex-none border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1A1A1A] rounded-lg px-4 py-3 flex-row items-center justify-center gap-2 shadow-sm">
              <RefreshCw size={16} className="text-slate-600 dark:text-zinc-300" />
              <Text className="text-slate-700 dark:text-zinc-200 font-bold text-sm">Swap</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 md:flex-none bg-amber-400 hover:bg-amber-500 rounded-lg px-5 py-3 flex-row items-center justify-center gap-2 shadow-sm active:opacity-80">
              <Send size={16} color="black" />
              <Text className="text-black font-bold text-sm">Apply for Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Calendar Header */}
        <View className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <View>
              <Text className="text-xl font-bold text-slate-800 dark:text-white">
                {(() => {
                  const [y, m, d] = selectedDate.split('-').map(Number);
                  return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                })()}
              </Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs font-medium">Your Schedule Overview</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700">
                <CalendarPlus size={18} className="text-slate-600 dark:text-zinc-400" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={toggleCalendarView}
                className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700"
              >
                {isMonthView ? (
                  <ChevronUp size={18} className="text-slate-600 dark:text-zinc-400" />
                ) : (
                  <ChevronDown size={18} className="text-slate-600 dark:text-zinc-400" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {isMonthView ? (
            <MonthView 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
              getShiftStatusForDate={(d) => getShiftStatusForDate(d) || null}
            />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-2">
              {weekDates.map((dateObj) => {
                const isSelected = selectedDate === dateObj.fullDate;
                const status = getShiftStatusForDate(dateObj.fullDate);
                return (
                  <TouchableOpacity
                    key={dateObj.fullDate}
                    onPress={() => setSelectedDate(dateObj.fullDate)}
                    className={`items-center justify-center rounded-2xl py-4 px-4 min-w-[65px] border shadow-sm ${
                      isSelected
                        ? 'bg-brand-blue border-brand-blue'
                        : 'bg-white dark:bg-zinc-800 border-slate-100 dark:border-zinc-700'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold mb-1 uppercase tracking-tighter ${isSelected ? 'text-white/80' : 'text-slate-400 dark:text-zinc-500'}`}>
                      {dateObj.dayName}
                    </Text>
                    <Text className={`text-lg font-black ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                      {dateObj.dayNumber}
                    </Text>
                    {status && (
                      <View className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-white' : getStatusDotColor(status)}`} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Quick Stats Overlay */}
          <View className="flex-row items-center justify-between mt-4 px-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
             <View className="flex-row items-center gap-3">
               <View className="flex-row items-center gap-1">
                 <View className="w-2 h-2 rounded-full bg-green-500" />
                 <Text className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Confirmed</Text>
               </View>
               <View className="flex-row items-center gap-1">
                 <View className="w-2 h-2 rounded-full bg-blue-500" />
                 <Text className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Pending</Text>
               </View>
               <View className="flex-row items-center gap-1">
                 <View className="w-2 h-2 rounded-full bg-red-500" />
                 <Text className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Leave</Text>
               </View>
             </View>
             <TouchableOpacity 
               className="flex-row items-center gap-1.5 bg-brand-blue/10 dark:bg-brand-blue/20 px-3 py-1.5 rounded-full"
               onPress={() => console.log('Syncing...')}
             >
               <CalendarPlus size={12} className="text-brand-blue" />
               <Text className="text-[10px] font-bold text-brand-blue uppercase">Sync to Phone</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Content Area - Shift Feed */}
        <View className="flex-1">
          <Text className="text-sm font-bold text-slate-800 dark:text-white mb-3">
            Shifts for {(() => {
              if (!hasMounted || !selectedDate) return '...';
              const [y, m, d] = selectedDate.split('-').map(Number);
              return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'});
            })()}
          </Text>
          
          {filteredShifts.length === 0 ? (
            // Empty State
            <View className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 items-center justify-center my-4 border-dashed">
              <View className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full items-center justify-center mb-4">
                <CalendarIcon size={32} className="text-slate-300 dark:text-zinc-600" />
              </View>
              <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">You're off today!</Text>
              <Text className="text-slate-500 dark:text-zinc-400 text-center">Enjoy your rest. There are no shifts scheduled for you on this date.</Text>
            </View>
          ) : (
            <>
              {/* Mobile View: Vertical List */}
              <View className="flex md:hidden">
                {filteredShifts.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderMobileShiftItem({ item })}
                  </React.Fragment>
                ))}
              </View>

              {/* Web / Desktop View: Data Table */}
              <View className="hidden md:flex flex-1 bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm mt-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 w-full" contentContainerClassName="min-w-full">
                  <View className="min-w-[800px] w-full flex-1">
                    {/* Table Header */}
                    <View className="flex-row items-center border-b border-slate-200 dark:border-white/5 px-4 py-3 bg-slate-50 dark:bg-[#222222]">
                      <View className="flex-[1.5]"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date & Time</Text></View>
                      <View className="flex-[1]"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Duration</Text></View>
                      <View className="flex-[2]"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Role & Location</Text></View>
                      <View className="flex-[1]"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Status</Text></View>
                      <View className="flex-[1]"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Actions</Text></View>
                    </View>

                    {/* Table Rows */}
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 w-full">
                      {filteredShifts.map((item) => (
                        <View key={item.id} className="flex-row items-center border-b border-slate-100 dark:border-white/5 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          
                          {/* Date & Time */}
                          <View className="flex-[1.5]">
                            <Text className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">
                              {(() => {
                                const [y, m, d] = item.date.split('-').map(Number);
                                return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'});
                              })()}
                            </Text>
                            {item.type !== 'leave' && (
                              <View className="flex-row items-center gap-1">
                                <Clock size={12} className="text-slate-400" />
                                <Text className="text-sm text-slate-500 dark:text-zinc-400 font-mono">{item.start_time} - {item.end_time}</Text>
                              </View>
                            )}
                          </View>

                          {/* Duration */}
                          <View className="flex-[1]">
                            <Text className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-mono">{item.duration || '-'}</Text>
                          </View>

                          {/* Role & Location */}
                          <View className="flex-[2]">
                            <View className="flex-row items-center gap-1.5 mb-1">
                              <User size={14} className="text-slate-400" />
                              <Text className="text-sm font-bold text-slate-800 dark:text-white">{item.role || item.leave_type}</Text>
                            </View>
                            {item.location && (
                              <View className="flex-row items-center gap-1.5">
                                <MapPin size={12} className="text-slate-400" />
                                <Text className="text-xs text-slate-500 dark:text-zinc-400">{item.location}</Text>
                              </View>
                            )}
                          </View>

                          {/* Status */}
                          <View className="flex-[1]">
                            <View className={`self-start px-2.5 py-1 rounded border ${getStatusBadgeStyles(item.status || '')}`}>
                              <Text className={`text-[10px] uppercase font-bold tracking-wider text-inherit`}>{item.status}</Text>
                            </View>
                          </View>

                          {/* Actions */}
                          <View className="flex-[1]">
                            {item.type !== 'leave' && (
                              <TouchableOpacity className="self-start bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5">
                                <Text className="text-xs font-bold text-slate-600 dark:text-zinc-300">Swap</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </ScrollView>
              </View>
            </>
          )}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

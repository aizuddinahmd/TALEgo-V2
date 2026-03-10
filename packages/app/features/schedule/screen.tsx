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
const generateWeekDates = (baseDate: Date, weekOffset = 0): { dayName: string; dayNumber: string; fullDate: string, date: Date }[] => {
  const dates: { dayName: string; dayNumber: string; fullDate: string, date: Date }[] = [];
  
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
      fullDate: formatDateISO(d),
      date: d
    });
  }
  return dates;
};

const getWeekOfMonth = (date: Date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay() || 7; // 1 (Mon) to 7 (Sun)
  const offsetDate = date.getDate() + firstDayOfWeek - 1;
  return Math.ceil(offsetDate / 7);
};

const formatWeekRange = (date: Date) => {
  const weekDates = generateWeekDates(date, 0).slice(0, 7);
  const start = weekDates[0]!.date;
  const end = weekDates[6]!.date;
  
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return `${start.toLocaleDateString('en-GB', options)} – ${end.toLocaleDateString('en-GB', options)}`;
};

// Note: Unused helper functions (getStatusBadgeStyles, getStatusDotColor, TeamPulse, MonthView) removed as per redesign.

export function ScheduleScreen() {
  const [viewDate, setViewDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [hasMounted, setHasMounted] = useState(false);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { width } = Dimensions.get('window');
  const isDesktop = width >= 1024;

  if (!hasMounted) return null;

  if (isDesktop) {
    return (
      <DesktopView 
        viewDate={viewDate} 
        setViewDate={setViewDate}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );
  }

  const weekDates = generateWeekDates(viewDate, weekOffset).slice(0, 7);
  const activeShift = SHIFTS_MOCK.find(shift => shift.date === selectedDate);
  const upcomingShifts = SHIFTS_MOCK.filter(shift => shift.date > selectedDate);

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

function DesktopView({ 
  viewDate, 
  setViewDate, 
  activeView, 
  setActiveView,
  selectedDate,
  setSelectedDate
}: { 
  viewDate: Date, 
  setViewDate: (d: Date) => void,
  activeView: 'day' | 'week' | 'month',
  setActiveView: (v: 'day' | 'week' | 'month') => void,
  selectedDate: string,
  setSelectedDate: (s: string) => void
}) {
  return (
    <View className="flex-1 bg-deep-black">
      {/* Main Content Area */}
      <View className="flex-1">
        {/* Top Header */}
        <View className="h-28 border-b border-gunmetal flex-row items-center justify-between px-10 bg-deep-black">
          <View className="flex-row items-center gap-6">
            {/* Date Block */}
            <View className="w-16 h-16 bg-midnight-charcoal border border-gunmetal rounded-2xl overflow-hidden shadow-sm">
              <View className="bg-deep-black/60 py-1.5 items-center border-b border-gunmetal">
                <Text className="text-[9px] font-bold text-muted-silver uppercase tracking-[2px]">
                  {viewDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 items-center justify-center bg-midnight-charcoal">
                <Text className="text-2xl font-bold text-white tracking-tighter">
                  {viewDate.getDate().toString().padStart(2, '0')}
                </Text>
              </View>
            </View>

            <View>
              <View className="flex-row items-center gap-3 mb-1">
                <Text className="text-white text-2xl font-bold">
                  {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <View className="bg-gunmetal px-2.5 py-1 rounded-lg border border-white/5">
                  <Text className="text-muted-silver text-[10px] font-bold uppercase tracking-wider">Week {getWeekOfMonth(viewDate)}</Text>
                </View>
              </View>
              <Text className="text-muted-silver text-sm font-medium">
                {formatWeekRange(viewDate)}
              </Text>
            </View>

            {/* Navigation Controls */}
            <View className="flex-row items-center gap-3 ml-6">
              <View className="flex-row bg-midnight-charcoal border border-gunmetal rounded-xl overflow-hidden">
                <TouchableOpacity 
                  onPress={() => {
                    const d = new Date(viewDate);
                    d.setDate(d.getDate() - 7);
                    setViewDate(d);
                  }}
                  className="p-2.5 border-r border-gunmetal hover:bg-white/5"
                >
                  <ChevronLeft size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    const d = new Date(viewDate);
                    d.setDate(d.getDate() + 7);
                    setViewDate(d);
                  }}
                  className="p-2.5 hover:bg-white/5"
                >
                  <ChevronRight size={18} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                onPress={() => setViewDate(new Date())}
                className="bg-metallic-gold px-5 py-2.5 rounded-xl"
              >
                <Text className="text-deep-black font-bold text-sm">Today</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center gap-6">
            {/* Navigation Toggles */}
            <View className="bg-midnight-charcoal/50 p-1 rounded-2xl flex-row border border-gunmetal w-64">
              {(['day', 'week', 'month'] as const).map((v) => (
                <TouchableOpacity 
                  key={v}
                  onPress={() => setActiveView(v)}
                  className={`flex-1 py-2 items-center rounded-xl border ${activeView === v ? 'bg-metallic-gold border-metallic-gold' : 'border-transparent hover:border-metallic-gold'}`}
                >
                  <Text className={`capitalize font-bold text-xs ${activeView === v ? 'text-deep-black' : 'text-muted-silver'}`}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity className="flex-row items-center gap-2 bg-midnight-charcoal border border-gunmetal px-5 py-2.5 rounded-2xl hover:border-metallic-gold/50">
               <CalendarPlus size={20} color="#D4AF37" />
               <Text className="text-white font-bold">Add Shift</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1">
          {activeView === 'day' && <DayView selectedDate={selectedDate} />}
          {activeView === 'week' && <WeekView viewDate={viewDate} />}
          {activeView === 'month' && <MonthView viewDate={viewDate} />}
        </ScrollView>
      </View>
    </View>
  );
}

function DayView({ selectedDate }: { selectedDate: string }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const activeShift = SHIFTS_MOCK.find(s => s.date === selectedDate);
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  return (
    <View className="flex-row">
      <View className="flex-1 p-10">
        <View className="flex-row">
          {/* Time Axis */}
          <View className="w-20 items-end pr-4">
            {hours.map(h => (
              <View key={h} className="h-20 justify-start">
                <Text className="text-muted-silver text-xs lowercase">
                  {h === 0 ? '12 am' : h < 12 ? `${h} am` : h === 12 ? '12 pm' : `${h - 12} pm`}
                </Text>
              </View>
            ))}
          </View>

          {/* Grid Area */}
          <View className="flex-1 relative border-l border-gunmetal">
            {hours.map(h => (
              <View key={h} className="h-20 border-b border-gunmetal/30" />
            ))}

            {/* Current Time Indicator */}
            <View 
              className="absolute left-0 right-0 h-[2px] bg-metallic-gold"
              style={{ top: (currentHour * 80) + (currentMinute / 60 * 80) }}
            >
              <View className="w-3 h-3 rounded-full bg-metallic-gold shadow-[0_0_10px_#D4AF37] absolute -left-[7px] -top-[5px]" />
            </View>

            {/* Shift Block */}
            {activeShift && activeShift.type !== 'leave' && (
               <View 
                 className="absolute left-4 right-10 rounded-xl overflow-hidden border-l-[3px] border-metallic-gold bg-gradient-to-b from-midnight-charcoal to-deep-black shadow-lg shadow-black/50"
                 style={{ 
                   top: 9 * 80, // Mock 9 AM
                   height: 9 * 80, // Mock 9 hours duration
                   padding: 20
                 }}
               >
                  <Text className="text-white text-lg font-bold">Shift: {activeShift.role || 'Work'}</Text>
                  <Text className="text-metallic-gold font-bold mt-1">{activeShift.start_time} - {activeShift.end_time}</Text>
                  <Text className="text-muted-silver mt-4 text-sm flex-row items-center gap-2">
                     {activeShift.location}
                  </Text>
               </View>
            )}

            {/* Empty State if no shift */}
            {!activeShift && (
              <View className="absolute inset-x-0 top-40 items-center">
                 <View className="w-40 h-40 opacity-40 items-center justify-center">
                    <View className="absolute inset-0 border-[1px] border-metallic-gold rounded-full opacity-20" />
                    <Clock size={64} color="#D4AF37" strokeWidth={1} />
                    {/* Subtle sun/cup illustration mock */}
                    <View className="absolute -top-4 -right-4">
                       <Plus size={24} color="#D4AF37" />
                    </View>
                 </View>
                 <Text className="text-metallic-gold text-3xl font-bold mt-8 tracking-tight">Rest Day</Text>
                 <Text className="text-muted-silver mt-3 italic text-lg">Enjoy your well-deserved break</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right Sidebar (Only in Day View) */}
      <View className="w-80 border-l border-gunmetal p-6 bg-midnight-charcoal">
        {/* Mini Month Placeholder */}
        <View className="mb-10">
          <Text className="text-muted-silver text-xs font-bold uppercase tracking-widest mb-4">Calendar</Text>
          <View className="items-center justify-center p-4 border border-gunmetal rounded-2xl border-dashed">
            <CalendarIcon color="#A0A0A0" size={32} />
            <Text className="text-muted-silver text-xs mt-2">Mini Month View</Text>
          </View>
        </View>

        {/* Who's Working Segment */}
        <View>
          <Text className="text-muted-silver text-xs font-bold uppercase tracking-widest mb-4">Who's working</Text>
          <View className="flex-row flex-wrap gap-2">
            {TEAM_MEMBERS.map(m => (
              <View key={m.id} className="w-10 h-10 rounded-full border border-metallic-gold p-0.5">
                <Image source={{ uri: m.avatar }} className="w-full h-full rounded-full" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function WeekView({ viewDate }: { viewDate: Date }) {
  const weekDates = generateWeekDates(viewDate, 0).slice(0, 7);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = formatDateISO(new Date());

  return (
    <View className="flex-1">
      {/* Week Header */}
      <View className="flex-row border-b border-gunmetal">
        <View className="w-20" />
        {weekDates.map((d) => (
          <View key={d.fullDate} className="flex-1 items-center py-4 border-l border-gunmetal">
            <Text className="text-muted-silver text-xs font-bold uppercase mb-2">{d.dayName}</Text>
            <View className={`w-10 h-10 items-center justify-center rounded-full ${d.fullDate === today ? 'bg-metallic-gold' : ''}`}>
              <Text className={`text-lg font-bold ${d.fullDate === today ? 'text-deep-black' : 'text-white'}`}>
                {d.dayNumber}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Week Grid */}
      <ScrollView>
        <View className="flex-row">
          <View className="w-20 items-end pr-4 py-2">
             {hours.map(h => (
               <View key={h} className="h-16">
                 <Text className="text-muted-silver text-[10px]">{h}:00</Text>
               </View>
             ))}
          </View>
          {weekDates.map((d) => {
            const dayShifts = SHIFTS_MOCK.filter(s => s.date === d.fullDate && s.type !== 'leave');
            return (
              <View key={d.fullDate} className="flex-1 border-l border-gunmetal/30 relative">
                {hours.map(h => (
                  <View key={h} className="h-16 border-b border-gunmetal/10" />
                ))}
                
                {/* Shift Glow and Blocks */}
                {dayShifts.map((s, idx) => (
                  <View 
                    key={s.id}
                    className={`absolute inset-x-2 rounded-lg border-l-2 border-metallic-gold bg-midnight-charcoal/80 p-2 shadow-lg ${s.status === 'Pending' ? 'border-dashed' : ''} ${s.status === 'Conflict' ? 'border-red-600' : ''}`}
                    style={{ 
                      top: 9 * 64 + (idx * 10), // Mock 9 AM start with offset for overlap
                      height: 8 * 64, // Mock 8h duration
                      zIndex: 10 + idx
                    }}
                  >
                    <Text className="text-[10px] font-bold text-white truncate">{s.role}</Text>
                    {/* Semi-transparent gold overlay for overlap (Mocking if idx > 0) */}
                    {idx > 0 && (
                      <View className="absolute inset-0 bg-metallic-gold/10 pointer-events-none" />
                    )}
                  </View>
                ))}

                {/* Shift Glow Effect */}
                {dayShifts.length > 0 && (
                  <View className="absolute inset-x-0 top-1/4 bottom-1/4 bg-metallic-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.05)] pointer-events-none" />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function MonthView({ viewDate }: { viewDate: Date }) {
  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1);
  const today = formatDateISO(new Date());

  // Fill in empty days before start of month
  const firstDayIndex = (startOfMonth.getDay() + 6) % 7; // Monday start
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => null);
  const allDays = [...paddingDays, ...daysInMonth];

  return (
    <View className="p-10 flex-row flex-wrap gap-[-1px]">
       {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
         <View key={day} className="w-[14.28%] border border-gunmetal bg-midnight-charcoal py-4 items-center">
            <Text className="text-muted-silver text-xs font-bold uppercase">{day}</Text>
         </View>
       ))}
       {allDays.map((day, idx) => {
         const d = day ? new Date(viewDate.getFullYear(), viewDate.getMonth(), day) : null;
         const dateISO = d ? formatDateISO(d) : null;
         const isToday = dateISO === today;
         const dayShifts = dateISO ? SHIFTS_MOCK.filter(s => s.date === dateISO) : [];

         return (
           <View 
            key={idx} 
            className={`w-[14.28%] h-32 border border-gunmetal p-3 ${day ? 'bg-deep-black' : 'bg-midnight-charcoal/30'}`}
           >
             {day && (
               <>
                 <View className={`w-8 h-8 items-center justify-center rounded-lg ${isToday ? 'border-2 border-metallic-gold' : ''}`}>
                   <Text className={`text-sm font-bold ${isToday ? 'text-metallic-gold' : 'text-white'}`}>{day}</Text>
                 </View>
                 
                 <View className="mt-auto flex-row flex-wrap justify-center gap-1.5 pb-2">
                    {dayShifts.map(s => {
                      if (s.type === 'shift') {
                        return (
                          <View 
                            key={s.id} 
                            className={`w-2 h-2 rounded-full ${s.status === 'Conflict' ? 'bg-red-600' : 'bg-metallic-gold'} shadow-[0_0_5px_rgba(212,175,55,0.4)]`} 
                          />
                        );
                      }
                      return (
                        <View key={s.id} className="w-8 h-1 rounded-full bg-gunmetal/80 border border-muted-silver/10 overflow-hidden">
                           <View className="absolute inset-0 bg-white/5 opacity-50" />
                        </View>
                      );
                    })}
                 </View>
               </>
             )}
           </View>
         );
       })}
    </View>
  );
}

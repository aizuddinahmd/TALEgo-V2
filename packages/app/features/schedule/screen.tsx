import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronRight, User, AlertCircle, RefreshCw, Send } from 'lucide-react-native';

// Mock Data
const SHIFTS_MOCK = [
  { id: '1', date: '2026-02-23', start_time: '09:00 AM', end_time: '05:00 PM', location: 'HQ Building - Floor 3', role: 'Front Desk', status: 'Confirmed', duration: '8h' },
  { id: '2', date: '2026-02-24', start_time: '10:00 AM', end_time: '06:00 PM', location: 'Branch Office A', role: 'Customer Support', status: 'Pending', duration: '8h' },
  { id: '3', date: '2026-02-26', start_time: '09:00 AM', end_time: '01:00 PM', location: 'HQ Building - Floor 2', role: 'Admin Assist', status: 'Cancelled', duration: '4h' },
  { id: '4', date: '2026-02-27', start_time: '09:00 AM', end_time: '05:00 PM', location: 'HQ Building - Floor 3', role: 'Front Desk', status: 'Confirmed', duration: '8h' },
];

const WEEK_DATES = [
  { dayName: 'Mon', dayNumber: '23', fullDate: '2026-02-23' },
  { dayName: 'Tue', dayNumber: '24', fullDate: '2026-02-24' },
  { dayName: 'Wed', dayNumber: '25', fullDate: '2026-02-25' },
  { dayName: 'Thu', dayNumber: '26', fullDate: '2026-02-26' },
  { dayName: 'Fri', dayNumber: '27', fullDate: '2026-02-27' },
  { dayName: 'Sat', dayNumber: '28', fullDate: '2026-02-28' },
  { dayName: 'Sun', dayNumber: '01', fullDate: '2026-03-01' },
];

const getStatusBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
    case 'cancelled':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
};

export function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState('2026-02-23');

  const filteredShifts = SHIFTS_MOCK.filter(shift => shift.date === selectedDate);
  const totalHoursThisWeek = '32h'; // Mocked aggregation

  const renderMobileShiftItem = ({ item }: { item: typeof SHIFTS_MOCK[0] }) => (
    <View className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 mb-3 flex-row items-center">
      {/* Time Column */}
      <View className="w-24 border-r border-slate-100 dark:border-zinc-800 pr-3">
        <Text className="text-slate-800 dark:text-white font-bold text-sm">{item.start_time}</Text>
        <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-1">{item.end_time}</Text>
      </View>
      
      {/* Details Column */}
      <View className="flex-1 px-3">
        <Text className="text-slate-800 dark:text-white font-bold text-base leading-tight">{item.role}</Text>
        <View className="flex-row items-center mt-1.5 gap-1 pt-0.5">
          <MapPin size={12} className="text-slate-400" />
          <Text className="text-slate-500 dark:text-zinc-400 text-xs" numberOfLines={1}>{item.location}</Text>
        </View>
        <View className="mt-2 self-start">
          <View className={`px-2 py-0.5 rounded border ${getStatusBadgeStyles(item.status)}`}>
            <Text className={`text-[10px] uppercase font-bold tracking-wider text-inherit`}>{item.status}</Text>
          </View>
        </View>
      </View>

      {/* Action / Chevron */}
      <TouchableOpacity className="pl-2 py-2 items-center justify-center">
        <ChevronRight size={20} className="text-slate-400" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#111111]">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <View className="flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <View>
            <Text className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-2">My Schedule</Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/50 flex-row items-center gap-1.5">
                <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                <Text className="text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">Total this week: {totalHoursThisWeek}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <TouchableOpacity className="flex-1 md:flex-none border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-4 py-3 flex-row items-center justify-center gap-2 shadow-sm">
              <RefreshCw size={16} className="text-slate-600 dark:text-zinc-300" />
              <Text className="text-slate-700 dark:text-zinc-200 font-bold text-sm">Swap</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 md:flex-none bg-blue-600 dark:bg-blue-500 rounded-lg px-5 py-3 flex-row items-center justify-center gap-2 shadow-sm active:bg-blue-700">
              <Send size={16} color="white" />
              <Text className="text-white font-bold text-sm">Apply for Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selector Row */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-slate-800 dark:text-white mb-3">Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-2">
            {WEEK_DATES.map((dateObj) => {
              const isSelected = selectedDate === dateObj.fullDate;
              return (
                <TouchableOpacity
                  key={dateObj.fullDate}
                  onPress={() => setSelectedDate(dateObj.fullDate)}
                  className={`items-center justify-center rounded-xl py-3 px-4 min-w-[70px] border shadow-sm ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 dark:bg-blue-600 dark:border-blue-500'
                      : 'bg-white border-slate-200 dark:bg-zinc-900 dark:border-zinc-800'
                  }`}
                >
                  <Text className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-zinc-400'}`}>
                    {dateObj.dayName}
                  </Text>
                  <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                    {dateObj.dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* View Calendar Button (For Web or extended mobile) */}
            <TouchableOpacity className="items-center justify-center rounded-xl py-3 px-4 min-w-[70px] bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 ml-2 shadow-sm">
              <CalendarIcon size={20} className="text-slate-500 dark:text-zinc-400 mb-1" />
              <Text className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Picker</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content Area - Shift Feed */}
        <View className="flex-1">
          <Text className="text-sm font-bold text-slate-800 dark:text-white mb-3">Shifts for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}</Text>
          
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
              {/* Mobile View: Vertical List (Hidden on md and larger) */}
              <View className="flex md:hidden">
                {/* Normally we'd use FlatList here but sticking to map inside ScrollView since we are already inside a main ScrollView, alternatively wrap properly. Using standard map for reliable Next.js interop inside ScrollView */}
                {filteredShifts.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderMobileShiftItem({ item })}
                  </React.Fragment>
                ))}
              </View>

              {/* Web / Desktop View: Data Table (Hidden on small screens) */}
              <View className="hidden md:flex bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="min-w-[800px] w-full">
                    {/* Table Header */}
                    <View className="flex-row items-center border-b border-slate-200 dark:border-white/5 px-4 py-3 bg-slate-50 dark:bg-[#222222] w-full">
                      <View className="flex-[1.5]"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date & Time</Text></View>
                      <View className="w-24"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Duration</Text></View>
                      <View className="flex-[2]"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Role & Location</Text></View>
                      <View className="w-32"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Status</Text></View>
                      <View className="w-32 items-center"><Text className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Actions</Text></View>
                    </View>

                    {/* Table Rows */}
                    {filteredShifts.map((item) => (
                      <View key={item.id} className="flex-row items-center border-b border-slate-100 dark:border-white/5 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        
                        {/* Date & Time */}
                        <View className="flex-[1.5]">
                          <Text className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}</Text>
                          <View className="flex-row items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            <Text className="text-sm text-slate-500 dark:text-zinc-400 font-mono">{item.start_time} - {item.end_time}</Text>
                          </View>
                        </View>

                        {/* Duration */}
                        <View className="w-24">
                          <Text className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-mono">{item.duration}</Text>
                        </View>

                        {/* Role & Location */}
                        <View className="flex-[2]">
                          <View className="flex-row items-center gap-1.5 mb-1">
                            <User size={14} className="text-slate-400" />
                            <Text className="text-sm font-bold text-slate-800 dark:text-white">{item.role}</Text>
                          </View>
                          <View className="flex-row items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400" />
                            <Text className="text-xs text-slate-500 dark:text-zinc-400">{item.location}</Text>
                          </View>
                        </View>

                        {/* Status */}
                        <View className="w-32">
                          <View className={`self-start px-2.5 py-1 rounded border ${getStatusBadgeStyles(item.status)}`}>
                            <Text className={`text-[10px] uppercase font-bold tracking-wider text-inherit`}>{item.status}</Text>
                          </View>
                        </View>

                        {/* Actions */}
                        <View className="w-32 items-center justify-center flex-row gap-2">
                          <TouchableOpacity className="bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                            <Text className="text-xs font-bold text-slate-600 dark:text-zinc-300">Swap</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
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

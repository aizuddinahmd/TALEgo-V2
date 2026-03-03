// packages/app/features/overview/employee-overview.tsx
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Bell, MapPin, Clock, Calendar, CheckCircle, AlertCircle, FileText, Activity, LogOut } from 'lucide-react-native';
import { clockIn, clockOut, getTodayAttendance } from '../../api/attendance';

export const NOTIFICATIONS = [
  { id: '1', title: 'Leave Approved', time: '10 mins ago', icon: CheckCircle, color: 'text-green-500 dark:text-green-400' },
  { id: '2', title: 'New Shift Assigned', time: '1 hour ago', icon: Calendar, color: 'text-blue-500 dark:text-blue-400' },
  { id: '3', title: 'System Maintenance', time: '2 hours ago', icon: AlertCircle, color: 'text-orange-500 dark:text-orange-400' },
];

export const STATISTICS = [
  { id: '1', label: 'Present', value: '18', icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: '2', label: 'Late', value: '2', icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: '3', label: 'Absent', value: '0', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  { id: '4', label: 'On Leave', value: '1', icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: '5', label: 'Pending Apps', value: '3', icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: '6', label: 'Productivity', value: '94%', icon: Activity, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30' },
];

export const PENDING_APPLICATIONS = [
  { id: '1', type: 'Annual Leave', date: 'Oct 12 - Oct 15', status: 'Pending Approval' },
  { id: '2', type: 'Expense Claim', date: 'Sep 28', status: 'In Review' },
];

export const SHIFT_SCHEDULE = [
  { day: 'MON', time: '9:00 - 5:00' },
  { day: 'TUE', time: '9:00 - 5:00' },
  { day: 'WED', time: '10:00 - 6:00' },
  { day: 'THU', time: '9:00 - 5:00' },
  { day: 'FRI', time: '9:00 - 5:00' },
];

export function EmployeeOverview() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<'absent' | 'active' | 'completed' | 'on_leave'>('absent');
  const [todayLog, setTodayLog] = useState<any>(null);
  const [todayShift, setTodayShift] = useState<any>(null);

  console.log('DEBUG: EmployeeOverview component scope. initialLoading:', initialLoading);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }));

  useEffect(() => {
    console.log('DEBUG: EmployeeOverview mounting effect');
    fetchStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    console.log('DEBUG: fetchStatus called');
    try {
      console.log('DEBUG: Calling getTodayAttendance...');
      const data = await getTodayAttendance();
      console.log('DEBUG: getTodayAttendance response:', data);
      setAttendanceStatus(data.status);
      setTodayLog(data.log);
      setTodayShift(data.shift);
    } catch (error: any) {
      console.error('DEBUG: Error in fetchStatus:', error);
    } finally {
      console.log('DEBUG: fetchStatus finished, setting initialLoading to false');
      setInitialLoading(false);
    }
  };

  const handleClockAction = async () => {
    setLoading(true);
    try {
      // Dummy coordinates for now: KL coordinates
      const dummyLat = 3.1390;
      const dummyLng = 101.6869;

      if (attendanceStatus === 'absent') {
        const result = await clockIn(dummyLat, dummyLng);
        Alert.alert('Success', result.message || 'Clocked in successfully');
      } else if (attendanceStatus === 'active') {
        const result = await clockOut(dummyLat, dummyLng);
        Alert.alert('Success', result.message || 'Clocked out successfully');
      }
      
      // Refresh status after action
      await fetchStatus();
    } catch (error: any) {
      console.error('Clock action error:', error);
      Alert.alert('Error', error.data?.message || error.message || 'Failed to complete action');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View className="flex-1 bg-brand-black items-center justify-center">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-brand-black">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-slate-500 dark:text-brand-gold font-medium text-lg mb-1">TALEgo Dashboard</Text>
          <Text className="text-2xl font-bold text-slate-800 dark:text-slate-50">Employee Overview</Text>
        </View>

        {/* Top Section */}
        <View className="flex-col lg:flex-row gap-4 mb-8">
          {/* Clock Card */}
          <View className="flex-1 bg-white dark:bg-brand-dark-gray rounded-xl border border-slate-200 dark:border-zinc-800/50 shadow-sm p-6">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-slate-500 dark:text-slate-400 font-medium">{currentDate}</Text>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-4xl font-bold text-slate-800 dark:text-slate-50 mt-1">{currentTime}</Text>
                </View>
                {todayLog && (
                   <Text className="text-zinc-500 text-xs mt-2">
                     {attendanceStatus === 'active' ? `In: ${new Date(todayLog.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 
                      `Work session completed`}
                   </Text>
                )}
              </View>
              <View className="w-12 h-12 bg-blue-100 dark:bg-brand-gold/20 rounded-full items-center justify-center">
                <Clock className="text-blue-600 dark:text-brand-gold" size={24} />
              </View>
            </View>
            
            <View className="flex-row items-center gap-4">
              {attendanceStatus === 'completed' ? (
                <View className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg py-4 items-center justify-center flex-row gap-2">
                   <CheckCircle color="#22C55E" size={20} />
                   <Text className="text-green-500 font-bold text-base">Shift Completed</Text>
                </View>
              ) : attendanceStatus === 'on_leave' ? (
                <View className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-lg py-4 items-center justify-center flex-row gap-2">
                   <Calendar color="#3B82F6" size={20} />
                   <Text className="text-blue-500 font-bold text-base">On Approved Leave</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  disabled={loading}
                  onPress={handleClockAction}
                  className={`flex-1 ${attendanceStatus === 'active' ? 'bg-red-500' : 'bg-blue-600 dark:bg-brand-gold'} rounded-lg py-4 flex-row items-center justify-center gap-2 active:opacity-80`}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={attendanceStatus === 'active' ? 'white' : 'black'} />
                  ) : (
                    <>
                      {attendanceStatus === 'active' ? <LogOut color="white" size={20} /> : <MapPin color="black" size={20} />}
                      <Text className={`${attendanceStatus === 'active' ? 'text-white' : 'text-black'} font-bold text-base`}>
                        {attendanceStatus === 'active' ? 'Clock Out' : 'Clock In'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Notifications Card */}
          <View className="flex-1 bg-white dark:bg-brand-dark-gray rounded-xl border border-slate-200 dark:border-zinc-800/50 shadow-sm p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-slate-800 dark:text-brand-gold">Notifications</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 dark:text-blue-400 font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-col gap-4">
              {NOTIFICATIONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <View key={item.id} className="flex-row items-start gap-3">
                    <View className="mt-0.5">
                      <IconComponent className={item.color} size={20} />
                    </View>
                    <View className="flex-1 border-b border-slate-50 dark:border-zinc-800/50 pb-3">
                      <Text className="text-slate-800 dark:text-slate-200 font-medium">{item.title}</Text>
                      <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{item.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Statistics Grid */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-slate-800 dark:text-brand-gold mb-4">Statistics</Text>
          {/* Mobile view: Horizontal ScrollView */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="md:hidden"
            contentContainerClassName="gap-4 pr-8"
          >
            {STATISTICS.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <View key={stat.id} className="w-36 bg-white dark:bg-brand-dark-gray rounded-xl border border-slate-200 dark:border-zinc-800/50 shadow-sm p-4">
                  <View className={`w-10 h-10 ${stat.bg} rounded-full items-center justify-center mb-3`}>
                    <IconComponent className={stat.color} size={20} />
                  </View>
                  <Text className="text-2xl font-bold text-slate-800 dark:text-slate-50">{stat.value}</Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">{stat.label}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Desktop view: Flex Wrapped row approximating Grid */}
          <View className="hidden md:flex md:flex-row md:flex-wrap md:gap-4 lg:gap-6">
            {STATISTICS.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <View key={stat.id} className="w-[30%] lg:w-[15%] flex-grow bg-white dark:bg-brand-dark-gray rounded-xl border border-slate-200 dark:border-zinc-800/50 shadow-sm p-4">
                  <View className={`w-10 h-10 ${stat.bg} rounded-full items-center justify-center mb-3`}>
                     <IconComponent className={stat.color} size={20} />
                  </View>
                  <Text className="text-2xl font-bold text-slate-800 dark:text-slate-50">{stat.value}</Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Lower Section */}
        <View className="flex-col lg:flex-row gap-6 mb-8">
          {/* Pending Applications */}
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-800 dark:text-brand-gold mb-4">Pending Applications</Text>
            <View className="bg-white dark:bg-brand-dark-gray rounded-xl border border-slate-200 dark:border-zinc-800/50 shadow-sm px-4 pt-4 pb-1">
              {PENDING_APPLICATIONS.map((app, index) => (
                <View key={app.id} className={`flex-row justify-between items-center pb-3 mb-3 ${index !== PENDING_APPLICATIONS.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800' : ''}`}>
                  <View>
                    <Text className="text-slate-800 dark:text-slate-200 font-medium">{app.type}</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{app.date}</Text>
                  </View>
                  <View className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full">
                    <Text className="text-slate-600 dark:text-slate-300 text-xs font-medium">{app.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Shift Schedule */}
          <View className="flex-1 lg:flex-[2]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-slate-800 dark:text-brand-gold">Shift Schedule</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 dark:text-blue-400 font-medium">View Calendar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-8 lg:pr-0">
              {SHIFT_SCHEDULE.map((shift, index) => (
                <View key={index} className="bg-white dark:bg-brand-dark-gray rounded-xl border border-slate-200 dark:border-zinc-800/50 shadow-sm p-5 min-w-[130px]">
                  <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">{shift.day}</Text>
                  <Text className="text-slate-800 dark:text-slate-50 font-bold mt-1 text-lg">{shift.time}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

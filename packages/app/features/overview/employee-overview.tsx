// packages/app/features/overview/employee-overview.tsx
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Bell, MapPin, Clock, Calendar, CheckCircle, AlertCircle, FileText, Activity, LogOut, ChevronRight } from 'lucide-react-native';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { clockIn, clockOut, getTodayAttendance } from '../../api/attendance';
import { getStaffProfile, fetchLeaveBalances } from '../../api/records';

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

export const LEAVE_BALANCES = [
  { label: 'Unpaid', value: 15, total: 20, color: '#D4AF37' },
  { label: 'PTO', value: 3, total: 10, color: '#D4AF37' },
  { label: 'Other', value: 23, total: 30, color: '#D4AF37' },
];

function CircularProgress({ size, strokeWidth, progress, color, label, value }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(139, 92, 246, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{value}</Text>
        <Text className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">Days</Text>
      </View>
    </View>
  );
}

export function EmployeeOverview() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<'absent' | 'active' | 'completed' | 'on_leave'>('absent');
  const [todayLog, setTodayLog] = useState<any>(null);
  const [todayShift, setTodayShift] = useState<any>(null);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [staffInfo, setStaffInfo] = useState<any>(null);

  console.log('DEBUG: EmployeeOverview component scope. initialLoading:', initialLoading);

  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }));
    setCurrentTime(new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }));
  }, []);

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

      // Fetch Staff Profile and Leave Balances
      const profile = await getStaffProfile();
      if (profile) {
        setStaffInfo(profile);
        const balances = await fetchLeaveBalances(profile.staff_id);
        
        // Map common leave types to our display labels if needed
        const mappedBalances = balances.map((b: any) => ({
          label: b.leave_type?.leave_name || 'Other',
          code: b.leave_type?.leave_code,
          value: b.used_days || 0,
          remaining: b.remaining_days || 0,
          total: b.total_days || 1, // Avoid division by zero
          color: '#D4AF37'
        }));

        // Try to find Unpaid, PTO, and "Other" (or just take first 3)
        const unpaid = mappedBalances.find(b => b.code?.toLowerCase().includes('unpaid')) || mappedBalances[0];
        const pto = mappedBalances.find(b => b.code?.toLowerCase().includes('annual') || b.code?.toLowerCase().includes('pto')) || mappedBalances[1];
        const other = mappedBalances.find(b => b !== unpaid && b !== pto) || mappedBalances[2];

        setLeaveBalances([unpaid, pto, other].filter(Boolean));
      }

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
    <SafeAreaView className="flex-1 bg-brand-black">
      <ScrollView className="flex-1" contentContainerClassName="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <View className="mb-6">
          {/* <Text className="text-slate-500 dark:text-brand-gold font-medium text-lg mb-1">TALEgo Dashboard</Text> */}
          <Text className="text-2xl font-bold text-brand-gold">Employee Overview</Text>
        </View>

        {/* Top Section */}
        <View className="flex-col lg:flex-row gap-4 mb-8">
          {/* Clock Card */}
          <LinearGradient
            colors={['#1c1c16', '#111111']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 12, padding: 24, flex: 1, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-slate-500 dark:text-slate-400 font-medium">{currentDate}</Text>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-4xl font-bold text-slate-50 mt-1">{currentTime}</Text>
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
          </LinearGradient>

          {/* Leave Balances Widget */}
          <View className="flex-1 bg-brand-dark-gray rounded-xl border border-zinc-800/50 shadow-sm p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-slate-50">Leave balances</Text>
              {/* <TouchableOpacity>
                <Text className="text-blue-600 dark:text-blue-400 font-medium underline">View leave balances</Text>
              </TouchableOpacity> */}
            </View>

            <View className="flex-row justify-around items-center mb-6">
              {(leaveBalances.length > 0 ? leaveBalances : LEAVE_BALANCES).map((leave, index) => (
                <View key={index} className="items-center">
                  <CircularProgress
                    size={80}
                    strokeWidth={8}
                    progress={(leave.value / leave.total) * 100}
                    color={leave.color}
                    value={leave.remaining} // Showing REMAINING days is more useful for balances
                  />
                  <Text className="text-slate-300 font-medium mt-3 text-sm">{leave.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              className="w-full bg-brand-gold rounded-xl py-4 items-center justify-center active:opacity-90 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              style={{
                shadowColor: '#D4AF37',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 10, // Some standard shadow for android
              }}
            >
              <Text className="text-brand-black font-bold text-base uppercase tracking-tight">Request leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Section Part 2 (Notifications) */}
        <View className="mb-8">
          {/* Notifications Card - Moved to full width or could stay in a row, but dashboard getting full. 
              Let's put Notifications in a row with future widgets if needed. 
              For now keeping it below the Clock/Leave row. */}
          <View className="bg-brand-dark-gray rounded-xl border border-zinc-800/50 shadow-sm p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-brand-gold">Notifications</Text>
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
                      <Text className="text-slate-200 font-medium">{item.title}</Text>
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
          <Text className="text-lg font-bold text-brand-gold mb-4">Statistics</Text>
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
                <View key={stat.id} className="w-36 bg-brand-dark-gray rounded-xl border border-zinc-800/50 shadow-sm p-4">
                  <View className={`w-10 h-10 ${stat.bg} rounded-full items-center justify-center mb-3`}>
                    <IconComponent className={stat.color} size={20} />
                  </View>
                  <Text className="text-2xl font-bold text-slate-50">{stat.value}</Text>
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
                <View key={stat.id} className="w-[30%] lg:w-[15%] flex-grow bg-brand-dark-gray rounded-xl border border-zinc-800/50 shadow-sm p-4">
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
            <Text className="text-lg font-bold text-brand-gold mb-4">Pending Applications</Text>
            <View className="bg-brand-dark-gray rounded-xl border border-zinc-800/50 shadow-sm px-4 pt-4 pb-1">
              {PENDING_APPLICATIONS.map((app, index) => (
                <View key={app.id} className={`flex-row justify-between items-center pb-3 mb-3 ${index !== PENDING_APPLICATIONS.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800' : ''}`}>
                  <View>
                    <Text className="text-slate-200 font-medium">{app.type}</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{app.date}</Text>
                  </View>
                  <View className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full">
                    <Text className="text-slate-300 text-xs font-medium">{app.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Shift Schedule */}
          <View className="flex-1 lg:flex-[2]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-brand-gold">Shift Schedule</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 dark:text-blue-400 font-medium">View Calendar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-8 lg:pr-0">
              {SHIFT_SCHEDULE.map((shift, index) => (
                <View key={index} className="bg-brand-dark-gray rounded-xl border border-zinc-800/50 shadow-sm p-5 min-w-[130px]">
                  <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">{shift.day}</Text>
                  <Text className="text-slate-50 font-bold mt-1 text-lg">{shift.time}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

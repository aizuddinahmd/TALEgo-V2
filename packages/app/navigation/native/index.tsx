import * as React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text, TouchableOpacity } from 'react-native'
import { Wallet, ShieldCheck, Scan, Compass, Radar, User, Home, Calendar } from 'lucide-react-native'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'
import { ProfileScreen } from 'app/features/user/profile-screen'
import { PayrollScreen } from 'app/features/payroll/screen'
import { SignInScreen } from 'app/features/auth/SignIn'
import { SignUpScreen } from 'app/features/auth/SignUp'
import { useTheme } from 'app/provider/theme'
import { useFab } from 'app/provider/fab'
import { FabOverlay } from '../../components/navigation/fab-overlay'
import { MotiView } from 'moti'
import { Plus } from 'lucide-react-native'

// Custom Center Button Component
function CustomTabBarButton({ children, onPress }: any) {
  const { isFabOpen, toggleFab } = useFab()

  return (
    <TouchableOpacity
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: isFabOpen ? '#0066FF' : '#D4AF37',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
      }}
      onPress={() => {
        toggleFab()
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 65,
          height: 65,
          borderRadius: 32.5,
          backgroundColor: isFabOpen ? '#ffffff' : '#D4AF37', // Brand color or white when open
          borderWidth: 4,
          borderColor: isFabOpen ? '#0066FF' : '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MotiView
          animate={{ rotate: isFabOpen ? '45deg' : '0deg' }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        >
          {isFabOpen ? (
             <Plus color="#0066FF" size={32} strokeWidth={3} />
          ) : (
             <Plus color="#000" size={32} strokeWidth={3} />
          )}
        </MotiView>
      </View>
    </TouchableOpacity>
  )
}

// Dummy screen for placeholders
function PlaceholderScreen({ route }: { route: any }) {
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0F0F0F' : '#F4F4F5' }}>
      <Text style={{ color: isDark ? '#d4d4d8' : '#3f3f46', fontSize: 18 }}>{route.name} Page Coming Soon...</Text>
    </View>
  )
}

const Tab = createBottomTabNavigator<{
  home: undefined
  schedule: undefined
  quick: undefined
  activity: undefined
  profile: undefined
}>()

const Stack = createNativeStackNavigator<{
  login: undefined
  'sign-up': undefined
  tabs: undefined
  'user-detail': { id: string }
  payroll: undefined
}>()

function TabNavigator() {
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { 
          backgroundColor: isDark ? '#0F0F0F' : '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#27272a' : '#e5e7eb',
        },
        headerTintColor: isDark ? '#fff' : '#000',
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1a1a1a' : '#e5e7eb',
          height: 85,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#D4AF37', // brand gold
        tabBarInactiveTintColor: isDark ? '#525252' : '#71717a',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: 10,
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} size={24} strokeWidth={2.5} />,
        }}
      />
      <Tab.Screen
        name="schedule"
        component={PlaceholderScreen}
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Calendar  color={color} size={24} strokeWidth={2.5} />,
        }}
      />
      <Tab.Screen
        name="quick"
        component={PlaceholderScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault()
          },
        }}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          )
        }}
      />
      <Tab.Screen
        name="activity"
        component={PlaceholderScreen}
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <Compass color={color} size={24} strokeWidth={2.5} />,
        }}
      />
      <Tab.Screen
        name="profile"
        component={PlaceholderScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} strokeWidth={2.5} />,
        }}
      />
    </Tab.Navigator>
  )
}

function FabOverlayWrapper() {
  const { isFabOpen, setFabOpen } = useFab()
  return <FabOverlay isOpen={isFabOpen} onClose={() => setFabOpen(false)} />
}

function TabNavigatorContainer() {
  return (
    <View className="flex-1">
      <TabNavigator />
      <FabOverlayWrapper />
    </View>
  )
}

export function NativeNavigation() {
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="login" component={SignInScreen} />
      <Stack.Screen name="sign-up" component={SignUpScreen} />
      <Stack.Screen name="tabs" component={TabNavigatorContainer} />
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
        options={{
          headerShown: true,
          title: 'User',
          headerStyle: { backgroundColor: isDark ? '#18181b' : '#ffffff' },
          headerTintColor: isDark ? '#fff' : '#000',
        }}
      />
      <Stack.Screen
        name="payroll"
        component={PayrollScreen}
        options={{
          headerShown: true,
          title: 'Payroll',
          headerStyle: { backgroundColor: isDark ? '#18181b' : '#ffffff' },
          headerTintColor: isDark ? '#fff' : '#000',
        }}
      />
    </Stack.Navigator>
  )
}


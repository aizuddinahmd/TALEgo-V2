import * as React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text } from 'react-native'
import { Home, FileText, Zap, Inbox, User } from 'lucide-react-native'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'
import { PayrollScreen } from 'app/features/payroll/screen'
import { SignInScreen } from 'app/features/auth/SignIn'
import { SignUpScreen } from 'app/features/auth/SignUp'
import { useTheme } from 'app/provider/theme'

// Dummy screen for placeholders
function PlaceholderScreen({ route }: { route: any }) {
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#18181b' : '#f4f4f5' }}>
      <Text style={{ color: isDark ? '#d4d4d8' : '#3f3f46', fontSize: 18 }}>{route.name} Page Coming Soon...</Text>
    </View>
  )
}

const Tab = createBottomTabNavigator<{
  home: undefined
  record: undefined
  quick: undefined
  inbox: undefined
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
        headerStyle: { backgroundColor: isDark ? '#18181b' : '#ffffff' },
        headerTintColor: isDark ? '#fff' : '#000',
        tabBarStyle: {
          backgroundColor: isDark ? '#09090b' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#27272a' : '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#d97706', // brand gold
        tabBarInactiveTintColor: isDark ? '#a1a1aa' : '#71717a',
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="record"
        component={PlaceholderScreen}
        options={{
          title: 'My Record',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="quick"
        component={PlaceholderScreen}
        options={{
          title: 'Quick Action',
          tabBarIcon: ({ color, size }) => <Zap color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="inbox"
        component={PlaceholderScreen}
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} />,
          tabBarBadge: 3,
        }}
      />
      <Tab.Screen
        name="profile"
        component={PlaceholderScreen}
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

export function NativeNavigation() {
  const { colorMode } = useTheme()
  const isDark = colorMode === 'dark'

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="login" component={SignInScreen} />
      <Stack.Screen name="sign-up" component={SignUpScreen} />
      <Stack.Screen name="tabs" component={TabNavigator} />
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


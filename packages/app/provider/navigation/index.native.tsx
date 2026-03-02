import { NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useMemo } from 'react'

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationContainer
      linking={useMemo(
        () => ({
          prefixes: [Linking.createURL('/')],
          config: {
            initialRouteName: 'login' as any,
            screens: {
              login: 'login',
              'sign-up': 'sign-up',
              tabs: {
                path: '',
                screens: {
                  home: '',
                },
              },
              'user-detail': 'users/:id',
              payroll: 'payroll',
            },
          },
        }),
        []
      )}
    >
      {children}
    </NavigationContainer>
  )
}

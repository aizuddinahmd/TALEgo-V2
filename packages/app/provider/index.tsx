'use client';

import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation'
import { ThemeProvider } from './theme'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SafeArea>
      <ThemeProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </ThemeProvider>
    </SafeArea>
  )
}

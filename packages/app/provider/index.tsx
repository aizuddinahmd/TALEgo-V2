'use client';

import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation'
import { ThemeProvider } from './theme'
import { FabProvider } from './fab'
import '../design/tailwind/interop'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SafeArea>
      <ThemeProvider>
        <FabProvider>
          <NavigationProvider>{children}</NavigationProvider>
        </FabProvider>
      </ThemeProvider>
    </SafeArea>
  )
}

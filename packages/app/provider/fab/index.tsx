import React, { createContext, useContext, useState } from 'react'

interface FabContextType {
  isFabOpen: boolean
  setFabOpen: (open: boolean) => void
  toggleFab: () => void
}

const FabContext = createContext<FabContextType | undefined>(undefined)

export function FabProvider({ children }: { children: React.ReactNode }) {
  const [isFabOpen, setFabOpen] = useState(false)

  const toggleFab = () => setFabOpen((prev) => !prev)

  return (
    <FabContext.Provider value={{ isFabOpen, setFabOpen, toggleFab }}>
      {children}
    </FabContext.Provider>
  )
}

export function useFab() {
  const context = useContext(FabContext)
  if (context === undefined) {
    throw new Error('useFab must be used within a FabProvider')
  }
  return context
}

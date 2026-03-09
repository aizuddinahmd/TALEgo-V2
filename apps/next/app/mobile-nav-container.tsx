'use client'

import React from 'react'
import { MobileTabBar } from 'app/components/navigation/mobile-tab-bar.web'
import { FabOverlay } from 'app/components/navigation/fab-overlay'
import { useFab } from 'app/provider/fab'

export function MobileNavContainer() {
  const { isFabOpen, setFabOpen } = useFab()

  return (
    <>
      <MobileTabBar />
      <FabOverlay isOpen={isFabOpen} onClose={() => setFabOpen(false)} />
    </>
  )
}

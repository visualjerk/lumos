'use client'
import React from 'react'
import InvestigatorOverview from '@/investigator/investigator-overview'
import SkillCheckOverlay from '@/skill-check/skill-check-overlay'
import { LocationMap } from './location/location-map'
import Artwork from './shared/artwork'

export default function GameUI() {
  return (
    <div className="h-screen flex flex-col bg-stone-400 overflow-hidden">
      <Artwork
        id="bg-table"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="flex-grow grid place-items-center">
        <LocationMap />
      </div>
      <div className="relative">
        <InvestigatorOverview />
      </div>
      <SkillCheckOverlay />
    </div>
  )
}

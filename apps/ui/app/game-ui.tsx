'use client'
import React from 'react'
import InvestigatorOverview from '@/investigator/investigator-overview'
import SkillCheckOverlay from '@/skill-check/skill-check-overlay'
import { LocationMap } from './location/location-map'

export default function GameUI() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow grid place-items-center">
        <LocationMap />
      </div>
      <InvestigatorOverview />
      <SkillCheckOverlay />
    </div>
  )
}

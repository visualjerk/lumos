'use client'
import GameUI from '@/game-ui'
import {
  BearStrength,
  ForceOfWill,
  Investigator,
  LightningStrike,
  Scry,
  Serenity,
} from '@lumos/game'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { useInitialGame } from './game/use-initial-game'
import { GameProvider } from './game/use-game'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

const investigator: Investigator = {
  id: 'isabel-brimble',
  name: 'Isabel Brimble',
  baseSkills: {
    intelligence: 4,
    strength: 5,
    agility: 3,
  },
  health: 8,
  baseDeck: [
    Scry.id,
    Scry.id,
    Scry.id,
    ForceOfWill.id,
    ForceOfWill.id,
    ForceOfWill.id,
    LightningStrike.id,
    LightningStrike.id,
    LightningStrike.id,
    BearStrength.id,
    BearStrength.id,
    BearStrength.id,
    Serenity.id,
    Serenity.id,
    Serenity.id,
  ],
}

const secondInvestigator: Investigator = {
  id: 'brandon-vuncio',
  name: 'Brandon Vuncio',
  baseSkills: {
    intelligence: 3,
    strength: 4,
    agility: 5,
  },
  health: 8,
  baseDeck: [
    Scry.id,
    Scry.id,
    Scry.id,
    ForceOfWill.id,
    ForceOfWill.id,
    ForceOfWill.id,
    LightningStrike.id,
    LightningStrike.id,
    LightningStrike.id,
    BearStrength.id,
    BearStrength.id,
    BearStrength.id,
    Serenity.id,
    Serenity.id,
    Serenity.id,
  ],
}

const investigators = [investigator, secondInvestigator]

export default function Home() {
  const [controllerId, setControllerId] = useState(investigator.id)

  const game = useInitialGame(
    MisteryOfTheHogwartsExpress,
    [investigator, secondInvestigator],
    controllerId
  )

  return (
    <main>
      <GameProvider game={game}>
        <div className="grid h-screen">
          <GameUI />
          <div className="flex gap-4 p-4 relative z-50 bg-stone-900">
            <Select
              onValueChange={(value) => setControllerId(value)}
              value={controllerId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select investigator" />
              </SelectTrigger>
              <SelectContent>
                {investigators.map(({ id, name }) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GameProvider>
    </main>
  )
}

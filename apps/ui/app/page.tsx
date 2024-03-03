'use client'
import GameUI from '@/game-ui'
import {
  Investigator,
  ForceOfWill,
  LightningStrike,
  BearStrength,
  Serenity,
} from '@lumos/game'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { useInitialGame } from './game/use-initial-game'
import { GameProvider } from './game/use-game'

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
    ForceOfWill.id,
    ForceOfWill.id,
    LightningStrike.id,
    LightningStrike.id,
    BearStrength.id,
    BearStrength.id,
    Serenity.id,
    Serenity.id,
  ],
}

export default function Home() {
  const game = useInitialGame(MisteryOfTheHogwartsExpress, [investigator])

  return (
    <main>
      <GameProvider game={game}>
        <GameUI />
      </GameProvider>
    </main>
  )
}

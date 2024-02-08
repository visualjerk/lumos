import {
  LocationStates,
  LocationId,
  LocationCard,
  createInitialLocationStates,
} from './location'
import {
  Investigator,
  InvestigatorCard,
  InvestigatorCardId,
  InvestigatorId,
  InvestigatorState,
  InvestigatorStates,
  Skills,
  createInitialInvestigatorStates,
  getInvestigatorCard,
} from './investigator'
import { Scenario } from './scenario'
import { DoomCard, DoomCardId, DoomState } from './doom'
import { SceneCard, SceneState } from './scene'
import {
  EncounterCardId,
  EncounterState,
  createInitialEncounterState,
} from './encounter'
import {
  EnemyCard,
  EnemyState,
  EnemyStates,
  createInitialEnemyStates,
} from './enemy'

export function createInitialContext(
  scenario: Scenario,
  investigators: Investigator[]
): Context {
  const encounterState = createInitialEncounterState(
    scenario.encounterCards.map(({ id }) => id)
  )
  const enemyStates = createInitialEnemyStates()
  const locationStates = createInitialLocationStates(
    scenario.locationCards,
    scenario.startLocation
  )
  const investigatorStates = createInitialInvestigatorStates(
    investigators,
    scenario.startLocation
  )

  return new Context(
    scenario,
    { doom: 0, doomCardId: scenario.doomCards[0].id },
    { sceneCardId: scenario.sceneCards[0].id },
    encounterState,
    enemyStates,
    locationStates,
    investigators,
    investigatorStates
  )
}

export class Context {
  constructor(
    public scenario: Scenario,
    public doomState: DoomState,
    public sceneState: SceneState,
    public encounterState: EncounterState,
    public enemyStates: EnemyStates,
    public locationStates: LocationStates,
    public investigators: Investigator[],
    public investigatorStates: InvestigatorStates
  ) {}

  getDoomCard(): DoomCard {
    return this.scenario.doomCards.find(
      (card) => card.id === this.doomState.doomCardId
    )!
  }

  getNextDoomCardId(): DoomCardId | undefined {
    return this.getDoomCard().nextDoomCardId
  }

  getSceneCard(): SceneCard {
    return this.scenario.sceneCards.find(
      (card) => card.id === this.sceneState.sceneCardId
    )!
  }

  getTotalInvestigatorClues(): number {
    let totalClues = 0
    this.investigatorStates.forEach(({ clues }) => {
      totalClues += clues
    })
    return totalClues
  }

  getNextSceneCardId(): string | undefined {
    return this.getSceneCard().nextSceneCardId
  }

  getLocationInvestigators(locationId: LocationId): Investigator[] {
    const investigators: Investigator[] = []
    this.investigatorStates.forEach((investigatorState, investigatorId) => {
      if (investigatorState.currentLocation !== locationId) {
        return
      }
      investigators.push(this.getInvestigator(investigatorId)!)
    })

    return investigators
  }

  getInvestigator(investigatorId: InvestigatorId) {
    return this.investigators.find(
      (investigator) => investigator.id === investigatorId
    )!
  }

  getEncounterCard(encounterCardId: string) {
    return this.scenario.encounterCards.find(
      (card) => card.id === encounterCardId
    )!
  }

  getLocationEnemies(locationId: LocationId): EnemyState[] {
    return this.enemyStates.filter((enemy) => enemy.location === locationId)
  }

  getEnemyCard(cardId: EncounterCardId): EnemyCard {
    // TODO: Ensure this is really an enemy card
    return this.scenario.encounterCards.find(
      (card) => card.id === cardId
    )! as EnemyCard
  }

  moveInvestigator(
    investigatorId: InvestigatorId,
    locationId: LocationId
  ): Context {
    const investigatorState = this.investigatorStates.get(investigatorId)
    const locationState = this.locationStates.get(locationId)

    if (!investigatorState) {
      throw new Error('Investigator not found')
    }

    if (!locationState) {
      throw new Error('Location not found')
    }

    investigatorState.currentLocation = locationId
    locationState.revealed = true

    return this
  }

  getLocation(locationId: LocationId): LocationCard {
    return this.scenario.locationCards.find(
      (location) => location.id === locationId
    )!
  }

  getInvestigatorLocation(investigatorId: InvestigatorId): LocationCard {
    const investigator = this.investigatorStates.get(investigatorId)

    if (!investigator) {
      throw new Error('Investigator not found')
    }

    const location = this.getLocation(investigator.currentLocation)

    if (!location) {
      throw new Error('Location not found')
    }

    return location
  }

  collectClue(investigatorId: InvestigatorId, locationId: LocationId): Context {
    const investigator = this.investigatorStates.get(investigatorId)
    const location = this.locationStates.get(locationId)

    if (!investigator) {
      throw new Error('Investigator not found')
    }

    if (!location) {
      throw new Error('Location not found')
    }

    if (!location.revealed) {
      throw new Error('Location not revealed')
    }

    if (location.clues === 0) {
      return this
    }

    location.clues--
    investigator.clues++

    return this
  }

  getInvestigatorState(investigatorId: InvestigatorId): InvestigatorState {
    const investigator = this.investigatorStates.get(investigatorId)
    if (!investigator) {
      throw new Error('Investigator not found')
    }
    return investigator
  }

  getInvestigatorCard(cardId: InvestigatorCardId): InvestigatorCard {
    return getInvestigatorCard(cardId)
  }

  getInvestigatorSkills(investigatorId: InvestigatorId): Skills {
    const investigator = this.getInvestigator(investigatorId)
    const cards = this.getInvestigatorState(investigatorId).getCardsInPlay()

    const skills = { ...investigator.baseSkills }
    Object.keys(skills).forEach((skill) => {
      cards.forEach((card) => {
        if (card.type === 'permanent') {
          skills[skill as keyof Skills] +=
            card.permanentSkillModifier[skill as keyof Skills] ?? 0
        }
      })
    })

    return skills
  }
}

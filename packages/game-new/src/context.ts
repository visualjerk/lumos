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
import { DoomState, createInitialDoomState } from './doom'

export function createInitialContext(
  scenario: Scenario,
  investigators: Investigator[]
): Context {
  const locationStates = createInitialLocationStates(
    scenario.locationCards,
    scenario.startLocation
  )
  const investigatorStates = createInitialInvestigatorStates(
    investigators,
    scenario.startLocation
  )

  const doomState = createInitialDoomState(scenario.doomCards)

  return new Context(
    scenario,
    locationStates,
    investigators,
    investigatorStates,
    doomState
  )
}

export class Context {
  constructor(
    public readonly scenario: Scenario,
    public readonly locationStates: LocationStates,
    public readonly investigators: Investigator[],
    public readonly investigatorStates: InvestigatorStates,
    public readonly doomState: DoomState
  ) {}

  getTotalInvestigatorClues(): number {
    let totalClues = 0
    this.investigatorStates.forEach(({ clues }) => {
      totalClues += clues
    })
    return totalClues
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

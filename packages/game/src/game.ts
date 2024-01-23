import { Investigator } from './investigator'
import { Location, isConnected } from './location'

export type InvestigatorState = {
  investigator: Investigator
  location: Location
  currentHealth: number
}

export class Game {
  locations: Location[] = []
  investigators: Investigator[] = []
  investigatorStates: InvestigatorState[] = []

  addLocation(location: Location) {
    this.locations.push(location)
  }

  addInvestigator(investigator: Investigator, initialLocation: Location) {
    this.investigators.push(investigator)
    this.investigatorStates.push({
      investigator,
      location: initialLocation,
      currentHealth: investigator.health,
    })
  }

  moveInvestigator(investigator: Investigator, location: Location) {
    const investigatorState = this.getInvestigatorState(investigator)

    if (!isConnected(investigatorState.location, location)) {
      throw new Error('Locations are not connected')
    }

    investigatorState.location = location
  }

  private getInvestigatorState(investigator: Investigator): InvestigatorState {
    const investigatorState = this.investigatorStates.find(
      (state) => state.investigator === investigator
    )

    if (!investigatorState) {
      throw new Error('Investigator not found')
    }

    return investigatorState
  }
}

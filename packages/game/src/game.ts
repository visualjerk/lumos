import { Investigator } from './investigator'
import { Layout, Position } from './layout'
import { Location, LocationId, isConnected } from './location'

export type InvestigatorState = {
  investigator: Investigator
  locationId: LocationId
  currentHealth: number
}

export class Game {
  locations: Map<LocationId, Location> = new Map()
  layout: Layout = []
  investigators: Investigator[] = []
  investigatorStates: InvestigatorState[] = []

  addLocation(location: Location, position: Position) {
    this.locations.set(location.id, location)
    this.layout.push([location.id, position])
  }

  getLocation(id: LocationId): Location {
    const location = this.locations.get(id)

    if (!location) {
      throw new Error('Location not found')
    }

    return location
  }

  getInvestigatorAtLocation(locationId: LocationId): Investigator | null {
    const investigatorState = this.investigatorStates.find(
      (state) => state.locationId === locationId
    )

    if (!investigatorState) {
      return null
    }

    return investigatorState.investigator
  }

  addInvestigator(investigator: Investigator, initialLocation: Location) {
    this.investigators.push(investigator)
    this.investigatorStates.push({
      investigator,
      locationId: initialLocation.id,
      currentHealth: investigator.health,
    })
  }

  moveInvestigator(investigator: Investigator, location: Location) {
    const investigatorState = this.getInvestigatorState(investigator)
    const currentLocation = this.getLocation(investigatorState.locationId)

    if (!isConnected(currentLocation, location)) {
      throw new Error('Locations are not connected')
    }

    investigatorState.locationId = location.id
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

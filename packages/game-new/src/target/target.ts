import { InvestigatorId, LocationId } from '@lumos/game'

export type InvestigatorTarget = {
  type: 'investigator'
  scope: 'self'
}

export type InvestigatorTargetResult = {
  investigatorId: InvestigatorId
}

export type LocationTarget = {
  type: 'location'
  scope: 'current'
}

export type LocationTargetResult = {
  locationId: LocationId
}

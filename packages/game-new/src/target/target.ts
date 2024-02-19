import { InvestigatorId } from '@lumos/game'

export type InvestigatorTargetScope = 'self'

export type InvestigatorTarget = {
  type: 'investigator'
  scope: InvestigatorTargetScope
}

export type InvestigatorTargetResult = {
  investigatorId: InvestigatorId
}

import { Context } from '../context'

export type EncounterCardId = string

export type EncounterCard = {
  id: EncounterCardId
  name: string
  effect: {
    apply: (context: Context) => Context
  }
}

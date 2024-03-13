import { Investigator, InvestigatorId } from './investigator'
import {
  BearStrength,
  ForceOfWill,
  LightningStrike,
  Scry,
  Serenity,
} from './investigator-card-collection'

export const IsabelBrimble: Investigator = {
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

export const BrandonVuncio: Investigator = {
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

export const InvestigatorCollection = new Map<InvestigatorId, Investigator>(
  [IsabelBrimble, BrandonVuncio].map((i) => [i.id, i])
)

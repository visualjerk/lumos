import {
  Context,
  discardFromHand,
  getInvestigatorCardsInHand,
  getInvestigatorSkills,
} from './context'
import { Fate, spinFateWheel } from './fate'
import { InvestigatorId, Skills } from './investigator'
import { LocationId } from './location'
import { CreatePhase, Phase, PhaseAction } from './phase'

export type SkillCheck = {
  skill: keyof Skills
  difficulty: number
  onSuccess: Effect
  onFailure: Effect
}

export type Effect = {
  apply: (context: Context) => Context
}

export type SkillCheckContext = {
  locationId: LocationId
  investigatorId: InvestigatorId
  check: SkillCheck
  nextPhase: (context: Context) => Phase
  // TODO: replace with cards
  skillModifier: number
}

export type CommitSkillCheckContext = SkillCheckContext & {
  fate: Fate
  totalSkill: number
  // TODO: Remove this
  difficulty: number
}

export type SkillCheckPhase = CreatePhase<'skillCheck'> & {
  skillCheckContext: SkillCheckContext
}

export function createSkillCheckPhase(
  context: Context,
  skillCheckContext: SkillCheckContext
): SkillCheckPhase {
  const actions: PhaseAction[] = []

  const { investigatorId } = skillCheckContext

  actions.push({
    type: 'commitSkillCheck',
    investigatorId,
    execute: () => {
      const fate = spinFateWheel(context.scenario.fateWheel)

      const skills = getInvestigatorSkills(context, investigatorId)
      const totalSkill = fate.modifySkillCheck(
        skills[skillCheckContext.check.skill] + skillCheckContext.skillModifier
      )

      return createCommitSkillCheckPhase(context, {
        ...skillCheckContext,
        fate,
        totalSkill,
        difficulty: skillCheckContext.check.difficulty,
      })
    },
  })

  const cardsInHand = getInvestigatorCardsInHand(context, investigatorId)
  cardsInHand.forEach((card, index) => {
    actions.push({
      type: 'addToSkillCheck',
      investigatorId: investigatorId,
      handCardIndex: index,
      execute: () => {
        const skillModifier =
          card.skillModifier[skillCheckContext.check.skill] ?? 0
        skillCheckContext.skillModifier += skillModifier

        discardFromHand(context, investigatorId, index)

        return createSkillCheckPhase(context, skillCheckContext)
      },
    })
  })

  return {
    type: 'skillCheck',
    actions,
    context,
    skillCheckContext,
  }
}

export type CommitSkillCheckPhase = CreatePhase<'commitSkillCheck'> & {
  skillCheckContext: CommitSkillCheckContext
}

export function createCommitSkillCheckPhase(
  context: Context,
  skillCheckContext: CommitSkillCheckContext
): CommitSkillCheckPhase {
  const actions: PhaseAction[] = []

  const { check, investigatorId, totalSkill } = skillCheckContext

  actions.push({
    type: 'endSkillCheck',
    investigatorId,
    execute: () => {
      const effect =
        totalSkill < check.difficulty ? check.onFailure : check.onSuccess
      return skillCheckContext.nextPhase(effect.apply(context))
    },
  })

  return {
    type: 'commitSkillCheck',
    actions,
    context,
    skillCheckContext,
  }
}

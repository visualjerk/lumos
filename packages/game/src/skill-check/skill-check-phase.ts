import { Context } from '../context'
import { Fate, spinFateWheel } from '../fate'
import { InvestigatorCardId, InvestigatorId } from '../investigator'
import { LocationId } from '../location'
import { CreatePhase, Phase, PhaseAction } from '../phase'
import { SkillCheck } from './skill-check'

export type SkillCheckContext = {
  locationId: LocationId
  investigatorId: InvestigatorId
  check: SkillCheck
  nextPhase: (context: Context) => Phase
  addedCards: InvestigatorCardId[]
  skillModifier: number
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
  const investigatorState = context.getInvestigatorState(investigatorId)

  actions.push({
    type: 'commitSkillCheck',
    investigatorId,
    execute: () => {
      const fate = spinFateWheel(context.scenario.fateWheel)

      const skills = context.getInvestigatorSkills(investigatorId)
      const totalSkill = fate.modifySkillCheck(
        skills[skillCheckContext.check.skill] + skillCheckContext.skillModifier
      )

      return createCommitSkillCheckPhase(context, {
        ...skillCheckContext,
        fate,
        totalSkill,
      })
    },
  })

  const cardsInHand = investigatorState.getCardsInHand()
  cardsInHand.forEach((card, index) => {
    const skillModifier = card.skillModifier[skillCheckContext.check.skill]

    if (skillModifier !== undefined) {
      actions.push({
        type: 'addToSkillCheck',
        investigatorId: investigatorId,
        handCardIndex: index,
        execute: () => {
          skillCheckContext.skillModifier += skillModifier
          skillCheckContext.addedCards.push(card.id)

          investigatorState.removeFromHand(index)

          return createSkillCheckPhase(context, skillCheckContext)
        },
      })
    }
  })

  return {
    type: 'skillCheck',
    actions,
    context,
    skillCheckContext,
  }
}

export type CommitSkillCheckContext = SkillCheckContext & {
  fate: Fate
  totalSkill: number
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
  const investigatorState = context.getInvestigatorState(investigatorId)

  actions.push({
    type: 'endSkillCheck',
    investigatorId,
    execute: () => {
      skillCheckContext.addedCards.forEach((cardId) => {
        investigatorState.addToDiscardPile(cardId)
      })

      const effect =
        totalSkill < check.difficulty ? check.onFailure : check.onSuccess

      return skillCheckContext.nextPhase(
        effect.apply(context, { investigatorId })
      )
    },
  })

  return {
    type: 'commitSkillCheck',
    actions,
    context,
    skillCheckContext,
  }
}

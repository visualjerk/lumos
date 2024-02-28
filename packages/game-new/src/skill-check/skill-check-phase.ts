import { Context } from '../context'
import { PhaseAction, PhaseBase } from '../phase'
import { SkillCheck, SkillCheckContext } from './skill-check'
import { Fate, spinFateWheel } from '../fate'
import { InvestigatorState } from '../investigator'
import { createActionPhase } from '../action'

export function createSkillCheckPhase(
  context: Context,
  check: SkillCheck
): SkillCheckPhase {
  return new SkillCheckPhase(context, {
    check,
    skillModifier: 0,
    addedCards: [],
  })
}

export class SkillCheckPhase implements PhaseBase {
  type = 'skillCheck'

  constructor(
    public context: Context,
    public skillCheckContext: SkillCheckContext
  ) {}

  get actions() {
    const actions: PhaseAction[] = []

    const { skillCheckContext, context } = this
    const { check } = skillCheckContext
    const { investigatorId } = check

    actions.push({
      type: 'commitSkillCheck',
      investigatorId,
      execute: (coordinator) =>
        coordinator
          .waitFor(createCommitSkillCheckPhase(context, skillCheckContext))
          .toParent(),
    })

    actions.push(...this.cardActions)

    return actions
  }

  private get check(): SkillCheck {
    return this.skillCheckContext.check
  }

  private get investigatorState(): InvestigatorState {
    return this.context.getInvestigatorState(this.check.investigatorId)
  }

  private get cardActions(): PhaseAction[] {
    const actions: PhaseAction[] = []

    const cardsInHand = this.investigatorState.getCardsInHand()
    cardsInHand.forEach((card, index) => {
      const skillModifier = card.skillModifier[this.check.skill]

      if (skillModifier !== undefined) {
        actions.push({
          type: 'addToSkillCheck',
          investigatorId: this.check.investigatorId,
          cardIndex: index,
          execute: () => {
            this.skillCheckContext.skillModifier += skillModifier
            this.skillCheckContext.addedCards.push(card.id)
            this.investigatorState.removeFromHand(index)
          },
        })
      }
    })
    return actions
  }
}

function createCommitSkillCheckPhase(
  context: Context,
  skillCheckContext: SkillCheckContext
): CommitSkillCheckPhase {
  return new CommitSkillCheckPhase(context, skillCheckContext)
}

export class CommitSkillCheckPhase implements PhaseBase {
  type = 'commitSkillCheck'
  fate: Fate

  constructor(
    public context: Context,
    public skillCheckContext: SkillCheckContext
  ) {
    this.fate = spinFateWheel(context.scenario.fateWheel)
  }

  public get totalSkill() {
    const { check, skillModifier } = this.skillCheckContext
    const { investigatorId, skill } = check
    const skills = this.context.getInvestigatorSkills(investigatorId)

    return this.fate.modifySkillCheck(skills[skill] + skillModifier)
  }

  get actions() {
    const actions: PhaseAction[] = []

    const { check } = this.skillCheckContext
    const { investigatorId, difficulty, onSuccess, onFailure } = check

    actions.push({
      type: 'endSkillCheck',
      investigatorId,
      execute: (coordinator) => {
        const action = difficulty <= this.totalSkill ? onSuccess : onFailure

        if (!action) {
          coordinator
            .apply(() => {
              this.cleanupAddedCards()
            })
            .toParent()
          return
        }

        coordinator
          .apply(() => {
            this.cleanupAddedCards()
          })
          .waitFor(createActionPhase(this.context, investigatorId, action))
          .toParent()
      },
    })

    return actions
  }

  private cleanupAddedCards() {
    this.skillCheckContext.addedCards.forEach((cardId) => {
      this.context
        .getInvestigatorState(this.skillCheckContext.check.investigatorId)
        .addToDiscardPile(cardId)
    })
  }
}

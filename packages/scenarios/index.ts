import { Scenario, ScenarioId } from '@lumos/game'
import { MisteryOfTheHogwartsExpress } from './mystery-of-the-hogwarts-express'

export const ScenarioCollection = new Map<ScenarioId, Scenario>(
  [MisteryOfTheHogwartsExpress].map((scenario) => [scenario.id, scenario])
)

export { MisteryOfTheHogwartsExpress }

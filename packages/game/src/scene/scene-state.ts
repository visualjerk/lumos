import { SceneCard, SceneCardId } from './scene-card'

export function createInitialSceneState(sceneCards: SceneCard[]): SceneState {
  return new SceneState(sceneCards[0].id, sceneCards)
}

export class SceneState {
  constructor(
    private _sceneCardId: SceneCardId,
    private _sceneCards: SceneCard[]
  ) {}

  get sceneCard(): SceneCard {
    return this._sceneCards.find(
      (sceneCard) => sceneCard.id === this._sceneCardId
    )!
  }

  satisfiesThreshold(clues: number): boolean {
    return this.sceneCard.clueTreshold <= clues
  }

  get hasNextSceneCard(): boolean {
    return this.sceneCard.nextSceneCardId !== undefined
  }

  advanceSceneCards() {
    if (this.sceneCard.nextSceneCardId) {
      this._sceneCardId = this.sceneCard.nextSceneCardId
    }
  }
}

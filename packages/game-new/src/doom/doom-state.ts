import { DoomCard, DoomCardId } from './doom-card'

export function createInitialDoomState(doomCards: DoomCard[]): DoomState {
  return new DoomState(0, doomCards[0].id, doomCards)
}

export class DoomState {
  constructor(
    private _doom: number,
    private _doomCardId: DoomCardId,
    private readonly doomCards: DoomCard[]
  ) {}

  get doom() {
    return this._doom
  }

  increaseDoom() {
    this._doom++
  }

  get doomCard(): DoomCard {
    return this.doomCards.find((card) => card.id === this._doomCardId)!
  }

  get hasReachedThreshold(): boolean {
    return this.doomCard!.treshold <= this.doom
  }

  get hasNextDoomCard(): boolean {
    return this.doomCard?.nextDoomCardId !== undefined
  }

  advanceDoomCards() {
    if (this.doomCard?.nextDoomCardId) {
      this._doomCardId = this.doomCard.nextDoomCardId
      this._doom = 0
    }
  }
}

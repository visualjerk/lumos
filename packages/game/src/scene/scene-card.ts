export type SceneCardId = string

export type SceneCard = {
  id: SceneCardId
  name: string
  story: string
  clueTreshold: number
  consequence: string
  nextSceneCardId?: SceneCardId
}

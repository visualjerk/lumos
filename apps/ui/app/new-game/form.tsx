'use client'
import { useAuth } from '@/auth'
import { createGame } from './actions'
import ActionButton from '@/shared/action-button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MisteryOfTheHogwartsExpress } from '@lumos/scenarios'
import { IsabelBrimble } from '@lumos/game'

export default function NewGameForm() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/new-player')
    }
  }, [router, isAuthenticated])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isAuthenticated) {
      return
    }

    const playerId = localStorage.getItem('Lumos.PlayerId')!

    const game = await createGame({
      playerId,
      scenarioId: MisteryOfTheHogwartsExpress.id,
      investigatorId: IsabelBrimble.id,
    })

    console.log('created game', game)
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-4xl">Ready for Mysterious Adventures?</h1>
      <form onSubmit={handleSubmit} className="grid">
        <ActionButton type="submit">Create Game</ActionButton>
      </form>
    </div>
  )
}
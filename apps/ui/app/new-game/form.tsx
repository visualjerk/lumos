'use client'
import { isAuthenticated } from '@/auth'
import { createGame } from './actions'
import ActionButton from '@/shared/action-button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NewGameForm() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/new-player')
    }
  }, [router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isAuthenticated()) {
      return
    }

    const playerId = localStorage.getItem('Lumos.PlayerId')!

    const game = await createGame({
      playerId,
      scenarioId: 'scenario-id',
      investigatorId: 'investigator-id',
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

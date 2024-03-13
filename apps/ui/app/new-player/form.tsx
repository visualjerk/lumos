'use client'
import { isAuthenticated, setPlayerId } from '@/auth'
import { createPlayer } from './actions'
import ActionButton from '@/shared/action-button'
import { useRouter } from 'next/navigation'

export default function NewPlayerForm() {
  const router = useRouter()

  if (isAuthenticated()) {
    router.push('/new-game')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isAuthenticated()) {
      return
    }

    const player = await createPlayer()
    setPlayerId(player.id)
    router.push('/new-game')
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-4xl">Welcome Investigator!</h1>
      <form onSubmit={handleSubmit} className="grid">
        <ActionButton type="submit">Join Lumos</ActionButton>
      </form>
    </div>
  )
}

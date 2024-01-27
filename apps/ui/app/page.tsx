import GameUI from './game-ui'

export default function Home() {
  return (
    <main className="">
      <h1 className="text-4xl font-bold">Lumos</h1>
      <div className="flex align-center justify-center">
        <GameUI />
      </div>
    </main>
  )
}

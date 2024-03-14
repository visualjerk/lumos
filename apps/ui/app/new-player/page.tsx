import { Card } from '@/shared/card'
import { BasePage } from '@/shared/base-page'
import NewPlayerForm from './form'

export default function NewPlayer() {
  return (
    <BasePage>
      <Card>
        <NewPlayerForm />
      </Card>
    </BasePage>
  )
}

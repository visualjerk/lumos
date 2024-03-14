import { Card } from '@/shared/card'
import { BasePage } from '@/shared/base-page'
import NewGameForm from './form'

export default function NewGame() {
  return (
    <BasePage>
      <Card>
        <NewGameForm />
      </Card>
    </BasePage>
  )
}

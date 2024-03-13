import { Card } from '@/shared/card'
import { Page } from '@/shared/page'
import NewGameForm from './form'

export default function NewGame() {
  return (
    <Page>
      <Card>
        <NewGameForm />
      </Card>
    </Page>
  )
}

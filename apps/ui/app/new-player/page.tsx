import { Card } from '@/shared/card'
import { Page } from '@/shared/page'
import NewPlayerForm from './form'

export default function NewPlayer() {
  return (
    <Page>
      <Card>
        <NewPlayerForm />
      </Card>
    </Page>
  )
}

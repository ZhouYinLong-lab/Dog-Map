import { serve } from '@hono/node-server'
import { createMediaApi } from './media/api'

const port = Number(process.env.PORT ?? 8787)
const app = createMediaApi()

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Dog Map media API listening on http://localhost:${info.port}`)
})

import { ApolloServer } from 'apollo-server'
import { initNtpUlidSync } from 'ntp-ulid'

import { schema } from './schema'
import { createContext } from './context'

initNtpUlidSync()

new ApolloServer({
  schema,
  context: async ({ req }) => await createContext(req),
}).listen(
  { port: 6007 },
  () =>
    console.log(
      `🚀 Server ready at: http://localhost:6007`,
    ),
)

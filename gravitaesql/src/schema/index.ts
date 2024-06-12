import { nexusSchemaPrisma } from "nexus-plugin-prisma/schema"
import { decorateType, makeSchema } from '@nexus/schema'
import { GraphQLDate } from 'graphql-scalars'

import models from './models'
import Query from './query'
import Mutation from './mutation'

export const GQLDate = decorateType(GraphQLDate, {
  rootTyping: 'DateTime',
  asNexusMethod: 'date',
})

export const schema = makeSchema({
  types: [models, Query, Mutation],
  plugins: [nexusSchemaPrisma({
    experimentalCRUD: true
  })],
  outputs: {
    schema: __dirname + '/../../schema.graphql',
    typegen: __dirname + '/../generated/nexus.ts',
  },
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
      {
        source: require.resolve('../context'),
        alias: 'Context',
      },
    ],
  },
})

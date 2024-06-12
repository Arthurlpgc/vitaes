import { queryType, stringArg } from '@nexus/schema'

import { resolveLegacyJson } from '../utils/legacyJsonExport'

export default queryType({
  definition(t) {
    t.string('currentUser', {
      resolve: async (_root, _args, ctx) => {
        const firebaseId = ctx.firebaseId
        if (!firebaseId) {
          throw new Error("User not authenticated")
        }

        return await resolveLegacyJson(ctx, {
          firebaseId,
        })
      },
    })
    t.boolean('isAdmin', {
      resolve: (_root, _args, ctx) => ctx.isAdmin,
    })
    t.list.field('alertList', {
      type: 'Alert',
      resolve: (_root, _args, ctx) => ctx.prisma.alert.findMany(),
    })
  },
})

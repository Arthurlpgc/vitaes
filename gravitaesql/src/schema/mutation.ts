import { mutationType, arg, stringArg } from '@nexus/schema'
import { ulid } from 'ntp-ulid'

import { defaultRecordsOrder, defaultSectionOrder } from '../utils/collectionRecords'
import { resolveLegacyJson } from '../utils/legacyJsonExport'
import { updateUser } from '../utils/legacyJsonImport'

export default mutationType({
  definition(t) {
    t.string('createUser', {
      args: {
        vid: stringArg(),
      },
      resolve: async (_root, args, ctx) => {
        const firebaseId = ctx.firebaseId
        if (!firebaseId) {
          throw new Error("User not authenticated")
        }

        const vid = args.vid ?? ulid()
        await ctx.prisma.user.create({
          data: {
            vid,
            firebaseId,
            recordsOrder: defaultRecordsOrder,
            sectionOrder: defaultSectionOrder,
          },
        })

        return await resolveLegacyJson(ctx, {
          vid: vid,
        })
      }
    })
    t.boolean('updateUser', {
      args: {
        legacyJson: stringArg({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const firebaseId = ctx.firebaseId
        if (!firebaseId) {
          throw new Error("User not authenticated")
        }

        await updateUser(ctx, firebaseId, args.legacyJson)

        return true
      }
    })
    t.boolean('createAlert', {
      args: {
        message: stringArg({ required: true }),
        type: arg({
          type: 'AlertType',
          required: true,
        }),
      },
      resolve: async (_root, args, ctx) => {
        const firebaseId = ctx.firebaseId
        if (!firebaseId || !ctx.isAdmin) {
          throw new Error("No permission")
        }

        await ctx.prisma.alert.create({
          data: {
            vid: ulid(),
            message: args.message,
            type: args.type,
          }
        })

        return true
      }
    })
    t.boolean('deleteAlert', {
      args: {
        message: stringArg({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const firebaseId = ctx.firebaseId
        if (!firebaseId || !ctx.isAdmin) {
          throw new Error("No permission")
        }
        
        await ctx.prisma.alert.deleteMany({
          where: {
            message: args.message,
          }
        })

        return true
      }
    })
    t.boolean('createBugReport', {
      args: {
        title: stringArg({ required: true }),
        email: stringArg(),
        description: stringArg(),
        data: stringArg(),
      },
      resolve: async (_root, args, ctx) => {
        await ctx.prisma.bugReport.create({
          data: {
            vid: ulid(),
            title: args.title,
            email: args.email,
            description: args.description,
            data: args.data,
            author: {
              connect: {
                firebaseId: ctx.firebaseId,
              }
            }
          }
        })

        return true
      }
    })
  },
})

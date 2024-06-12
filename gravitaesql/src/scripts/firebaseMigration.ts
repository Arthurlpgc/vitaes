import { PrismaClient, RecordCreateInput } from '@prisma/client'
import { ulid } from 'ntp-ulid'
import { exit } from 'process'

import admin from '../firebase'
import { createUserFromLegacyJson } from '../utils/legacyJsonImport'

const prisma = new PrismaClient()

async function migrateBugReports(bugs: Object) {
  const promises = Object.values(bugs).map(async bug => {
    let authorConnect = null
    if (bug.email) {
      const author = (await prisma.user.findMany({
        where: {
          records: {
            some: {
              RecordPersonal: {
                some: {
                  email: {
                    equals: bug.email
                  }
                }
              }
            }
          }
        }
      }))[0]
      if (author) {
        authorConnect = {
          connect: {
            vid: author.vid
          }
        }
      }
    }

    return await prisma.bugReport.create({
      data: {
        vid: ulid(),
        author: authorConnect,
        email: bug.email,
        title: bug.title,
        data: JSON.stringify(bug.data),
      }
    })
  })
  await Promise.all(promises)
}

async function migrateUsers(users: Object) {
  const promises = Object.entries(users).map(async entry => {
    const firebaseId = entry[0]
    const user = entry[1]

    return await createUserFromLegacyJson(prisma, firebaseId, user)
  })
  await Promise.all(promises)
}

async function migratePermissions() {
  await prisma.gatekeeper.create({
    data: {
      vid: ulid(),
      name: 'admin',
      description: 'allow access to admin functions',
      allowedUsers: {
        connect: [
          { firebaseId: '8cLxsE1qpXhr4ostt2PCvhkyCou2' },
          { firebaseId: '8jCzPcCU6cP5CgZ4MwNXhDiXag92' },
        ]
      }
    }
  })
}

async function migrate() {
  const ref = admin.database().ref()
  const db = (await ref.once('value')).val()

  await migrateUsers(db['users'])
  await migrateBugReports(db['bug'])
  await migratePermissions()

  exit()
}

migrate()

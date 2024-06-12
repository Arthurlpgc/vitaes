import { PrismaClient } from '@prisma/client'
import express from 'express'
import admin from './firebase'

const prisma = new PrismaClient()

export interface Context {
  isAdmin: boolean,
  firebaseId?: string,
  prisma: PrismaClient,
}

export async function createContext(req: express.Request): Promise<Context> {
  const tokenWithBearer = 
    (req.headers && req.headers.authorization) ?
      req.headers.authorization :
      null
  if (tokenWithBearer == null) {
    return {
      isAdmin: false,
      prisma,
    }
  }
  const token = tokenWithBearer.replace('Bearer ', '')
  const decodedToken = await admin.auth().verifyIdToken(token)
  const firebaseId = decodedToken.uid

  const user = await prisma.user.findOne({
    where: {
      firebaseId: firebaseId,
    },
    select: {
      gatekeepers: {
        select: {
          name: true,
        }
      }
    }
  })
  const isAdmin =
    !!user && user.gatekeepers.map(
      gatekeeper => gatekeeper.name
    ).includes('admin')

  return {
    isAdmin: isAdmin,
    firebaseId: firebaseId,
    prisma,
  }
}

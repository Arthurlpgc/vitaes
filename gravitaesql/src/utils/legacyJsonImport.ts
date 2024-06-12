import {
  User,
  Record,
  RecordAcademic,
  RecordAchievement,
  RecordEducation,
  RecordLanguage,
  RecordPersonal,
  RecordProject,
  RecordSkill,
  RecordWork,
  PrismaClient,
  RecordCreateInput,
} from '@prisma/client'
import { ulid } from 'ntp-ulid'
import moment from 'moment'

import { Context } from '../context'

type GenericRecord = Record & {
  RecordAcademic: RecordAcademic[]
  RecordAchievement: RecordAchievement[]
  RecordEducation: RecordEducation[]
  RecordLanguage: RecordLanguage[]
  RecordPersonal: RecordPersonal[]
  RecordProject: RecordProject[]
  RecordSkill: RecordSkill[]
  RecordWork: RecordWork[]
}

async function deleteRecord(prisma: PrismaClient, record: GenericRecord): Promise<void> {
  await Promise.all(record.RecordAcademic.map(async item => {
    if (item.institutionVid) await prisma.institution.delete({ where: { vid: item.institutionVid } })
    if (item.locationVid) await prisma.location.delete({ where: { vid: item.locationVid } })
    await prisma.recordAcademic.delete({ where: { recordVid: item.recordVid }})
  }))

  await Promise.all(record.RecordAchievement.map(async item => {
    if (item.institutionVid) await prisma.institution.delete({ where: { vid: item.institutionVid } })
    if (item.locationVid) await prisma.location.delete({ where: { vid: item.locationVid } })
    await prisma.recordAchievement.delete({ where: { recordVid: item.recordVid }})
  }))

  await Promise.all(record.RecordEducation.map(async item => {
    if (item.institutionVid) await prisma.institution.delete({ where: { vid: item.institutionVid } })
    if (item.locationVid) await prisma.location.delete({ where: { vid: item.locationVid } })
    await prisma.recordEducation.delete({ where: { recordVid: item.recordVid }})
  }))

  await Promise.all(record.RecordLanguage.map(async item => {
    await prisma.recordLanguage.delete({ where: { recordVid: item.recordVid }})
  }))

  await Promise.all(record.RecordPersonal.map(async item => {
    await prisma.recordPersonal.delete({ where: { recordVid: item.recordVid }})
  }))

  await Promise.all(record.RecordProject.map(async item => {
    if (item.locationVid) await prisma.location.delete({ where: { vid: item.locationVid } })
    await prisma.recordProject.delete({ where: { recordVid: item.recordVid }})
  }))

  await Promise.all(record.RecordSkill.map(async item => {
    await prisma.recordSkill.delete({ where: { recordVid: item.recordVid }})
  }))

  await Promise.all(record.RecordWork.map(async item => {
    if (item.institutionVid) await prisma.institution.delete({ where: { vid: item.institutionVid } })
    if (item.locationVid) await prisma.location.delete({ where: { vid: item.locationVid } })
    await prisma.recordWork.delete({ where: { recordVid: item.recordVid }})
  }))

  await prisma.record.delete({ where: { vid: record.vid }})
}

function pushRecords(records: { [k: string]: RecordCreateInput[] }, kind: string, values: RecordCreateInput[]): void {
  if (!records[kind]) {
    records[kind] = []
  }
  Array.from(values).forEach(value => records[kind].push(value))
}

function parseRecords(cv: any): { [k: string]: RecordCreateInput[] } {
  const records: { [k: string]: RecordCreateInput[] } = {}

  pushRecords(records, 'academic', Array.from(parseAcademic(cv.academic)))
  pushRecords(records, 'achievement', Array.from(parseAchievement(cv.achievement)))
  pushRecords(records, 'education', Array.from(parseEducation(cv.education)))
  pushRecords(records, 'language', Array.from(parseLanguage(cv.language)))
  pushRecords(records, 'header', Array.from(parsePersonal(cv.header)))
  pushRecords(records, 'project', Array.from(parseProject(cv.project)))
  pushRecords(records, 'skill', Array.from(parseSkill(cv.skill)))
  pushRecords(records, 'work', Array.from(parseWork(cv.work)))

  return records
}

const recordBoilerplate = (disable: any): any => ({
  vid: ulid(),
  hidden: disable ?? false,
})

function parseAcademic(records: any): RecordCreateInput[] {
  if (!records) {
    return []
  }

  return Array.from<any>(records).map(record => ({
    ...recordBoilerplate(record?.disable),
    RecordAcademic: {
      create: {
        title: record?.name,
        startDate: parseDate(record?.start_date) ?? new Date(),
        endDate: parseDate(record?.end_date),
        description: record?.description,
        articleLink: record?.article_link,
        institution: parseInstitution(record?.institution),
        location: parseLocation(record?.location),
      }
    },
  }))
}

function parseAchievement(records: any): RecordCreateInput[] {
  if (!records) {
    return []
  }

  return Array.from<any>(records).map(record => ({
    ...recordBoilerplate(record?.disable),
    RecordAchievement: {
      create: {
        title: record?.name,
        startDate: parseDate(record?.start_date) ?? new Date(),
        endDate: parseDate(record?.end_date),
        description: record?.description,
        position: record?.place,
        certificateLink: record?.certification_link,
        institution: parseInstitution(record?.institution),
        location: parseLocation(record?.location),
      }
    },
  }))
}

function parseEducation(records: any): RecordCreateInput[] {
  if (!records) {
    return []
  }

  return Array.from<any>(records).map(record => ({
    ...recordBoilerplate(record?.disable),
    RecordEducation: {
      create: {
        course: record?.course,
        startDate: parseDate(record?.start_date) ?? new Date(),
        endDate: parseDate(record?.end_date),
        description: record?.description,
        teacher: record?.teacher,
        institution: parseInstitution(record?.institution),
        location: parseLocation(record?.location),
      }
    },
  }))
}

function parseLanguage(records: any): RecordCreateInput[] {
  if (!records) {
    return []
  }

  return Array.from<any>(records).map(record => ({
    ...recordBoilerplate(record?.disable),
    RecordLanguage: {
      create: {
        name: record?.language,
        level: record?.level,
      }
    },
  }))
}

function parsePersonal(record: any): RecordCreateInput[] {
  if (!record) {
    return []
  }

  return [{
    ...recordBoilerplate(record?.disable),
    RecordPersonal: {
      create: {
        name: record?.name,
        email: record?.email,
        homepage: record?.homepage,
        phone: record?.phone,
        address: record?.address,
        linkedin: record?.linkedin,
        github: record?.github,
        birthday: parseDate(record?.birthday),
      }
    },
  }]
}

function parseProject(records: any): RecordCreateInput[] {
  if (!records) {
    return []
  }

  return Array.from<any>(records).map(record => ({
    ...recordBoilerplate(record?.disable),
    RecordProject: {
      create: {
        title: record?.name,
        startDate: parseDate(record?.start_date) ?? new Date(),
        endDate: parseDate(record?.end_date),
        description: record?.description,
        programmingLanguage: record?.language,
        repositoryLink: record?.repository_link,
        location: parseLocation(record?.location),
      }
    },
  }))
}

function parseSkill(records: any): RecordCreateInput[] {
  if (!records) {
    return []
  }

  return Array.from<any>(records).map(record => ({
    ...recordBoilerplate(record?.disable),
    RecordSkill: {
      create: {
        name: record?.skill_name,
        type: record?.skill_type,
        level: record?.skill_level,
      }
    },
  }))
}

function parseWork(records: any): RecordCreateInput[] {
  if (!records) {
    return []
  }

  return Array.from<any>(records).map(record => ({
    ...recordBoilerplate(record?.disable),
    RecordWork: {
      create: {
        role: record?.role,
        startDate: parseDate(record?.start_date) ?? new Date(),
        endDate: parseDate(record?.end_date),
        description: record?.description,
        institution: parseInstitution(record?.institution),
        location: parseLocation(record?.location),
      }
    },
  }))
}

function parseDate(dateString: any): any {
  if (!dateString) {
    return null
  }
  return moment.utc(dateString, 'YYYY-MM-DD').toDate()
}

function parseInstitution(institution: any): any {
  if (!institution) {
    return null
  }
  return {
    create: {
      vid: ulid(),
      name: institution?.name,
    }
  }
}

function parseLocation(location: any): any {
  if (!location) {
    return null
  }
  return {
    create: {
      vid: ulid(),
      country: location?.country,
      governingDistrict: location?.state,
      cityTown: location?.city,
    }
  }
}

async function createUserFromLegacyJson(prisma: PrismaClient, firebaseId: string, legacyJson: any): Promise<User> {
  const records = parseRecords(legacyJson.cv)
  const allRecords = Object.values(records).flat()
  const orderedRecords = Array.from<string>(legacyJson.cv_order)
    .map(kind =>
      Array.from(records[kind]).map(record => record.vid)
    )

  return await prisma.user.create({
    data: {
      vid: ulid(),
      firebaseId: firebaseId,
      autosave: legacyJson.autosave,
      sectionOrder: JSON.stringify(legacyJson.cv_order),
      recordsOrder: JSON.stringify(orderedRecords),
      records: {
        create: allRecords,
      }
    }
  })
}

async function updateUser(
  ctx: Context,
  firebaseId: string,
  legacyJson: string
): Promise<void> {
  const gatekeepers = await ctx.prisma.gatekeeper.findMany({
    where: {
      allowedUsers: {
        some: {
          firebaseId: {
            equals: firebaseId,
          }
        }
      }
    }
  })
  const bugReports = await ctx.prisma.bugReport.findMany({
    where: {
      author: {
        firebaseId: {
          equals: firebaseId,
        }
      }
    }
  })

  const records = await ctx.prisma.record.findMany({
    where: {
      owner: {
        firebaseId: {
          equals: firebaseId,
        }
      }
    },
    include: {
      RecordAcademic: true,
      RecordAchievement: true,
      RecordEducation: true,
      RecordLanguage: true,
      RecordPersonal: true,
      RecordProject: true,
      RecordSkill: true,
      RecordWork: true,
    }
  })

  await Promise.all(records.map(async record => await deleteRecord(ctx.prisma, record)))
  await ctx.prisma.user.delete({ where: { firebaseId }})

  await createUserFromLegacyJson(ctx.prisma, firebaseId, JSON.parse(legacyJson))

  await ctx.prisma.user.update({
    where: {
      firebaseId
    },
    data: {
      gatekeepers: {
        connect: gatekeepers.map(gatekeeper => ({
          vid: gatekeeper.vid,
        }))
      },
      bugReports: {
        connect: bugReports.map(bugReport => ({
          vid: bugReport.vid,
        }))
      }
    }
  })
}

export {
  createUserFromLegacyJson,
  updateUser,
}

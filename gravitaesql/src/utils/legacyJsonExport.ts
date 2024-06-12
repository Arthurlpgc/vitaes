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
  Institution,
  Location,
  UserWhereUniqueInput,
} from '@prisma/client'
import moment from 'moment'
import sortKeys from 'sort-keys'

import { Context } from '../context'

type GenericRecord = Record & {
  RecordAcademic: (RecordAcademic & {
    institution: Institution | null
    location: Location | null
  })[]
  RecordAchievement: (RecordAchievement & {
    institution: Institution | null
    location: Location | null
  })[]
  RecordEducation: (RecordEducation & {
    institution: Institution | null
    location: Location | null
  })[]
  RecordLanguage: RecordLanguage[]
  RecordPersonal: RecordPersonal[]
  RecordProject: (RecordProject & {
    location: Location | null
  })[]
  RecordSkill: RecordSkill[]
  RecordWork: (RecordWork & {
    institution: Institution | null
    location: Location | null
  })[]
}

type UserWithRecords = (User & {
  records: GenericRecord[]
})

// Remove all entries with null values, recursively
function cleanEmpty(obj: any): any {
  const newObj: any = {}
  return Object.entries(obj)
    .map(([k, v]) => [k, v && typeof v === "object" ? cleanEmpty(v) : v])
    .reduce((a, [k, v]) => (v == null || k === 'vid' ? a : (a[k] = v, a)), newObj)
}

function formatDate(date: Date | null): string | null {
  return date ? moment.utc(date).format('YYYY-MM-DD') : null
}

function formatInstitution(institution: Institution | null): any {
  return institution ?
    { name: institution.name } :
    null
}

function formatLocation(location: Location | null): any {
  return location ?
    {
      country: location.country,
      state: location.governingDistrict,
      city: location.cityTown,
    } :
    null
}

function pushRecord(cv: any, kind: string, data: any) {
  cv[kind] = cv[kind] ?? {}
  cv[kind][data.vid] = cleanEmpty(data)
}

function processRecord(genericRecord: GenericRecord, cv: any): any {
  const hidden = genericRecord.hidden ? true : null
  
  if (genericRecord.RecordAcademic.length > 0) {
    const record = genericRecord.RecordAcademic[0]
    pushRecord(cv, 'academic', {
      vid: record.recordVid,
      name: record.title,
      start_date: formatDate(record.startDate),
      end_date: formatDate(record.endDate),
      institution: formatInstitution(record.institution),
      location: formatLocation(record.location),
      article_link: record.articleLink,
      description: record.description,
      disable: hidden,
    })
  }
  
  if (genericRecord.RecordAchievement.length > 0) {
    const record = genericRecord.RecordAchievement[0]
    pushRecord(cv, 'achievement', {
      vid: record.recordVid,
      name: record.title,
      start_date: formatDate(record.startDate),
      end_date: formatDate(record.endDate),
      institution: formatInstitution(record.institution),
      location: formatLocation(record.location),
      certification_link: record.certificateLink,
      place: record.position,
      description: record.description,
      disable: hidden,
    })
  }
  
  if (genericRecord.RecordEducation.length > 0) {
    const record = genericRecord.RecordEducation[0]
    pushRecord(cv, 'education', {
      vid: record.recordVid,
      course: record.course,
      start_date: formatDate(record.startDate),
      end_date: formatDate(record.endDate),
      institution: formatInstitution(record.institution),
      location: formatLocation(record.location),
      description: record.description,
      teacher: record.teacher,
      disable: hidden,
    })
  }
  
  if (genericRecord.RecordLanguage.length > 0) {
    const record = genericRecord.RecordLanguage[0]
    pushRecord(cv, 'language', {
      vid: record.recordVid,
      language: record.name,
      level: record.level,
      disable: hidden,
    })
  }
  
  if (genericRecord.RecordPersonal.length > 0) {
    const record = genericRecord.RecordPersonal[0]
    cv['header'] = cleanEmpty({
      name: record.name,
      email: record.email,
      homepage: record.homepage,
      phone: record.phone,
      address: record.address,
      linkedin: record.linkedin,
      github: record.github,
      birthday: formatDate(record.birthday),
    })
  }
  
  if (genericRecord.RecordProject.length > 0) {
    const record = genericRecord.RecordProject[0]
    pushRecord(cv, 'project', {
      vid: record.recordVid,
      name: record.title,
      start_date: formatDate(record.startDate),
      end_date: formatDate(record.endDate),
      location: formatLocation(record.location),
      description: record.description,
      repository_link: record.repositoryLink,
      language: record.programmingLanguage,
      disable: hidden,
    })
  }
  
  if (genericRecord.RecordSkill.length > 0) {
    const record = genericRecord.RecordSkill[0]
    pushRecord(cv, 'skill', {
      vid: record.recordVid,
      skill_name: record.name,
      skill_level: record.level,
      skill_type: record.type,
      disable: hidden,
    })
  }
  
  if (genericRecord.RecordWork.length > 0) {
    const record = genericRecord.RecordWork[0]
    pushRecord(cv, 'work', {
      vid: record.recordVid,
      role: record.role,
      location: formatLocation(record.location),
      start_date: formatDate(record.startDate),
      end_date: formatDate(record.endDate),
      institution: formatInstitution(record.institution),
      description: record.description,
      disable: hidden,
    })
  }
}

function sortRecords(cv: any, sectionOrder: any, recordsOrder: any[]): void {
  Array.from<string>(sectionOrder)
    .forEach((kind, idx) => {
      cv[kind] = Array.from<string>(recordsOrder[idx]).map(recordVid => cv[kind][recordVid])
    })
  Object.keys(cv).forEach(kind => {
    if (cv[kind].length == 0) {
      delete cv[kind]
    }
  })
}

function legacyJson(user: UserWithRecords): Object {
  let legacy: any = {}

  legacy['autosave'] = user.autosave
  if (user.sectionOrder) {
    legacy['cv_order'] = JSON.parse(user.sectionOrder)
  }

  let cv: any = {}
  user.records.forEach(record => processRecord(record, cv))
  sortRecords(cv, JSON.parse(user.sectionOrder), JSON.parse(user.recordsOrder))
  legacy['cv'] = cv

  if (!cv.header) {
    cv.header = {
      name: '',
    }
  }

  legacy = sortKeys(legacy, { deep: true })
  return legacy
}

async function resolveLegacyJson(ctx: Context, where: UserWhereUniqueInput): Promise<string> {
  const user = await ctx.prisma.user.findOne({
    where,
    include: {
      records: {
        include: {
          RecordAcademic: {
            include: {
              institution: true,
              location: true,
            }
          },
          RecordAchievement: {
            include: {
              institution: true,
              location: true,
            }
          },
          RecordEducation: {
            include: {
              institution: true,
              location: true,
            }
          },
          RecordLanguage: true,
          RecordPersonal: true,
          RecordProject: {
            include: {
              location: true,
            }
          },
          RecordSkill: true,
          RecordWork: {
            include: {
              institution: true,
              location: true,
            }
          },
        }
      }
    }
  })
  if (!user) {
    throw new Error("User not found")
  }
  
  return JSON.stringify(legacyJson(user), null, 2)
}

export {
  legacyJson,
  resolveLegacyJson,
}

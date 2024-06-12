import { objectType } from '@nexus/schema'

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.vid()
    t.model.firebaseId()
    t.model.autosave()
    t.model.sectionOrder()

    t.model.records()
    t.model.cvs()
    t.model.gatekeepers()
  },
})

const CV = objectType({
  name: 'CV',
  definition(t) {
    t.model.vid()
    t.model.title()
    t.model.sectionOrder()

    t.model.records()

    t.model.owner()
  },
})

const Record = objectType({
  name: 'Record',
  definition(t) {
    t.model.vid()
    t.model.hidden()

    t.model.cvs()

    t.model.owner()
  },
})

const RecordAcademic = objectType({
  name: 'RecordAcademic',
  definition(t) {
    t.model.title()
    t.model.startDate()
    t.model.endDate()
    t.model.description()
    t.model.articleLink()

    t.model.location()
    t.model.institution()

    t.model.record()
  },
})

const RecordAchievement = objectType({
  name: 'RecordAchievement',
  definition(t) {
    t.model.title()
    t.model.startDate()
    t.model.endDate()
    t.model.description()
    t.model.position()
    t.model.certificateLink()

    t.model.location()
    t.model.institution()

    t.model.record()
  },
})

const RecordEducation = objectType({
  name: 'RecordEducation',
  definition(t) {
    t.model.course()
    t.model.startDate()
    t.model.endDate()
    t.model.description()
    t.model.teacher()

    t.model.location()
    t.model.institution()

    t.model.record()
  },
})

const RecordLanguage = objectType({
  name: 'RecordLanguage',
  definition(t) {
    t.model.name()
    t.model.level()

    t.model.record()
  },
})

const RecordPersonal = objectType({
  name: 'RecordPersonal',
  definition(t) {
    t.model.name()
    t.model.email()
    t.model.homepage()
    t.model.phone()
    t.model.address()
    t.model.linkedin()
    t.model.github()
    t.model.birthday()

    t.model.record()
  },
})

const RecordProject = objectType({
  name: 'RecordProject',
  definition(t) {
    t.model.title()
    t.model.startDate()
    t.model.endDate()
    t.model.description()
    t.model.programmingLanguage()
    t.model.repositoryLink()

    t.model.location()

    t.model.record()
  },
})

const RecordSkill = objectType({
  name: 'RecordSkill',
  definition(t) {
    t.model.name()
    t.model.type()
    t.model.level()

    t.model.record()
  },
})

const RecordWork = objectType({
  name: 'RecordWork',
  definition(t) {
    t.model.role()
    t.model.startDate()
    t.model.endDate()
    t.model.description()

    t.model.location()
    t.model.institution()

    t.model.record()
  },
})

const Institution = objectType({
  name: 'Institution',
  definition(t) {
    t.model.vid()
    t.model.name()
    t.model.abbreviaton()
  },
})

const Location = objectType({
  name: 'Location',
  definition(t) {
    t.model.vid()
    t.model.country()
    t.model.governingDistrict()
    t.model.cityTown()
  },
})

const BugReport = objectType({
  name: 'BugReport',
  definition(t) {
    t.model.vid()
    t.model.title()
    t.model.email()
    t.model.description()
    t.model.data()

    t.model.author()
  },
})

const Alert = objectType({
  name: 'Alert',
  definition(t) {
    t.model.vid()
    t.model.message()
    t.model.type()
  },
})

const Gatekeeper = objectType({
  name: 'Gatekeeper',
  definition(t) {
    t.model.vid()
    t.model.name()
    t.model.description()
  },
})

const Template = objectType({
  name: 'Template',
  definition(t) {
    t.model.vid()
    t.model.name()
    t.model.baseFolder()
    t.model.command()

    t.model.params()
  },
})

const TemplateParam = objectType({
  name: 'TemplateParam',
  definition(t) {
    t.model.vid()
    t.model.name()
    t.model.displayName()
    t.model.defaultValue()
    t.model.values()

    t.model.template()
  },
})

export default [
  User,
  CV,
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
  BugReport,
  Alert,
  Gatekeeper,
  Template,
  TemplateParam,
]

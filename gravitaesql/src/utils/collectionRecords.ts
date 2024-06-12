const sectionOrder = [
  'work',
  'education',
  'achievement',
  'project',
  'academic',
  'language',
  'skill',
]
const recordsOrder = Array.from(sectionOrder).map(_ => [])

const defaultRecordsOrder = JSON.stringify(recordsOrder)
const defaultSectionOrder = JSON.stringify(sectionOrder)

export {
  defaultRecordsOrder,
  defaultSectionOrder,
}

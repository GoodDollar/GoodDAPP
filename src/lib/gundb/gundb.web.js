// @flow
import createGun from './gundb-factory'

const { RindexedDB } = window || {}

export default createGun({
  localStorage: !RindexedDB,
})

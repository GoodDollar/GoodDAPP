import asyncStore from '@gooddollar/gun/lib/ras.js'

import AsyncStorage from '../utils/asyncStorage'
import createGun from './gundb-factory'

export default createGun({
  // Warning: Android AsyncStorage has 6mb limit by default!
  store: asyncStore({ AsyncStorage }),
  rfs: false,
})

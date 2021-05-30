import asyncStore from '@gooddollar/gun/lib/ras.js'

// changed to use 'pure' async storage without our proxy wrapper and JSON serializer
import AsyncStorage from '@react-native-async-storage/async-storage'

import createGun from './gundb-factory'

export default createGun({
  // Warning: Android AsyncStorage has 6mb limit by default!
  store: asyncStore({ AsyncStorage }),
  rfs: false,
})

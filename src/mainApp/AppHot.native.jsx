import React, { useEffect } from 'react'

import { isAndroidNative } from '../lib/utils/platform'
import logger from '../lib/logger/js-logger'
import { App } from './App'

const log = logger.child({ from: 'App' })

const AppHot = props => {
  useEffect(() => {
    const { _v8runtime: v8 } = global

    if (isAndroidNative && v8) {
      log.debug(`V8 version is ${v8().version}`)
    }
  }, [])

  return <App {...props} />
}

export default AppHot

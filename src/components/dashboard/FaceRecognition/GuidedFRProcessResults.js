//@flow
import React, { useEffect } from 'react'
import { View } from 'react-native'

//import GunDBPublic from '../../../lib/gundb/gundb'
import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'GuidedFRProcessResults' })
let GunDBPublic = global.gun
const GuidedFRProcessResults = props => {
  let sessionId = props.sessionId
  log.debug({ sessionId })
  GunDBPublic.get(sessionId).on(updateProgress, props)

  //const [state, setState] = useState(initialState)

  useEffect(() => {
    return () => {
      log.debug('Removing FR guided progress listener')
      GunDBPublic.get(props.sessionId).off()
    }
  }, [])

  return <View>hey</View>
}

const updateProgress = props => {
  props.store.set('currentScreen')({
    dialogData: {
      visible: true,
      title: 'Face Recognition Progress....',
      message: `1. Verifying no duplicates were found....`,
      onDismiss: this.setState({ showPreText: true }) // reload.
    }
  })
}

export default GuidedFRProcessResults

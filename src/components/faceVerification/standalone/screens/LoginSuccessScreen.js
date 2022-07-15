// libraries
import React, { useContext, useEffect } from 'react'
import { Linking, Platform, View } from 'react-native'
import { noop } from 'lodash'
import API from '../../../../lib/API/api'

// components
import Text from '../../../common/view/Text'
import { Section, Wrapper } from '../../../common'

// utils
import { getDesignRelativeHeight, getDesignRelativeWidth, isLargeDevice } from '../../../../lib/utils/sizes'
import normalize from '../../../../lib/utils/normalizeText'
import withStyles from '../theme/withStyles'
import { isBrowser } from '../../../../lib/utils/platform'
import { FVFlowContext } from '../../../../lib/fvflow/FVFlow'
import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'LoginSuccessScreen' })

const LoginSuccessScreen = ({ styles, onDismiss = noop, ready }) => {
  const { rdu, cbu } = useContext(FVFlowContext)

  const onFVDone = async () => {
    if (rdu) {
      return Linking.openURL(rdu)
    }
    if (cbu) {
      await API.client.post(cbu).catch(e => log.error('fvlogin cbu failed', e.message, e, { cbu }))
      if (Platform.OS === 'web') {
        window.close()
      }
    }
  }

  useEffect(() => {
    onFVDone()
  }, [])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <Text style={styles.text}>You can close this window and go back to the App</Text>
            </View>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

export default withStyles(LoginSuccessScreen)

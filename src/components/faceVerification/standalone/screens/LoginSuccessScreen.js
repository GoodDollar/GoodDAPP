// libraries
import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'
import { noop } from 'lodash'

// components
import Text from '../../../common/view/Text'
import { Section, Wrapper } from '../../../common'

// utils
import withStyles from '../theme/withStyles'
import { LoginFlowContext } from '../context/LoginFlowContext'

import logger from '../../../../lib/logger/js-logger'
import { addNonceAndSign, detail, redirectTo } from '../../../loginRedirect/utils'

const log = logger.child({ from: 'LoginSuccessScreen' })

const LoginSuccessScreen = ({ styles, onDismiss = noop, ready }) => {
  const { rdu, cbu, faceIdentifier, firstName } = useContext(LoginFlowContext)

  useEffect(() => {
    if (!rdu && !cbu) {
      return
    }

    const url = rdu || cbu
    const urlType = rdu ? 'rdu' : 'cbu'
    const response = addNonceAndSign({
      n: detail(firstName),
      a: detail(faceIdentifier),
    })

    redirectTo(url, urlType, response, log)
  }, [firstName, faceIdentifier, rdu, cbu])

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

// libraries
import React, { useEffect } from 'react'
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

const log = logger.child({ from: 'LoginErrorScreen' })

const DOCS_URL = 'https://doc.gooddollar/sdk/identity'

const LoginErrorScreen = ({ styles, onDismiss = noop, ready }) => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.close()
    }
  }, [])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <Text style={styles.text}>Login information is missing, for instructions please visit: </Text>
              <Text
                color={'primary'}
                fontSize={getDesignRelativeHeight(16)}
                lineHeight={getDesignRelativeHeight(16)}
                letterSpacing={0.26}
                fontFamily="Roboto"
                fontWeight="bold"
                textDecorationLine="underline"
                onPress={() => Linking.openUrl(DOCS_URL)}
              >{`${DOCS_URL}`}</Text>
            </View>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

export default withStyles(LoginErrorScreen)

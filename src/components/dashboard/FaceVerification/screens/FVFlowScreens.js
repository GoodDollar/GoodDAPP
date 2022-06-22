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
import { withStyles } from '../../../../lib/styles'
import { isBrowser } from '../../../../lib/utils/platform'
import { FVFlowContext } from '../../../../lib/fvflow/FVFlow'
import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'FaceVerificationIntro' })

const DOCS_URL = 'https://doc.gooddollar/sdk/identity'
const DoneScreen = ({ styles, onDismiss = noop, ready }) => {
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

const ErrorScreen = ({ styles, onDismiss = noop, ready }) => {
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

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.sizes.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },

  mainContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },

  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
    alignItems: 'center',
  },
  descriptionContainerB: {
    paddingVertical: getDesignRelativeHeight(isBrowser ? 12 : 10),
  },
  descriptionWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  text: {
    textAlign: 'center',
    fontSize: normalize(isLargeDevice ? 22 : 20),
    lineHeight: isLargeDevice ? 36 : 34,
  },

  infoRow: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})

export const FVFlowDone = withStyles(getStylesFromProps)(DoneScreen)
export const FVFlowError = withStyles(getStylesFromProps)(ErrorScreen)

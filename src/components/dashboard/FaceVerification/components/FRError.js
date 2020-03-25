import React, { useCallback, useEffect, useMemo } from 'react'
import { Image, Platform, View } from 'react-native'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import { CustomButton, Section, Wrapper } from '../../../common'
import Separator from '../../../common/layout/Separator'
import Oops from '../../../../assets/oops.svg'
import Text from '../../../common/view/Text'
import GDStore from '../../../../lib/undux/GDStore'
import logger from '../../../../lib/logger/pino-logger'
import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

const log = logger.child({ from: 'FRError' })

if (Platform.OS === 'web') {
  Image.prefetch(Oops)
}

const FRError = ({ styles, screenProps }) => {
  const { screenState } = screenProps
  let { isValid, error: reason } = screenState

  if (reason instanceof Error || reason.message || reason.error) {
    if (reason.name === 'NotAllowedError') {
      reason = `Looks like GoodDollar doesn't have access to your camera. Please provide access and try again`
    } else {
      reason = reason.message || reason.error
    }
  }

  //is the error mesage something we want to show to the user? currently only camera related
  const isRelevantError = reason.match(/camera/i) || reason === 'Permission denied'
  let error = isRelevantError
    ? reason
    : "You see, it's not that easy\n to capture your beauty :)\nSo, let's give it another shot..."
  let title = isRelevantError ? 'Something went wrong...' : 'Something went wrong on our side...'

  useEffect(() => {
    if (isValid) {
      screenProps.pop({ isValid })
    }
  }, [isValid])

  const fullName = useMemo(() => {
    const store = GDStore.useStore()
    const { fullName } = store.get('profile')

    return fullName
  }, [])

  const gotoFR = useCallback(() => {
    screenProps.navigateTo('FaceVerification', { showHelper: true })
  }, [screenProps])

  useEffect(() => {
    log.debug({ styles, screenProps, reason })
  }, [styles, screenProps])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none">
            {' '}
            {`${getFirstWord(fullName)},\n${title}`}
          </Section.Title>
          <Image source={Oops} resizeMode="center" style={styles.errorImage} />
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <Text color="primary" fontWeight="bold" style={styles.description}>
              {`${error}`}
            </Text>
            <Separator width={2} />
          </Section>
        </Section>
        <Section>
          <CustomButton onPress={gotoFR}>PLEASE TRY AGAIN</CustomButton>
        </Section>
      </View>
    </Wrapper>
  )
}

FRError.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
    borderRadius: 5,
  },
  errorImage: {
    height: getDesignRelativeHeight(146),
  },
  errorText: {
    fontWeight: 'normal',
  },
  descriptionContainer: {
    flex: 1,
    marginBottom: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.defaultHalf),
    paddingRight: getDesignRelativeWidth(theme.sizes.defaultHalf),
    paddingTop: getDesignRelativeHeight(theme.sizes.default),
  },
  errorSection: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: getDesignRelativeHeight(20),
    justifyContent: 'flex-end',
  },
  description: {
    paddingVertical: getDesignRelativeHeight(25),
  },
})

export default withStyles(getStylesFromProps)(FRError)

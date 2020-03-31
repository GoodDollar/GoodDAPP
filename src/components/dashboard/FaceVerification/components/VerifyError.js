// Please follow those imports order (need to add eslint rule for that)

// 1. React
import React, { useEffect, useMemo } from 'react'
// 2. React Native
import { Image, Platform, View } from 'react-native'
// 3. Libraries components (here're absent)

// 4. common components
import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { Section, Wrapper } from '../../../common'
// 5. local components like ResultStep, GuidedResults and others from FaceVerification (here're absent)

// 6. FLUX imports: store, reducers, actions
import GDStore from '../../../../lib/undux/GDStore'

// 7. Utilities
import logger from '../../../../lib/logger/pino-logger'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

// 8. styles & assets
import { withStyles } from '../../../../lib/styles'
import Oops from '../../../../assets/oops.svg'

const defaultLogger = logger.child({ from: 'VerifyError' })

if (Platform.OS === 'web') {
  Image.prefetch(Oops)
}

const VerifyError = ({
  styles,
  reason,
  description,
  action,

  title = 'Something went wrong...',
  log = defaultLogger,
}) => {
  const store = GDStore.useStore()
  const { error, message } = reason || {}

  const firstName = useMemo(() => {
    const { fullName } = store.get('profile')

    return getFirstWord(fullName)
  }, [store])

  useEffect(() => {
    log.debug({ styles, screenProps, reason })
  }, [styles, screenProps])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none">
            {' '}
            {`${firstName},\n${title}`}
          </Section.Title>
          <Image source={Oops} resizeMode="center" style={styles.errorImage} />
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <Text color="primary" fontWeight="bold" style={styles.description}>
              {`${description || error || message || reason}`}
            </Text>
            <Separator width={2} />
          </Section>
        </Section>
        {action && (<Section>{action}</Section>)}
      </View>
    </Wrapper>
  )
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
  description: {
    paddingVertical: getDesignRelativeHeight(25),
  },
})

export default withStyles(getStylesFromProps)(VerifyError)

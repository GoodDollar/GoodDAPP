// libraries
import React from 'react'
import { View } from 'react-native'

// components
import { t } from '@lingui/macro'
import { Section, Wrapper } from '../../common'

import useCountdown from '../../../lib/hooks/useCountdown'

// utils
import { withStyles } from '../../../lib/styles'
import { isBrowser } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import WaitForCompleted from './WaitForCompleted'

export const whitelistRetries = 9
export const whitelistDelay = 3000
const whitelistTimeout = Math.floor(((whitelistRetries + 1) * whitelistDelay) / 1000)

// this was copied as contain different logic and just needs countdown
const Whitelisting = ({ styles }) => {
  const counter = useCountdown(whitelistTimeout)
  const message = t`Enabling claim feature on Your wallet. Please wait...`

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <WaitForCompleted counter={counter} message={message} />
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
    marginBottom: theme.paddings.bottomPadding,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
    alignItems: 'center',
  },
  descriptionWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
})

export default withStyles(getStylesFromProps)(Whitelisting)

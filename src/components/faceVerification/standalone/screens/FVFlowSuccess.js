// libraries
import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'

// components
import { Section, Wrapper } from '../../../common'

// utils
import { FVFlowContext } from '../context/FVFlowContext'
import { redirectTo } from '../../../../lib/utils/linking'
import API from '../../../../lib/API'
import { tryUntil } from '../../../../lib/utils/async'
import withStyles from '../theme/withStyles'
import useCountdown from '../../../../lib/hooks/useCountdown'
import WaitForCompleted from '../../components/WaitForCompleted'

const checkWhitelistedAttempts = 6
const checkWhitelistedDelay = 5000
const checkWhitelistedTimeout = Math.floor(((checkWhitelistedAttempts + 1) * checkWhitelistedDelay) / 1000)

const waitForWhitelisted = account =>
  tryUntil(
    () => API.isWhitelisted(account),
    ({ isWhitelisted }) => isWhitelisted,
    checkWhitelistedAttempts - 1,
    checkWhitelistedDelay,
  )

const FVFlowSuccess = ({ styles, screenProps }) => {
  const counter = useCountdown(checkWhitelistedTimeout)
  const { rdu, cbu, account } = useContext(FVFlowContext)

  useEffect(() => {
    const url = rdu || cbu
    const urlType = rdu ? 'rdu' : 'cbu'

    if (!url) {
      return
    }

    waitForWhitelisted(account)
      .catch(() => false)
      .then(verified => redirectTo(url, urlType, { verified }))
  }, [rdu, cbu])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <WaitForCompleted counter={counter} />
            </View>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

export default withStyles(FVFlowSuccess)

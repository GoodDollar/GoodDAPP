// libraries
import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'

// components
import { Section, Wrapper } from '../../../common'

// utils
import API from '../../../../lib/API'
import useCountdown from '../../../../lib/hooks/useCountdown'
import { tryUntil } from '../../../../lib/utils/async'
import WaitForCompleted from '../../components/WaitForCompleted'
import { FVFlowContext } from '../context/FVFlowContext'
import useFVRedirect from '../hooks/useFVRedirect'
import withStyles from '../theme/withStyles'

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
  const { account } = useContext(FVFlowContext)
  const fvRedirect = useFVRedirect()

  useEffect(() => {
    waitForWhitelisted(account)
      .catch(() => false)
      .then(fvRedirect)
  }, [account])

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

// libraries
import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'

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
import logger from '../../../../lib/logger/js-logger'

const checkWhitelistedAttempts = 6
const checkWhitelistedDelay = 5000
const checkWhitelistedTimeout = Math.floor(((checkWhitelistedAttempts + 1) * checkWhitelistedDelay) / 1000)

const log = logger.child({ from: 'FaceVerification' })

const waitForWhitelisted = account =>
  tryUntil(
    () => API.isWhitelisted(account),
    response => get(response, 'data.isWhitelisted'),
    checkWhitelistedAttempts - 1,
    checkWhitelistedDelay,
  )
    .then(() => true)
    .catch(() => false)

const FVFlowSuccess = ({ styles, screenProps }) => {
  const counter = useCountdown(checkWhitelistedTimeout)
  const { account } = useContext(FVFlowContext)
  const fvRedirect = useFVRedirect()

  useEffect(() => {
    log.info('Waiting for whitelisted', { account })

    waitForWhitelisted(account).then(fvRedirect)
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

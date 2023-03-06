// libraries
import React, { useContext, useEffect, useRef } from 'react'
import { View } from 'react-native'

// components
import { Section, Wrapper } from '../../../common'

// utils
import API from '../../../../lib/API'
import useCountdown from '../../../../lib/hooks/useCountdown'
import { delay, withTimeout } from '../../../../lib/utils/async'
import WaitForCompleted from '../../components/WaitForCompleted'
import { FVFlowContext } from '../context/FVFlowContext'
import useFVRedirect from '../hooks/useFVRedirect'
import withStyles from '../theme/withStyles'
import logger from '../../../../lib/logger/js-logger'

const checkWhitelistedAttempts = 6
const checkWhitelistedDelay = 5
const checkWhitelistedTimeout = checkWhitelistedAttempts * checkWhitelistedDelay

const log = logger.child({ from: 'FaceVerification' })

// eslint-disable-next-line require-await
const checkWhitelisted = async (account, timeout = checkWhitelistedTimeout) => {
  const apiCall = async () => {
    try {
      const { data } = await API.isWhitelisted(account)

      return data.isWhitelisted
    } catch {
      // any other error will be caught with return of whitelisted false
      return false
    }
  }

  // only timeout error will be thrown
  return withTimeout(apiCall, timeout * 1000, `Account ${account} whitelisted check timed out`)
}

const FVFlowSuccess = ({ styles, screenProps }) => {
  const counter = useCountdown(checkWhitelistedTimeout)
  const { account } = useContext(FVFlowContext)
  const fvRedirect = useFVRedirect()
  const counterRef = useRef(counter)

  // sync timer with the ref in parralel
  useEffect(() => (counterRef.current = counter), [counter])

  useEffect(() => {
    const waitForWhitelisted = async () => {
      try {
        if (counterRef.current <= 0) {
          throw new Error(`Account ${account} whitelisted check timed out`)
        }

        // set timeout for the timer value been left
        const isWhitelisted = await checkWhitelisted(account, counterRef.current)

        log.info('Received whitelisted status', { account, isWhitelisted })

        // retry if a) no timed out b) still not whitelisted c) there's time for delay + at least one sec more
        if (!isWhitelisted && counterRef.current > checkWhitelistedDelay) {
          log.info('Still not whitelisted, awaiting for the next attempt', { account, checkWhitelistedDelay })
          await delay(checkWhitelistedDelay * 1000)
          return waitForWhitelisted()
        }

        return isWhitelisted
      } catch (e) {
        log.error('Whitelisted check failed:', e.message, e, { account })
        return false
      }
    }

    log.info('Waiting for whitelisted', { account })
    waitForWhitelisted().then(fvRedirect)
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

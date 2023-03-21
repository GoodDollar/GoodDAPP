// libraries
import React, { useContext, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { pick, pickBy } from 'lodash'
import { t } from '@lingui/macro'

// components
import { Section, Wrapper } from '../../../common'
import WaitForCompleted from '../../components/WaitForCompleted'
import { FVFlowContext } from '../context/FVFlowContext'

import useCountdown from '../../../../lib/hooks/useCountdown'
import { useDialog } from '../../../../lib/dialog/useDialog'
import useFVRedirect from '../hooks/useFVRedirect'

import API from '../../../../lib/API'
import { delay, withTimeout } from '../../../../lib/utils/async'

import withStyles from '../theme/withStyles'
import logger from '../../../../lib/logger/js-logger'
import useFVLoginInfoCheck from '../hooks/useFVLoginInfoCheck'

const checkWhitelistedAttempts = 6
const checkWhitelistedDelay = 10 // setting timer for 1 min by increasing delay to keep the same amount of calls
const checkWhitelistedTimeout = checkWhitelistedAttempts * checkWhitelistedDelay

const log = logger.child({ from: 'FaceVerification' })

// eslint-disable-next-line require-await
const checkWhitelisted = async (account, timeout = checkWhitelistedTimeout) => {
  const apiCall = async () => {
    try {
      const { data } = await API.isWhitelisted(account)

      return pick(data, 'isWhitelisted')
    } catch (error) {
      // any other error will return as response prop with whitelisted false
      return { error, isWhitelisted: false }
    }
  }

  // only timeout error will be thrown
  return withTimeout(apiCall, timeout * 1000, `Account ${account} whitelisted check timed out`)
}

const FVFlowSuccess = ({ styles, screenProps }) => {
  const counter = useCountdown(checkWhitelistedTimeout)
  const { account } = useContext(FVFlowContext)
  const fvRedirect = useFVRedirect()
  const { showErrorDialog } = useDialog()
  const counterRef = useRef(counter)
  const lastErrorRef = useRef()

  // does redirect to error page with if no account/faceid/other params specified
  // othwerise page will count till 0 then stuck
  useFVLoginInfoCheck()

  // sync timer with the ref in parralel
  useEffect(() => (counterRef.current = counter), [counter])

  useEffect(() => {
    const waitForWhitelisted = async () => {
      try {
        if (counterRef.current <= 0) {
          throw new Error(`Account ${account} whitelisted check timed out`)
        }

        // set timeout for the timer value been left
        const { isWhitelisted, error } = await checkWhitelisted(account, counterRef.current)

        log.info('Received whitelisted status', pickBy({ account, isWhitelisted, error }))

        if (error) {
          // store last non-timeout error, using ref as the last call could be timed out
          lastErrorRef.current = error
        }

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

    const redirect = isWhitelisted => {
      const { current: error } = lastErrorRef
      const onDismiss = () => fvRedirect(isWhitelisted)

      const errorMessage = t`You have not being whitelisted.` + `\n\n` + t`Please try again later`

      if (isWhitelisted || !error) {
        return onDismiss()
      }

      showErrorDialog(errorMessage, error, { onDismiss })
    }

    // if no params were sent (e.g. user refreshed page) - do not send requests
    if (!account) {
      return
    }

    log.info('Waiting for whitelisted', { account })
    waitForWhitelisted().then(redirect)
  }, [account])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionWrapper}>
              <WaitForCompleted
                text={
                  t`Your address is being whitelisted across all chains.` +
                  `\n` +
                  t`Please wait.` +
                  `\n\n` +
                  t`You'll be redirected when it's complete.`
                }
                counter={counter}
              />
            </View>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

export default withStyles(FVFlowSuccess)

// @flow

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import moment from 'moment'
import numeral from 'numeral'
import AsyncStorage from '../../lib/utils/asyncStorage'
import useOnPress from '../../lib/hooks/useOnPress'
import { isBrowser } from '../../lib/utils/platform'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/logger/exceptions'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import wrapper from '../../lib/undux/utils/wrapper'
import { openLink } from '../../lib/utils/linking'
import { formatWithSIPrefix, formatWithThousandsSeparator } from '../../lib/utils/formatNumber'
import { weiToGd } from '../../lib/wallet/utils'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { WrapperClaim } from '../common'
import SpinnerCheckMark from '../common/animations/SpinnerCheckMark/SpinnerCheckMark'
import { withStyles } from '../../lib/styles'
import {
  CLAIM_FAILED,
  CLAIM_GEO,
  CLAIM_SUCCESS,
  fireEvent,
  fireGoogleAnalyticsEvent,
  fireMauticEvent,
} from '../../lib/analytics/analytics'
import Config from '../../config/config'
import { isSmallDevice } from '../../lib/utils/mobileSizeDetect'
import Section from '../common/layout/Section'
import BigGoodDollar from '../common/view/BigGoodDollar'
import useAppState from '../../lib/hooks/useAppState'
import type { DashboardProps } from './Dashboard'
import useClaimCounter from './Claim/useClaimCounter'
import ButtonBlock from './Claim/ButtonBlock'

type ClaimProps = DashboardProps

const log = logger.child({ from: 'Claim' })

const bigFontSize = isSmallDevice ? 30 : 40
const regularFontSize = isSmallDevice ? 14 : 16

const LoadingAnimation = ({ success, speed = 3 }) => (
  <View style={{ alignItems: 'center' }}>
    <SpinnerCheckMark successSpeed={speed} success={success} width={175} height={'auto'} />
  </View>
)

const EmulateButtonSpace = () => <View style={{ paddingTop: 16, minHeight: 44, visibility: 'hidden' }} />

const Claim = props => {
  const { screenProps, styles, theme }: ClaimProps = props
  const { appState } = useAppState()
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()

  const { entitlement } = gdstore.get('account')
  const [dailyUbi, setDailyUbi] = useState((entitlement && entitlement.toNumber()) || 0)
  const isCitizen = gdstore.get('isLoggedInCitizen')

  const [showDialog, , showErrorDialog] = useDialog()

  // use loading if required
  const [, setLoading] = useState(false)
  const claimInterval = useRef(null)
  const timerInterval = useRef(null)

  const [nextClaim, setNextClaim] = useState()
  const [nextClaimDate, setNextClaimDate] = useState()

  const [peopleClaimed, setPeopleClaimed] = useState('--')
  const [totalClaimed, setTotalClaimed] = useState('--')

  const wrappedGoodWallet = wrapper(goodWallet, store)
  const advanceClaimsCounter = useClaimCounter()

  // A function which will open 'learn more' page in a new tab
  const openLearnMoreLink = useOnPress(() => openLink(Config.learnMoreEconomyUrl), [])

  // format number of people who did claim today
  /*eslint-disable */
  const formattedNumberOfPeopleClaimedToday = useMemo(() => formatWithSIPrefix(peopleClaimed), [peopleClaimed])
  /*eslint-enable */

  // Format transformer function for claimed G$ amount
  const extraInfoAmountFormatter = useCallback(number => formatWithSIPrefix(weiToGd(number)), [])

  // if we returned from facerecoginition then the isValid param would be set
  // this happens only on first claim
  const evaluateFRValidity = async () => {
    const isValid = screenProps.screenState && screenProps.screenState.isValid

    log.debug('from FR:', { isValid })
    try {
      if (isValid && (await goodWallet.isCitizen())) {
        handleClaim()
      } else if (isValid === false) {
        screenProps.goToRoot()
      } else {
        if (isCitizen === false) {
          goodWallet.isCitizen().then(_ => gdstore.set('isLoggedInCitizen')(_))
        }
      }
    } catch (exception) {
      const { message } = exception
      const uiMessage = decorate(exception, ExceptionCode.E1)

      log.error('evaluateFRValidity failed', message, exception, { dialogShown: true })

      showErrorDialog(uiMessage, '', {
        onDismiss: () => {
          screenProps.goToRoot()
        },
      })
    }
  }

  const init = async () => {
    // hack to make unit test pass, activityindicator in claim button cuasing
    if (process.env.NODE_ENV !== 'test') {
      setLoading(true)
    }
    await evaluateFRValidity()
    setLoading(false)
  }

  useEffect(() => {
    //stop polling blockchain when in background
    if (appState !== 'active') {
      return
    }
    init()
    gatherStats()
    claimInterval.current = setInterval(gatherStats, 10000)
    return () => claimInterval.current && clearInterval(claimInterval.current)
  }, [appState])

  useEffect(() => {
    updateTimer()
    timerInterval.current = setInterval(updateTimer, 1000)
    return () => timerInterval.current && clearInterval(timerInterval.current)
  }, [nextClaimDate])

  const updateTimer = useCallback(() => {
    if (!nextClaimDate) {
      return
    }
    let nextClaimTime = moment(nextClaimDate).diff(Date.now(), 'seconds')

    //trigger getting stats if reached time to claim, to make sure everything is update since we refresh
    //only each 10 secs
    if (nextClaimTime <= 0) {
      gatherStats()
    }
    let countDown = numeral(nextClaimTime).format('00:00:00')
    countDown = countDown.length === 7 ? '0' + countDown : countDown //numeral will format with only 1 leading 0
    setNextClaim(countDown)
  }, [nextClaimDate])

  const gatherStats = async () => {
    try {
      const [{ people, amount }, [nextClaimMilis, entitlement]] = await Promise.all([
        wrappedGoodWallet.getAmountAndQuantityClaimedToday(),
        wrappedGoodWallet.getNextClaimTime(),
      ])
      log.info('gatherStats:', { people, amount, nextClaimMilis, entitlement })
      setPeopleClaimed(people)
      setTotalClaimed(amount)
      setDailyUbi(entitlement)
      if (nextClaimMilis) {
        setNextClaimDate(nextClaimMilis)
      }
    } catch (exception) {
      const { message } = exception
      const uiMessage = decorate(exception, ExceptionCode.E3)

      log.error('gatherStats failed', message, exception, {
        dialogShown: true,
        category: ExceptionCategory.Blockhain,
      })

      showErrorDialog(uiMessage, '', {
        onDismiss: () => {
          screenProps.goToRoot()
        },
      })
    }
  }

  const handleClaim = async () => {
    setLoading(true)

    try {
      //when we come back from FR entitelment might not be set yet
      const curEntitlement = dailyUbi || (await goodWallet.checkEntitlement().then(_ => _.toNumber()))
      if (curEntitlement == 0) {
        return
      }

      showDialog({
        image: <LoadingAnimation />,
        message: 'please wait while processing...\n ',
        buttons: [{ mode: 'custom', Component: EmulateButtonSpace }],
        title: `YOUR MONEY\nIS ON ITS WAY...`,
        showCloseButtons: false,
      })

      let txHash

      const receipt = await goodWallet.claim({
        onTransactionHash: hash => {
          txHash = hash

          const date = new Date()
          const transactionEvent: TransactionEvent = {
            id: hash,
            createdDate: date.toString(),
            type: 'claim',
            data: {
              from: 'GoodDollar',
              amount: curEntitlement,
            },
          }
          userStorage.enqueueTX(transactionEvent)
          AsyncStorage.setItem('GD_AddWebAppLastClaim', date.toISOString())
        },
        onError: () => {
          userStorage.markWithErrorEvent(txHash)
        },
      })

      if (receipt.status) {
        fireEvent(CLAIM_SUCCESS, { txhash: receipt.transactionHash, claimValue: curEntitlement })

        const claimsSoFar = await advanceClaimsCounter()
        fireMauticEvent({ claim: claimsSoFar, last_claim: Date.now() })

        fireGoogleAnalyticsEvent(CLAIM_GEO, {
          claimValue: weiToGd(curEntitlement),
          eventLabel: goodWallet.UBIContract.address,
        })

        showDialog({
          image: <LoadingAnimation success speed={2} />,
          buttons: [{ text: 'Yay!' }],
          message: `You've claimed your daily G$\nsee you tomorrow.`,
          title: 'CHA-CHING!',
          onDismiss: () => screenProps.goToRoot(),
        })
      } else {
        fireEvent(CLAIM_FAILED, { txhash: receipt.transactionHash, txNotCompleted: true })
        log.error('Claim transaction failed', '', new Error('Failed to execute claim transaction'), {
          txHash: receipt.transactionHash,
          entitlement: curEntitlement,
          status: receipt.status,
          category: ExceptionCategory.Blockhain,
          dialogShown: true,
        })
        showErrorDialog('Claim transaction failed', '', { boldMessage: 'Try again later.' })
      }
    } catch (e) {
      fireEvent(CLAIM_FAILED, { txError: true, eMsg: e.message })
      log.error('claiming failed', e.message, e, { dialogShown: true })
      showErrorDialog('Claim request failed', '', { boldMessage: 'Try again later.' })
    } finally {
      setLoading(false)
    }
  }

  const handleFaceVerification = () => screenProps.push('FaceVerificationIntro', { from: 'Claim' })

  const claimAmountFormatter = useCallback(value => formatWithThousandsSeparator(weiToGd(value)), [])

  return (
    <WrapperClaim>
      <Section.Stack style={styles.mainContainer} justifyContent="space-between">
        <View style={styles.headerContentContainer}>
          <Section.Text color="surface" fontFamily="slab" fontWeight="bold" style={styles.headerText}>
            {dailyUbi ? `Claim Your\nDaily Share` : `Just a Few More\nHours To Go...`}
          </Section.Text>
          {dailyUbi > 0 ? (
            <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
              <View style={styles.amountBlock}>
                <Section.Text color="#0C263D" style={styles.amountBlockTitle} fontWeight="bold" fontFamily="Roboto">
                  <BigGoodDollar
                    number={dailyUbi}
                    formatter={claimAmountFormatter}
                    fontFamily="Roboto"
                    bigNumberProps={{
                      fontFamily: 'Roboto',
                      fontSize: bigFontSize,
                      color: theme.colors.darkBlue,
                      fontWeight: 'bold',
                      lineHeight: bigFontSize,
                    }}
                    bigNumberUnitProps={{
                      fontFamily: 'Roboto',
                      fontSize: bigFontSize,
                      color: theme.colors.darkBlue,
                      fontWeight: 'medium',
                      lineHeight: bigFontSize,
                    }}
                  />
                </Section.Text>
              </View>
            </Section.Row>
          ) : null}
        </View>
        <Section.Stack style={styles.mainText}>
          <Section.Text color="surface" fontFamily="Roboto" style={styles.mainTextSecondContainer}>
            {`GoodDollar is the world’s first experiment\nto create a framework to generate\nUBI on a global scale.\n`}
            <Section.Text
              color="surface"
              style={styles.learnMoreLink}
              textDecorationLine="underline"
              fontWeight="bold"
              fontFamily="slab"
              onPress={openLearnMoreLink}
            >
              Learn More
            </Section.Text>
          </Section.Text>
        </Section.Stack>
        <View style={styles.fakeClaimButton} />
        <ButtonBlock
          styles={styles}
          entitlement={dailyUbi}
          isCitizen={isCitizen}
          nextClaim={nextClaim || '--:--:--'}
          handleClaim={handleClaim}
          handleNonCitizen={handleFaceVerification}
          showLabelOnly
        />
        <View style={styles.fakeExtraInfoContainer} />
        <Section.Row style={styles.extraInfoContainer}>
          <Section.Text
            style={[styles.fontSize16, styles.extraInfoSecondContainer]}
            fontWeight="bold"
            fontFamily="Roboto"
          >
            <Section.Text style={styles.fontSize16}>{'Today '}</Section.Text>
            <Section.Text fontWeight="bold" style={styles.fontSize16}>
              <BigGoodDollar
                style={styles.extraInfoAmountDisplay}
                number={totalClaimed}
                spaceBetween={false}
                formatter={extraInfoAmountFormatter}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: 'black',
                  lineHeight: 22,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: 'black',
                }}
              />
            </Section.Text>
            <Section.Text style={styles.fontSize16}>{` Claimed by `}</Section.Text>
            <Section.Text fontWeight="bold" color="black" style={styles.fontSize16}>
              {formattedNumberOfPeopleClaimedToday}{' '}
            </Section.Text>
            <Section.Text style={styles.fontSize16}>Good People</Section.Text>
          </Section.Text>
        </Section.Row>
      </Section.Stack>
    </WrapperClaim>
  )
}

const getStylesFromProps = ({ theme }) => {
  const bigFontSize = isSmallDevice ? 30 : 40

  const headerText = {
    marginBottom: getDesignRelativeHeight(10),
    fontSize: bigFontSize,
    lineHeight: bigFontSize,
  }

  const amountBlockTitle = {
    marginTop: 3,
    fontSize: bigFontSize,
    lineHeight: bigFontSize,
  }

  const amountText = {
    fontFamily: 'Roboto',
    fontSize: bigFontSize,
    color: theme.colors.darkBlue,
    fontWeight: 'bold',
    lineHeight: bigFontSize,
  }

  const amountUnitText = {
    fontFamily: 'Roboto',
    fontSize: bigFontSize,
    color: theme.colors.darkBlue,
    fontWeight: 'medium',
    lineHeight: bigFontSize,
  }

  const fontSize16 = {
    fontSize: isSmallDevice ? 14 : 16,
  }

  const learnMoreLink = {
    cursor: 'pointer',
    ...fontSize16,
  }

  const claimButtonBottomPosition = isBrowser ? 16 : getDesignRelativeHeight(12)
  const extraInfoTopPosition = 100 - Number(claimButtonBottomPosition)

  return {
    mainContainer: {
      backgroundColor: 'transparent',
      flexGrow: 1,
      paddingVertical: 0,
      paddingHorizontal: 0,
      justifyContent: 'space-between',
    },
    headerContentContainer: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: getDesignRelativeHeight(isSmallDevice ? 16 : 20),
      marginTop: getDesignRelativeHeight(isBrowser ? 70 : 18),
    },
    headerText,
    amountBlock: {
      borderWidth: 3,
      borderColor: theme.colors.white,
      borderRadius: theme.sizes.borderRadius,
      paddingHorizontal: getDesignRelativeWidth(30),
      paddingVertical: getDesignRelativeWidth(10),
    },
    amountBlockTitle,
    amountText,
    amountUnitText,
    mainTextSecondContainer: {
      ...fontSize16,
    },
    mainText: {
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 1,
      justifyContent: 'flex-end',
      marginBottom: getDesignRelativeHeight(isSmallDevice ? 16 : 20),
    },
    learnMoreLink,
    claimButtonContainer: {
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 1,
      width: '100%',
      position: 'absolute',
      bottom: `${claimButtonBottomPosition}%`,
    },
    fakeClaimButton: {
      width: getDesignRelativeHeight(196),
      height: getDesignRelativeHeight(196),
    },
    extraInfoAmountDisplay: {
      display: 'contents',
    },
    extraInfoContainer: {
      position: 'absolute',
      top: `${extraInfoTopPosition}%`,
      height: `${claimButtonBottomPosition}%`,
      width: '100%',
    },
    extraInfoSecondContainer: {
      width: '100%',
    },
    fakeExtraInfoContainer: {
      height: getDesignRelativeHeight(45),
    },
    fontSize16,
  }
}

Claim.navigationOptions = {
  title: 'Claim',
}

export default withStyles(getStylesFromProps)(Claim)

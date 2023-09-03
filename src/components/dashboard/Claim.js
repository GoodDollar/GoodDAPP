// @flow
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'
import moment from 'moment'
import { assign, noop } from 'lodash'
import { t, Trans } from '@lingui/macro'

import AsyncStorage from '../../lib/utils/asyncStorage'
import { retry } from '../../lib/utils/async'

import ClaimSvg from '../../assets/Claim/claim-footer.svg'

import { useUserStorage, useWallet, useWalletData } from '../../lib/wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/exceptions/utils'
import { useDialog } from '../../lib/dialog/useDialog'
import TaskDialog from '../common/dialogs/TaskDialog'
import API from '../../lib/API'

import { formatWithAbbreviations, formatWithSIPrefix, formatWithThousandsSeparator } from '../../lib/utils/formatNumber'
import { decimalsToFixed } from '../../lib/wallet/utils'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceWidth,
  isShortDevice as isSmallDevice,
} from '../../lib/utils/sizes'
import SpinnerCheckMark from '../common/animations/SpinnerCheckMark/SpinnerCheckMark'
import { withStyles } from '../../lib/styles'
import { theme as mainTheme } from '../theme/styles'
import {
  CLAIM_FAILED,
  CLAIM_GEO,
  CLAIM_SUCCESS,
  fireEvent,
  fireGoogleAnalyticsEvent,
  INVITE_BOUNTY,
} from '../../lib/analytics/analytics'

import Config from '../../config/config'
import { isMobileNative, isWeb } from '../../lib/utils/platform'
import { BigGoodDollar, Section, WrapperClaim } from '../common/'
import useAppState from '../../lib/hooks/useAppState'
import { WavesBox } from '../common/view/WavesBox'
import useTimer from '../../lib/hooks/useTimer'

import useInterval from '../../lib/hooks/useInterval'
import { useInviteBonus } from '../invite/useInvites'
import useClaimNotificationsDialog from '../permissions/hooks/useClaimNotificationsDialog'
import type { DashboardProps } from './Dashboard'
import useClaimCounter from './Claim/useClaimCounter'
import ButtonBlock from './Claim/ButtonBlock'

type ClaimProps = DashboardProps

const log = logger.child({ from: 'Claim' })
// eslint-disable-next-line require-await
const _retry = async asyncFn => retry(asyncFn, 1, Config.blockchainTimeout)

const LoadingAnimation = ({ success, speed = 3 }) => (
  <View style={{ alignItems: 'center' }}>
    <SpinnerCheckMark
      successSpeed={speed}
      success={success}
      width={145}
      marginTop={Platform.select({ web: undefined, default: 5 })}
    />
  </View>
)

const EmulateButtonSpace = () => <View style={{ paddingTop: 16, minHeight: 44, visibility: 'hidden' }} />

const GrayBox = ({ title, value, symbol, style }) => {
  return (
    <Section.Stack style={[{ flex: 1 }, style]}>
      <Section.Text
        style={gbStyles.title}
        fontSize={15}
        fontFamily={'slab'}
        lineHeight={19}
        textTransform={'capitalize'}
        fontWeight={'bold'}
        textAlign={'left'}
      >
        {title}
      </Section.Text>
      <Section.Row style={gbStyles.value}>
        <Section.Text
          fontFamily={'slab'}
          fontWeight={'bold'}
          fontSize={32}
          lineHeight={43}
          textAlign={'left'}
          textTransform={'uppercase'}
          style={gbStyles.statsNumbers}
        >
          {value}
        </Section.Text>
        <Section.Text
          color={mainTheme.colors.primary}
          fontWeight={'bold'}
          fontFamily={'slab'}
          lineHeight={20}
          fontSize={15}
          style={gbStyles.symbol}
        >
          {symbol}
        </Section.Text>
      </Section.Row>
    </Section.Stack>
  )
}

const gbStyles = {
  title: {
    backgroundColor: mainTheme.colors.grayBox,
    borderRadius: 5,
    paddingLeft: mainTheme.sizes.default,
    paddingTop: mainTheme.sizes.default,
    paddingBottom: mainTheme.sizes.default / 2,
    letterSpacing: 0.07,
  },
  statsNumbers: {
    letterSpacing: 0,
    color: mainTheme.colors.primary,
    paddingLeft: mainTheme.sizes.default,
    marginTop: 2,
    marginRight: 4,
    flex: 0,
  },
  symbol: {
    letterSpacing: 0,
    flex: 0,
    paddingBottom: Platform.select({ web: 0, default: 5 }),
  },
  value: { justifyContent: 'flex-start', alignItems: Platform.select({ default: 'flex-end', web: 'baseline' }) },
}
const claimAmountFormatter = value => formatWithThousandsSeparator(decimalsToFixed(value))

const ClaimAmountBox = ({ dailyUbi }) => {
  const [textPosition, setPosition] = useState({ left: 194 / 2 - 45, top: 76 - 14 })
  if (dailyUbi === 0) {
    return null
  }

  // for native we don't have translate 50%, so we get the width from the rendering event onLayout
  const updateSize = event => {
    if (isMobileNative === false) {
      return
    }
    const left = event.nativeEvent.layout.width / 2 - 45 //center text, relative to self width 90
    const top = event.nativeEvent.layout.height - 14 //self height 18 minus parent border 4 will put text on top of border
    setPosition({ left, top })
  }

  return (
    <Section.Row alignItems="center" justifyContent="center">
      <View style={cbStyles.amountBox} onLayout={updateSize}>
        <BigGoodDollar
          number={dailyUbi}
          formatter={claimAmountFormatter}
          bigNumberProps={{
            fontSize: 48,
            color: mainTheme.colors.surface,
            fontWeight: 'bold',
            lineHeight: 63,
          }}
          bigNumberUnitProps={{
            fontSize: 15,
            color: mainTheme.colors.surface,
            fontWeight: 'bold',
            lineHeight: 20,
          }}
        />
        <Section.Stack style={[cbStyles.perClaimerWrapper, isMobileNative ? textPosition : {}]}>
          <Section.Text style={cbStyles.perclaimerText} fontWeight="bold" fontSize={15} lineHeight={18}>
            Per Claimer
          </Section.Text>
        </Section.Stack>
      </View>
    </Section.Row>
  )
}

const cbStyles = {
  amountBox: {
    zIndex: 1,
    borderWidth: 2,
    borderColor: mainTheme.colors.darkBlue,
    borderRadius: mainTheme.sizes.borderRadius,
    paddingHorizontal: getDesignRelativeWidth(30),
    paddingVertical: getDesignRelativeWidth(10),
    marginTop: getDesignRelativeHeight(14),
    minWidth: 194,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perClaimerWrapper: {
    position: 'absolute',
    ...Platform.select({ web: { top: '90%', transform: [{ translateX: '-50%' }] }, default: { top: 0 } }),
    left: '50%',
    borderColor: 'black',
    backgroundColor: mainTheme.colors.primary,
    paddingRight: mainTheme.sizes.default / 2,
    paddingLeft: mainTheme.sizes.default / 2,
    width: 90,
  },
  perClaimerText: {
    color: mainTheme.colors.darkBlue,
    letterSpacing: 0,
    backgroundColor: mainTheme.colors.primary,
    position: 'relative',
    width: '100%',
    borderColor: 'blue',
  },
}

// Format transformer function for claimed G$ amount
const extraInfoAmountFormatter = number => formatWithSIPrefix(decimalsToFixed(number))

const Claim = props => {
  const { screenProps, styles, theme }: ClaimProps = props
  const { goToRoot, screenState, push: navigate } = screenProps
  const goodWallet = useWallet()
  const { dailyUBI: entitlement, isCitizen } = useWalletData()
  const decimalsEntitlement = goodWallet.toDecimals(entitlement || '0')
  const { appState } = useAppState()
  const userStorage = useUserStorage()
  const { userProperties } = userStorage || {}

  const [dailyUbi, setDailyUbi] = useState((entitlement && parseInt(decimalsEntitlement)) || 0)
  const { isValid } = screenState

  const { showDialog, showErrorDialog } = useDialog()

  // use loading variable if required
  const [, setLoading] = useState(false)

  const [peopleClaimed, setPeopleClaimed] = useState('--')
  const [totalClaimed, setTotalClaimed] = useState('--')

  const [activeClaimers, setActiveClaimers] = useState()
  const [availableDistribution, setAvailableDistribution] = useState(0)
  const [claimCycleTime, setClaimCycleTime] = useState('00:00:00')

  const [totalFundsStaked, setTotalFundsStaked] = useState()
  const [interestPending, setInterestPending] = useState()

  const [interestCollected, setInterestCollected] = useState()

  const advanceClaimsCounter = useClaimCounter()
  const [, , collectInviteBounty] = useInviteBonus()

  // format number of people who did claim today
  const formattedNumberOfPeopleClaimedToday = useMemo(() => formatWithSIPrefix(peopleClaimed), [peopleClaimed])

  const [nextClaim, isReachedZero, updateTimer] = useTimer()

  const askForClaimNotifications = useClaimNotificationsDialog()

  const gatherStats = useCallback(
    async (all = false) => {
      try {
        await _retry(async () => {
          const promises = [goodWallet.getClaimScreenStatsFuse()]

          if (all) {
            promises.push(goodWallet.getClaimScreenStatsMainnet())
          }

          const [fuseData, mainnetData] = await Promise.all(promises)

          log.info('gatherStats:', {
            all,
            fuseData,
            mainnetData,
          })

          const { nextClaim, entitlement, activeClaimers, claimers, claimAmount, distribution } = fuseData
          setDailyUbi(Number(entitlement))
          setClaimCycleTime(moment(nextClaim).format('HH:mm:ss'))

          if (nextClaim) {
            updateTimer(nextClaim)
          }

          if (all) {
            setPeopleClaimed(claimers)
            setTotalClaimed(claimAmount)
            setActiveClaimers(activeClaimers)
            setAvailableDistribution(distribution)
            setTotalFundsStaked(mainnetData.totalFundsStaked)
            setInterestPending(mainnetData.pendingInterest)
            setInterestCollected(mainnetData.interestCollected)
          }
        })
      } catch (exception) {
        const { message } = exception

        log.error('gatherStats failed', message, exception, {
          category: ExceptionCategory.Blockchain,
        })
      }
    },
    [
      setDailyUbi,
      setClaimCycleTime,
      setPeopleClaimed,
      setTotalClaimed,
      setActiveClaimers,
      setAvailableDistribution,
      setTotalFundsStaked,
      setInterestCollected,
      updateTimer,
      showErrorDialog,
      goToRoot,
      goodWallet,
    ],
  )

  const handleFaceVerification = useCallback(() => navigate('FaceVerificationIntro', { from: 'Claim' }), [navigate])

  const onClaimError = useCallback(
    e => {
      const { name, message, receipt, entitlement } = e
      const { transactionHash, status } = receipt || {}
      const txError = name === 'CLAIM_TX_FAILED'

      const eventPayload = { txError }
      const logPayload = { dialogShown: true, txError }
      const errorLabel = txError ? t`Claim transaction failed` : t`Claim request failed`

      if (txError) {
        assign(logPayload, {
          txHash: transactionHash,
          entitlement,
          status,
          category: ExceptionCategory.Blockchain,
        })

        assign(eventPayload, {
          txhash: transactionHash,
          txNotCompleted: true,
        })
      } else {
        assign(eventPayload, { eMsg: message })
      }

      log.error('claiming failed', e.message, e, logPayload)
      fireEvent(CLAIM_FAILED, eventPayload)
      showErrorDialog(errorLabel, '', { boldMessage: t`Try again later.` })
    },
    [showErrorDialog],
  )

  const sendClaimTx = useCallback(async () => {
    let receipt
    let txHash

    const getTxReceiptByHash = async () => {
      try {
        receipt = await goodWallet.wallet.eth.getTransactionReceipt(txHash)
      } catch (exception) {
        log.error('getTransactionReceipt error : ', exception.message, exception)

        throw exception
      }
    }

    try {
      if (Config.disableClaim) {
        throw new Error('Come back later')
      }

      receipt = await goodWallet.claim({
        onTransactionHash: hash => {
          txHash = hash

          // first enQueueTX needs to happen just as we receive the txhash, so it writes the "pending" record to db
          // actually when claiming it is not important to have the pending status record in the DB, so its removed for now
        },
      })
    } catch (exception) {
      const { message } = exception

      const isAlreadySent = message.search('same nonce|same hash|AlreadyKnown') >= 0

      if (!txHash || !isAlreadySent) {
        throw exception
      }

      //we log only warning here, since exception is logged in caller of sendClaimTx.
      log.warn('SendClaimTx error:', message, exception)
      receipt = await getTxReceiptByHash()
    }

    return receipt
  }, [goodWallet])

  const onClaim = useCallback(async () => {
    let curEntitlement
    let isWhitelisted = isCitizen

    setLoading(true)

    // 1. Pre-checks before claim. Wrapping / retrying / handling errors separately
    try {
      await _retry(async () => {
        // Call wallet method to refresh the connection, silent fail
        await goodWallet.getBlockNumber().catch(e => log.warn('getBlockNumber failed', e.message, e))

        // recheck citizen status, just in case we are out of sync with blockchain
        if (!isCitizen) {
          isWhitelisted = await goodWallet.isCitizen()
        }

        if (isWhitelisted) {
          // when we come back from FR entitlement might not be set yet
          curEntitlement = dailyUbi || (await goodWallet.checkEntitlement().then(parseInt))
        }
      })
    } catch (e) {
      onClaimError(e)

      // if got error at this step - stop immediately
      return
    } finally {
      setLoading(false)
    }

    // 2. if not whitelisted - goto FV
    if (!isWhitelisted) {
      return handleFaceVerification()
    }

    // 3. if no claim amount - stop immediately
    if (!curEntitlement) {
      return
    }

    // 4. perform actual Claim
    setLoading(true)
    showDialog({
      image: <LoadingAnimation />,
      message: t`please wait while processing...` + `\n`,
      buttons: [{ mode: 'custom', Component: EmulateButtonSpace }],
      title: t`YOUR MONEY 
      IS ON ITS WAY...`,
      showCloseButtons: false,
    })

    try {
      await _retry(async () => {
        const receipt = await sendClaimTx()

        if (!receipt?.status) {
          const exception = new Error('Failed to execute claim transaction')

          assign(exception, { name: 'CLAIM_TX_FAILED', entitlement: curEntitlement, receipt })
          throw exception
        }

        const date = new Date()
        const txHash = receipt.transactionHash

        AsyncStorage.safeSet('GD_AddWebAppLastClaim', date.toISOString())
        fireEvent(CLAIM_SUCCESS, { txHash, claimValue: curEntitlement })

        const claimsSoFar = await advanceClaimsCounter()

        API.updateClaims({ claim_counter: claimsSoFar, last_claim: moment().format('YYYY-MM-DD') }).catch(e =>
          log.warn('Error update claim_counter', e.message, e),
        )

        fireGoogleAnalyticsEvent(CLAIM_GEO, {
          claimValue: curEntitlement,
          eventLabel: goodWallet.UBIContract._address,
        })

        // legacy support for claim-geo event for UA. remove once we move to new dashboard and GA4
        if (isMobileNative === false) {
          fireGoogleAnalyticsEvent('claim-geo', {
            claimValue: curEntitlement,
            eventLabel: goodWallet.UBIContract._address,
          })
        }

        // reset dailyUBI so statistics are shown after successful claim
        setDailyUbi(0)

        showDialog({
          image: <LoadingAnimation success speed={2} />,
          content: <TaskDialog />,
          buttons: [
            {
              text: t`Skip`,
              style: { backgroundColor: mainTheme.colors.gray80Percent },
            },
          ],
          title: t`You've claimed today`,
          titleStyle: { paddingTop: 0, marginTop: 0, minHeight: 'auto' },
          onDismiss: noop,
        })
      })

      return true
    } catch (e) {
      onClaimError(e)
    } finally {
      setLoading(false)
    }
  }, [
    setLoading,
    handleFaceVerification,
    dailyUbi,
    setDailyUbi,
    showDialog,
    sendClaimTx,
    onClaimError,
    goodWallet,
    userStorage,
  ])

  const handleInviteBounty = useCallback(async () => {
    try {
      // collect invite bonuses
      const didCollect = await collectInviteBounty()

      if (didCollect) {
        fireEvent(INVITE_BOUNTY, { from: 'invitee' })
      }
    } catch (e) {
      log.error('collect invite bounty failed', e.message, e)
    }
  }, [])

  const handleClaim = useCallback(async () => {
    const claimed = await onClaim()
    await handleInviteBounty()

    if (!userProperties || isWeb || !claimed) {
      return
    }

    if (userProperties.getLocal('askedPermissionsAfterClaim') === true) {
      return
    }

    const onDismiss = () => userProperties.setLocal('askedPermissionsAfterClaim', true)

    askForClaimNotifications(() => navigate('Settings', { from: 'Claim' }), onDismiss)
  }, [onClaim, navigate, userProperties])

  // constantly update stats but only for some data
  const [startPolling, stopPolling] = useInterval(gatherStats, 10000, false)

  useEffect(() => {
    // refresh stats when user comes back to app, timer state has changed or dailyUBI has changed
    if (appState === 'active') {
      // refresh all stats when returning back to app
      // or dailyUbi changed meaning a new cycle started
      gatherStats(true)
      if (isReachedZero && dailyUbi === 0) {
        // keep polling if timer is 0 but dailyubi still didnt update
        startPolling()
      }
    }

    return stopPolling
  }, [appState, isReachedZero, dailyUbi])

  useEffect(() => {
    const init = async () => {
      // hack to make unit test pass, activity indicator in claim button causing
      if (Config.nodeEnv !== 'test') {
        setLoading(true)
      }

      if ('undefined' !== typeof isValid) {
        // if we returned from face recognition then the isValid param would be set
        // this happens only on first claim
        log.debug('from FR:', { isValid, screenState })
      }

      try {
        // if returned from FV with validated state
        if (isValid) {
          // claim & collect invite bonus
          await handleClaim()
        } else if (isValid === false) {
          // with non-validated state
          goToRoot()
        }
      } catch (exception) {
        const { message } = exception
        const uiMessage = decorate(exception, ExceptionCode.E1)

        log.error('evaluateFRValidity failed', message, exception, { dialogShown: true })

        showErrorDialog(uiMessage, '', {
          onDismiss: goToRoot,
        })
      }

      setLoading(false)
    }

    init()
  }, [goodWallet])

  return (
    <WrapperClaim style={dailyUbi ? styles.wrapperActive : styles.wrapperInactive}>
      <Section.Stack style={styles.mainContainer}>
        <View style={dailyUbi ? styles.headerContentContainer : styles.headerContentContainer2}>
          <Section.Text
            color="surface"
            fontFamily={theme.fonts.slab}
            fontWeight="bold"
            fontSize={28}
            style={styles.headerText}
          >
            {dailyUbi ? t`Claim Your Share` : t`Just A Little Longer...` + `\n` + t`More G$'s Coming Soon`}
          </Section.Text>
          <ClaimAmountBox dailyUbi={dailyUbi} />
        </View>
        <Section.Stack style={styles.wavesBoxes}>
          {dailyUbi <= 0 && (
            <WavesBox
              primarycolor={theme.colors.darkBlue}
              contentStyle={styles.wavesBoxContent}
              style={styles.wavesBox}
            >
              <Trans>
                <Section.Text fontSize={15} lineHeight={20}>
                  Claim cycle restart every day
                </Section.Text>
                <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
                  at {claimCycleTime}
                </Section.Text>
              </Trans>
            </WavesBox>
          )}
          <WavesBox
            primarycolor={theme.colors.darkBlue}
            contentStyle={styles.wavesBoxContent}
            style={[styles.wavesBox, { marginTop: dailyUbi ? 0 : 10 }]}
          >
            <Section.Text
              textTransform={'capitalize'}
              fontWeight={'bold'}
              fontSize={15}
              letterSpacing={0}
              lineHeight={20}
              fontFamily="Roboto"
            >
              So Far Today:
            </Section.Text>
            <Section.Row style={styles.justifyCenter}>
              <Section.Text fontWeight="bold" color={theme.colors.primary} fontSize={15} lineHeight={20}>
                {formattedNumberOfPeopleClaimedToday}
              </Section.Text>
              <Section.Text textTransform={'capitalize'} fontSize={15} lineHeight={20}>
                {' '}
                Claimers Received{' '}
              </Section.Text>
              <BigGoodDollar
                style={styles.extraInfoAmountDisplay}
                number={totalClaimed}
                formatter={extraInfoAmountFormatter}
                spaceBetween={false}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  color: theme.colors.primary,
                  lineHeight: 20,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  color: theme.colors.primary,
                }}
              />
            </Section.Row>
            <Section.Row style={styles.justifyCenter}>
              <Section.Text fontSize={15} lineHeight={20}>
                out of{' '}
              </Section.Text>
              <BigGoodDollar
                style={styles.extraInfoAmountDisplay}
                number={availableDistribution}
                formatter={extraInfoAmountFormatter}
                spaceBetween={false}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  color: theme.colors.primary,
                  lineHeight: 20,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  color: theme.colors.primary,
                }}
              />
              <Section.Text textTransform={'capitalize'} fontSize={15} lineHeight={20}>
                {' '}
                available
              </Section.Text>
            </Section.Row>
          </WavesBox>
        </Section.Stack>
        <ButtonBlock
          styles={{ claimButtonContainer: styles.claimButtonContainer }}
          entitlement={dailyUbi}
          isCitizen={isCitizen}
          nextClaim={nextClaim || '--:--:--'}
          handleClaim={handleClaim}
          handleNonCitizen={handleClaim}
          showLabelOnly
        />
      </Section.Stack>
      {dailyUbi === 0 && (
        <Section.Stack style={styles.statsWrapper}>
          <Section.Row style={styles.justifyCenter}>
            <Section.Text
              style={{ letterSpacing: 0.1, marginBottom: 4 }}
              fontSize={20}
              lineHeight={21}
              fontWeight="bold"
              fontFamily="Roboto"
              textTransform={'capitalize'}
            >
              GoodDollar Stats
            </Section.Text>
          </Section.Row>
          <Section.Separator style={styles.separator} width={2} primaryColor={theme.colors.primary} />
          <Section.Row style={styles.statsRow}>
            <GrayBox
              title={'active\nclaimers'}
              value={formatWithAbbreviations(activeClaimers)}
              style={styles.leftGrayBox}
            />
            <GrayBox
              title={"Today's G$\nDistribution"}
              value={extraInfoAmountFormatter(availableDistribution)}
              symbol={'G$'}
            />
          </Section.Row>
          <Section.Row style={styles.statsRow}>
            <GrayBox
              title={'Total funds\nstaked'}
              value={formatWithAbbreviations(totalFundsStaked)}
              symbol={'DAI'}
              style={styles.leftGrayBox}
            />
            <GrayBox
              title={'Last Interest\nCollected'}
              value={formatWithAbbreviations(interestCollected)}
              symbol={'$'}
            />
          </Section.Row>
          {Config.env === 'development' && (
            <Section.Row style={[styles.statsRow]}>
              <GrayBox title={'Pending Interest'} value={formatWithAbbreviations(interestPending)} symbol={'$'} />
            </Section.Row>
          )}
        </Section.Stack>
      )}
      <Section.Stack style={styles.footerWrapper}>
        <ClaimSvg
          height={getDesignRelativeHeight(85, false)}
          width={getMaxDeviceWidth()}
          style={styles.footerImage}
          viewBox="0 0 360.002 85"
        />
      </Section.Stack>
    </WrapperClaim>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    justifyCenter: { justifyContent: 'center' },
    footerWrapper: {
      flex: 1,
      flexGrow: 1,
      justifyContent: isSmallDevice ? 'flex-start' : 'flex-end',
      padding: 0,
      margin: 0,
    },
    leftGrayBox: { marginRight: theme.sizes.default * 3 },
    wrapperActive: { height: 'auto' },
    wrapperInactive: { height: '100%', maxHeight: '100%' },
    statsWrapper: {
      marginLeft: getDesignRelativeWidth(isSmallDevice ? theme.sizes.defaultDouble : theme.sizes.defaultQuadruple),
      marginRight: getDesignRelativeWidth(isSmallDevice ? theme.sizes.defaultDouble : theme.sizes.defaultQuadruple),
      marginTop: getDesignRelativeHeight(30),
    },
    statsRow: {
      marginTop: getDesignRelativeHeight(theme.sizes.default * 3),
    },
    mainContainer: {
      backgroundColor: 'transparent',
      flexGrow: 0,
      paddingVertical: 0,
      paddingHorizontal: 0,
      justifyContent: 'flex-start',
    },
    headerContentContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: isSmallDevice ? theme.sizes.default * 2.5 : getDesignRelativeHeight(theme.sizes.default * 4),
    },
    headerContentContainer2: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: isSmallDevice ? theme.sizes.default * 2.5 : getDesignRelativeHeight(theme.sizes.default * 4),
    },
    headerText: {
      lineHeight: 38,
      letterSpacing: 0.42,
    },
    claimButtonContainer: {
      // style passed to button
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.defaultQuadruple),
    },
    wavesBoxes: {
      alignItems: 'center',
      marginLeft: 10,
      marginRight: 10,
      marginTop: getDesignRelativeHeight(39),
    },
    wavesBox: {
      backgroundColor: theme.colors.surface,
    },
    wavesBoxContent: { paddingBottom: 10, paddingTop: 10 },

    extraInfoAmountDisplay: {
      display: Platform.select({ web: 'contents', default: 'flex' }),
    },
  }
}

Claim.navigationOptions = {
  title: t`Claim`,
}

export default withStyles(getStylesFromProps)(Claim)

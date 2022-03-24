// @flow
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'
import moment from 'moment'
import { noop } from 'lodash'
import { t, Trans } from '@lingui/macro'
import AsyncStorage from '../../lib/utils/asyncStorage'

import ClaimSvg from '../../assets/Claim/claim-footer.svg'

// import useOnPress from '../../lib/hooks/useOnPress'
// import { isBrowser } from '../../lib/utils/platform'
import userStorage, { type TransactionEvent } from '../../lib/userStorage/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/exceptions/utils'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import wrapper from '../../lib/undux/utils/wrapper'
import API from '../../lib/API/api'

// import { openLink } from '../../lib/utils/linking'
import { formatWithAbbreviations, formatWithSIPrefix, formatWithThousandsSeparator } from '../../lib/utils/formatNumber'
import { weiToGd } from '../../lib/wallet/utils'
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
import { isMobileNative } from '../../lib/utils/platform'
import { BigGoodDollar, Section, WrapperClaim } from '../common/'
import useAppState from '../../lib/hooks/useAppState'
import { WavesBox } from '../common/view/WavesBox'
import useTimer from '../../lib/hooks/useTimer'

import useInterval from '../../lib/hooks/useInterval'
import { useInviteBonus } from '../invite/useInvites'
import { UserContext } from '../../lib/contexts/userContext'
import { useLoggedIn } from '../../lib/hooks/useLoggedIn'
import { useAccount } from '../../lib/hooks/useAccount'
import type { DashboardProps } from './Dashboard'
import useClaimCounter from './Claim/useClaimCounter'
import ButtonBlock from './Claim/ButtonBlock'

type ClaimProps = DashboardProps

const log = logger.child({ from: 'Claim' })

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
const claimAmountFormatter = value => formatWithThousandsSeparator(weiToGd(value))

const ClaimAmountBox = ({ dailyUbi }) => {
  const [textPosition, setPosition] = useState({ left: 194 / 2 - 45, top: 76 - 14 })
  if (dailyUbi === 0) {
    return null
  }

  //for native we don't have translate 50%, so we get the width from the rendering event onLayout
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

const Claim = props => {
  const { screenProps, styles, theme }: ClaimProps = props
  const { goToRoot, screenState, push: navigate } = screenProps
  const { isLoggedInCitizen: isCitizen } = useLoggedIn()
  const { updateIsLoggedInCitizen } = useContext(UserContext)

  const { appState } = useAppState()
  const store = SimpleStore.useStore()

  const { entitlement } = useAccount()
  const [dailyUbi, setDailyUbi] = useState((entitlement && parseInt(entitlement)) || 0)
  const { isValid } = screenState

  const [showDialog, , showErrorDialog] = useDialog()

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

  const wrappedGoodWallet = wrapper(goodWallet, store)
  const advanceClaimsCounter = useClaimCounter()
  const [, , collectInviteBounty] = useInviteBonus()

  // A function which will open 'learn more' page in a new tab
  // const openLearnMoreLink = useOnPress(() => openLink(Config.learnMoreEconomyUrl), [])

  // format number of people who did claim today
  const formattedNumberOfPeopleClaimedToday = useMemo(() => formatWithSIPrefix(peopleClaimed), [peopleClaimed])

  // Format transformer function for claimed G$ amount
  const extraInfoAmountFormatter = useCallback(number => formatWithSIPrefix(weiToGd(number)), [])

  const [nextClaim, isReachedZero, updateTimer] = useTimer()

  const gatherStats = useCallback(
    async (all = false) => {
      try {
        const promises = [wrappedGoodWallet.getClaimScreenStatsFuse()]

        if (all) {
          promises.push(wrappedGoodWallet.getClaimScreenStatsMainnet())
        }

        const [fuseData, mainnetData] = await Promise.all(promises)

        log.info('gatherStats:', {
          all,
          fuseData,
          mainnetData,
        })

        const { nextClaim, entitlement, activeClaimers, claimers, claimAmount, distribution } = fuseData
        setDailyUbi(entitlement)
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
      } catch (exception) {
        const { message } = exception
        const uiMessage = decorate(exception, ExceptionCode.E3)

        log.error('gatherStats failed', message, exception, {
          dialogShown: true,
          category: ExceptionCategory.Blockchain,
        })

        showErrorDialog(uiMessage, '', {
          onDismiss: goToRoot,
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
    ],
  )

  const handleFaceVerification = useCallback(() => navigate('FaceVerificationIntro', { from: 'Claim' }), [navigate])

  const handleClaim = useCallback(async () => {
    setLoading(true)

    try {
      //recheck citizen status, just in case we are out of sync with blockchain
      if (!isCitizen) {
        const isCitizenRecheck = await goodWallet.isCitizen()

        if (!isCitizenRecheck) {
          return handleFaceVerification()
        }
      }

      //when we come back from FR entitlement might not be set yet
      const curEntitlement = dailyUbi || (await goodWallet.checkEntitlement().then(parseInt))

      if (!curEntitlement) {
        return
      }

      showDialog({
        image: <LoadingAnimation />,
        message: t`please wait while processing...` + `\n`,
        buttons: [{ mode: 'custom', Component: EmulateButtonSpace }],
        title: t`YOUR MONEY` + `\n` + t`IS ON ITS WAY...`,
        showCloseButtons: false,
      })

      const receipt = await goodWallet.claim()

      if (receipt.status) {
        const txHash = receipt.transactionHash
        const date = new Date()
        const transactionEvent: TransactionEvent = {
          id: txHash,
          date: date.toISOString(),
          createdDate: date.toISOString(),
          type: 'claim',
          data: {
            from: 'GoodDollar',
            amount: curEntitlement,
          },
        }

        userStorage.enqueueTX(transactionEvent)
        AsyncStorage.setItem('GD_AddWebAppLastClaim', date.toISOString())
        fireEvent(CLAIM_SUCCESS, { txHash, claimValue: curEntitlement })

        const claimsSoFar = await advanceClaimsCounter()

        API.updateClaims({ claim_counter: claimsSoFar, last_claim: moment().format('YYYY-MM-DD') })
        fireGoogleAnalyticsEvent(CLAIM_GEO, {
          claimValue: weiToGd(curEntitlement),
          eventLabel: goodWallet.UBIContract._address,
        })

        // legacy support for claim-geo event for UA. remove once we move to new dashboard and GA4
        if (isMobileNative === false) {
          fireGoogleAnalyticsEvent('claim-geo', {
            claimValue: weiToGd(curEntitlement),
            eventLabel: goodWallet.UBIContract._address,
          })
        }

        // reset dailyUBI so statistics are shown after successful claim
        setDailyUbi(0)

        showDialog({
          image: <LoadingAnimation success speed={2} />,
          buttons: [{ text: t`Yay!` }],
          message: t`You've claimed your daily G$` + `\n` + t`see you tomorrow.`,
          title: t`CHA-CHING!`,
          onDismiss: noop,
        })

        // collect invite bonuses
        const didCollect = await collectInviteBounty()
        if (didCollect) {
          fireEvent(INVITE_BOUNTY, { from: 'invitee' })
        }
      } else {
        fireEvent(CLAIM_FAILED, { txhash: receipt.transactionHash, txNotCompleted: true })
        showErrorDialog(t`Claim transaction failed`, '', { boldMessage: t`Try again later.` })

        log.error('Claim transaction failed', '', new Error('Failed to execute claim transaction'), {
          txHash: receipt.transactionHash,
          entitlement: curEntitlement,
          status: receipt.status,
          category: ExceptionCategory.Blockchain,
          dialogShown: true,
        })
      }
    } catch (e) {
      fireEvent(CLAIM_FAILED, { txError: true, eMsg: e.message })
      showErrorDialog(t`Claim request failed`, '', { boldMessage: t`Try again later.` })

      log.error('claiming failed', e.message, e, { dialogShown: true })
    } finally {
      setLoading(false)
    }
  }, [setLoading, handleFaceVerification, dailyUbi, setDailyUbi, showDialog, showErrorDialog])

  // constantly update stats but only for some data
  const [startPolling, stopPolling] = useInterval(gatherStats, 10000, false)

  useEffect(() => {
    // refresh stats when user comes back to app, timer state has changed or dailyUBI has changed
    if (appState === 'active') {
      // refresh all stats when returning back to app
      // or dailyUbi changed meaning a new cycle started
      gatherStats(true)
      if (isReachedZero && dailyUbi === 0) {
        //keep polling if timer is 0 but dailyubi still didnt update
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
        } else {
          // opened claim page (non-returned from FV)
          if (isCitizen === false) {
            goodWallet.isCitizen().then(_ => updateIsLoggedInCitizen(_))
          }
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
  }, [])

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
                spaceBetween={false}
                formatter={extraInfoAmountFormatter}
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
                spaceBetween={false}
                formatter={extraInfoAmountFormatter}
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
      //style passed to button
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
  title: 'Claim',
}

export default withStyles(getStylesFromProps)(Claim)

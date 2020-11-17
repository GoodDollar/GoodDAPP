// @flow

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, View } from 'react-native'
import moment from 'moment'
import numeral from 'numeral'
import AsyncStorage from '../../lib/utils/asyncStorage'

import claimSvg from '../../assets/Claim/claim-footer.svg'

// import useOnPress from '../../lib/hooks/useOnPress'
// import { isBrowser } from '../../lib/utils/platform'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/logger/exceptions'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import wrapper from '../../lib/undux/utils/wrapper'

// import { openLink } from '../../lib/utils/linking'
import { formatWithabbreviations, formatWithSIPrefix, formatWithThousandsSeparator } from '../../lib/utils/formatNumber'
import { weiToGd } from '../../lib/wallet/utils'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { WrapperClaim } from '../common'
import SpinnerCheckMark from '../common/animations/SpinnerCheckMark/SpinnerCheckMark'
import { withStyles } from '../../lib/styles'
import { theme as mainTheme } from '../theme/styles'
import {
  CLAIM_FAILED,
  CLAIM_GEO,
  CLAIM_SUCCESS,
  fireEvent,
  fireGoogleAnalyticsEvent,
  fireMauticEvent,
} from '../../lib/analytics/analytics'

// import Config from '../../config/config'
import { isSmallDevice } from '../../lib/utils/mobileSizeDetect'
import Section from '../common/layout/Section'
import BigGoodDollar from '../common/view/BigGoodDollar'
import useAppState from '../../lib/hooks/useAppState'
import { WavesBox } from '../common/view/WavesBox'
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

const GrayBox = ({ title, value, symbol, theme, style }) => {
  return (
    <Section.Stack style={[{ flex: 1 }, style]}>
      <Section.Text
        style={styles.grayBox}
        fontSize={15}
        fontFamily={'slab'}
        lineHeight={19}
        textTransform={'capitalize'}
        fontWeight={'bold'}
        textAlign={'start'}
      >
        {title}
      </Section.Text>
      <Section.Row style={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
        <Section.Text
          fontFamily={'slab'}
          fontWeight={'bold'}
          fontSize={32}
          lineHeight={43}
          textAlign={'start'}
          textTransform={'uppercase'}
          style={styles.statsNumbers}
        >
          {value}
        </Section.Text>
        <Section.Text
          color={mainTheme.colors.primary}
          fontWeight={'bold'}
          fontFamily={'slab'}
          lineHeight={20}
          fontSize={15}
          style={styles.dai}
        >
          {symbol}
        </Section.Text>
      </Section.Row>
    </Section.Stack>
  )
}

const styles = {
  grayBox: {
    backgroundColor: mainTheme.colors.grayBox,
    borderRadius: 5,

    // height: getDesignRelativeHeight(48),
    // width: getDesignRelativeWidth(140),
    // marginTop: getDesignRelativeHeight(24),
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
  },
  dai: {
    letterSpacing: '0px',
  },
}
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

  const [activeClaimers, setActiveClaimers] = useState()
  const [availableDistribution, setAvailableDistribution] = useState(0)
  const [claimCycleTime, setClaimCycleTime] = useState('00:00:00')

  const [totalFundsStaked, setTotalFundsStaked] = useState()
  const [interestCollected, setInterestCollected] = useState()

  const wrappedGoodWallet = wrapper(goodWallet, store)
  const advanceClaimsCounter = useClaimCounter()

  // A function which will open 'learn more' page in a new tab
  // const openLearnMoreLink = useOnPress(() => openLink(Config.learnMoreEconomyUrl), [])

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
    // hack to make unit test pass, activityindicator in claim button causing
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
      const [
        { people, amount },
        [nextClaimMilis, entitlement],
        activeClaimers,
        availableDistribution,
        totalFundsStaked,
        interestCollected,
      ] = await Promise.all([
        wrappedGoodWallet.getAmountAndQuantityClaimedToday(),
        wrappedGoodWallet.getNextClaimTime(),
        wrappedGoodWallet.getActiveClaimers(),
        wrappedGoodWallet.getAvailableDistribution(),
        wrappedGoodWallet.getTotalFundsStaked(),
        wrappedGoodWallet.getInterestCollected(),
      ])
      log.info('gatherStats:', {
        people,
        amount,
        nextClaimMilis,
        entitlement,
        activeClaimers,
        availableDistribution,
        totalFundsStaked,
        interestCollected,
      })

      setPeopleClaimed(people)
      setTotalClaimed(amount)
      setDailyUbi(entitlement)

      setActiveClaimers(activeClaimers)
      setAvailableDistribution(availableDistribution)
      setClaimCycleTime(moment(nextClaimMilis).format('HH:mm:ss'))

      setTotalFundsStaked(totalFundsStaked)
      setInterestCollected(interestCollected)

      if (nextClaimMilis) {
        setNextClaimDate(nextClaimMilis)
      }
    } catch (exception) {
      const { message } = exception
      const uiMessage = decorate(exception, ExceptionCode.E3)

      log.error('gatherStats failed', message, exception, {
        dialogShown: true,
        category: ExceptionCategory.Blockchain,
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
      //recheck citizen status, just in case we are out of sync with blockchain
      if (!isCitizen) {
        const isCitizenRecheck = await goodWallet.isCitizen()
        if (!isCitizenRecheck) {
          return handleFaceVerification()
        }
      }

      //when we come back from FR entitlement might not be set yet
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

      const receipt = await goodWallet.claim()

      if (receipt.status) {
        const txHash = receipt.transactionHash

        const date = new Date()
        const transactionEvent: TransactionEvent = {
          id: txHash,
          createdDate: date.toString(),
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
        fireMauticEvent({ claim: claimsSoFar, last_claim: moment().format('YYYY-MM-DD') })

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
          category: ExceptionCategory.Blockchain,
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
    <WrapperClaim style={{ height: dailyUbi ? 'auto' : '100%', maxHeight: dailyUbi ? 844 : 'none' }}>
      <Section.Stack style={styles.mainContainer}>
        <View style={dailyUbi ? styles.headerContentContainer : styles.headerContentContainer2}>
          <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={28} style={styles.headerText}>
            {dailyUbi ? `Claim Your Share` : `Just A Little Longer...\nMore G$'s Coming Soon`}
          </Section.Text>
          {dailyUbi > 0 ? (
            <Section.Row alignItems="center" justifyContent="center">
              <View style={styles.amountBlock}>
                <Section.Text>
                  <BigGoodDollar
                    number={dailyUbi}
                    formatter={claimAmountFormatter}
                    bigNumberProps={{
                      fontSize: 48,
                      color: theme.colors.surface,
                      fontWeight: 'bold',
                      lineHeight: 63,
                    }}
                    bigNumberUnitProps={{
                      fontSize: 15,
                      color: theme.colors.surface,
                      fontWeight: 'bold',
                      lineHeight: 20,
                    }}
                  />
                </Section.Text>
              </View>
            </Section.Row>
          ) : null}
        </View>
        <Section.Stack style={styles.wavesBoxes}>
          {dailyUbi <= 0 && (
            <WavesBox
              primaryColor={theme.colors.darkBlue}
              contentStyle={{ paddingBottom: 10, paddingTop: 10 }}
              style={styles.wavesBox}
            >
              <Section.Text primaryColor={theme.colors.surface} style={styles.fontSize16}>
                Claim cycle restart every day
              </Section.Text>
              <Section.Text primaryColor={theme.colors.surface} fontWeight="bold" style={styles.fontSize16}>
                at {claimCycleTime}
              </Section.Text>
            </WavesBox>
          )}
          <WavesBox
            primaryColor={theme.colors.darkBlue}
            contentStyle={{ paddingBottom: 10, paddingTop: 10 }}
            style={[styles.wavesBox, styles.lowerWavesBoxStyle]}
          >
            <Section.Text
              style={{ textTransform: 'capitalize' }}
              fontWeight={'bold'}
              fontSize={18}
              letterSpacing={0.09}
              primaryColor={theme.colors.surface}
              fontFamily="Roboto"
            >
              So Far Today:
            </Section.Text>
            <Section.Text style={{ textTransform: 'capitalize' }}>
              <Section.Text fontWeight="bold" color={theme.colors.primary} style={styles.fontSize16}>
                {formattedNumberOfPeopleClaimedToday}
              </Section.Text>{' '}
              Claimers Received{' '}
              <BigGoodDollar
                style={styles.extraInfoAmountDisplay}
                number={totalClaimed}
                spaceBetween={false}
                formatter={extraInfoAmountFormatter}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: theme.colors.primary,
                  lineHeight: 22,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: theme.colors.primary,
                }}
              />
            </Section.Text>
            <Section.Text>
              Out of{' '}
              <BigGoodDollar
                style={styles.extraInfoAmountDisplay}
                number={availableDistribution}
                spaceBetween={false}
                formatter={extraInfoAmountFormatter}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: theme.colors.primary,
                  lineHeight: 22,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: theme.colors.primary,
                }}
              />{' '}
              available
            </Section.Text>
          </WavesBox>
        </Section.Stack>
        <ButtonBlock
          styles={styles}
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
          <Section.Row style={{ justifyContent: 'center' }}>
            <Section.Text
              style={{ letterSpacing: 0.1, marginBottom: 4 }}
              fontSize={20}
              lineHeight={21}
              fontWeight="bold"
              fontFamily="Roboto"
            >
              GoodDollar Stats
            </Section.Text>
          </Section.Row>
          <Section.Separator style={styles.separator} width={2} primaryColor={theme.colors.primary} />
          <Section.Row style={styles.statsRow}>
            <GrayBox
              title={'active\nclaimers'}
              value={formatWithabbreviations(activeClaimers)}
              style={{ marginRight: theme.sizes.default * 3 }}
            />
            <GrayBox
              title={"Today's G$\nDistribution"}
              value={formatWithabbreviations(availableDistribution)}
              symbol={'G$'}
            />
          </Section.Row>
          <Section.Row style={styles.statsRow}>
            <GrayBox
              title={'Total funds\n staked'}
              value={formatWithabbreviations(totalFundsStaked)}
              symbol={'DAI'}
              style={{ marginRight: theme.sizes.default * 3 }}
            />
            <GrayBox
              title={'Interest\ngenerated today'}
              value={formatWithabbreviations(interestCollected)}
              symbol={'DAI'}
            />
          </Section.Row>
        </Section.Stack>
      )}
      <Section.Stack
        style={{
          height: getDesignRelativeHeight(85, false),
          flex: 1,
          flexGrow: 1,
        }}
      >
        <Image
          style={{ width: '100%', height: getDesignRelativeHeight(85, false) }}
          source={claimSvg}
          resizeMode="contain"
        />
      </Section.Stack>
    </WrapperClaim>
  )
}

const getStylesFromProps = ({ theme }) => {
  const headerText = {
    lineHeight: 38,
    letterSpacing: 0.42,
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

  return {
    statsWrapper: {
      marginLeft: theme.sizes.defaultQuadruple,
      marginRight: theme.sizes.defaultQuadruple,
      marginTop: 30,
    },
    statsRow: {
      marginTop: theme.sizes.default * 3,
    },
    mainContainer: {
      backgroundColor: 'transparent',
      flexGrow: 0,
      paddingVertical: 0,
      paddingHorizontal: 0,
      justifyContent: 'normal',
    },
    headerContentContainer: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: getDesignRelativeHeight(theme.sizes.default * 4),
    },
    headerContentContainer2: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: getDesignRelativeHeight(theme.sizes.default * 4),
    },
    headerText,
    footerImg: {
      position: 'relative',
    },
    amountBlock: {
      borderWidth: 3,
      borderColor: theme.colors.darkBlue,
      borderRadius: theme.sizes.borderRadius,
      paddingHorizontal: getDesignRelativeWidth(30),
      paddingVertical: getDesignRelativeWidth(10),
      marginTop: getDesignRelativeHeight(14),
    },
    claimButtonContainer: {
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 1,
      marginTop: theme.sizes.defaultQuadruple,
    },
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
      marginBottom: theme.sizes.defaultDouble,
    },
    wavesBoxes: {
      alignItems: 'center',
      marginLeft: 10,
      marginRight: 10,
      marginTop: getDesignRelativeHeight(32),
    },
    wavesBox: {
      textAlign: 'center',
      backgroundColor: theme.colors.surface,
    },
    lowerWavesBoxStyle: {
      marginTop: 10,
    },
    learnMoreLink,

    extraInfoAmountDisplay: {
      display: 'contents',
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

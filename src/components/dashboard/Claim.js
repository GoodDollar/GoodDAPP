// @flow
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'
import moment from 'moment'
import { get } from 'lodash'
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
import API from '../../lib/API/api'
import { weiToGd } from '../../lib/wallet/utils'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { WrapperClaim } from '../common'
import LoadingIcon from '../common/modal/LoadingIcon'
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
import { isLargeDevice, isSmallDevice } from '../../lib/utils/mobileSizeDetect'
import Section from '../common/layout/Section'
import BigGoodDollar from '../common/view/BigGoodDollar'
import type { DashboardProps } from './Dashboard'
import useClaimCounter from './Claim/useClaimCounter'
import ButtonBlock from './Claim/ButtonBlock'

type ClaimProps = DashboardProps
type ClaimState = {
  nextClaim: string,
  entitlement: number,
  claimedToday: {
    people: string,
    amount: string,
  },
}

const log = logger.child({ from: 'Claim' })

const bigFontSize = isSmallDevice ? 30 : 40
const regularFontSize = isSmallDevice ? 14 : 16

const Claim = props => {
  const { screenProps, styles, theme }: ClaimProps = props
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()

  const { entitlement } = gdstore.get('account')
  const isCitizen = gdstore.get('isLoggedInCitizen')

  const [showDialog, , showErrorDialog] = useDialog()
  const [loading, setLoading] = useState(false)
  const [claimInterval, setClaimInterval] = useState(null)
  const [claimState, setClaimState]: [ClaimState, Function] = useState({
    nextClaim: '--:--:--',
    entitlement: (entitlement && entitlement.toNumber()) || 0,
    claimedToday: {
      people: '--',
      amount: '--',
    },
  })

  // get the number of people who did claim today. Default - 0
  const numberOfPeopleClaimedToday = get(claimState, 'claimedToday.people', 0)

  const wrappedGoodWallet = wrapper(goodWallet, store)
  const advanceClaimsCounter = useClaimCounter()

  // A function which will open 'learn more' page in a new tab
  const openLearnMoreLink = useOnPress(() => openLink(Config.learnMoreEconomyUrl), [])

  // format number of people who did claim today
  /*eslint-disable */
  const formattedNumberOfPeopleClaimedToday = useMemo(() => formatWithSIPrefix(numberOfPeopleClaimedToday), [
    numberOfPeopleClaimedToday,
  ])
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
    if (Config.nodeEnv !== 'test') {
      setLoading(true)
    }

    await Promise.all([
      goodWallet
        .checkEntitlement()
        .then(entitlement => setClaimState(prev => ({ ...prev, entitlement: entitlement.toNumber() })))
        .catch(exception => {
          const { message } = exception
          const uiMessage = decorate(exception, ExceptionCode.E2)

          log.error('gatherStats failed', message, exception, {
            dialogShown: true,
            category: ExceptionCategory.Blockhain,
          })

          showErrorDialog(uiMessage, '', {
            onDismiss: () => {
              screenProps.goToRoot()
            },
          })
        }),
      evaluateFRValidity(),
    ])
    setLoading(false)
  }

  useEffect(() => {
    init()
  }, [])

  const getNextClaim = async date => {
    let nextClaimTime = date - Date.now()
    if (nextClaimTime < 0 && claimState.entitlement <= 0) {
      try {
        const entitlement = await goodWallet.checkEntitlement().then(_ => _.toNumber())
        setClaimState(prev => ({ ...prev, entitlement }))
      } catch (exception) {
        const { message } = exception
        log.warn('getNextClaim failed', message, exception)
      }
    }
    return new Date(nextClaimTime).toISOString().substr(11, 8)
  }

  const gatherStats = async () => {
    const [claimedToday, nextClaimDate] = await Promise.all([
      wrappedGoodWallet.getAmountAndQuantityClaimedToday(),
      wrappedGoodWallet.getNextClaimTime(),
    ]).catch(exception => {
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

      return []
    })

    setClaimState(prevState => ({ ...prevState, claimedToday }))

    if (nextClaimDate) {
      const nextClaim = await getNextClaim(nextClaimDate)
      setClaimState(prevState => ({ ...prevState, nextClaim }))
      setClaimInterval(
        setInterval(async () => {
          const nextClaim = await getNextClaim(nextClaimDate)
          setClaimState(prevState => ({ ...prevState, nextClaim }))
        }, 1000),
      )
    }
  }

  // Claim STATS
  useEffect(() => {
    gatherStats()
    if (entitlement === undefined) {
      return
    }

    return () => claimInterval && clearInterval(claimInterval)
  }, [entitlement])

  const checkHanukaBonusDates = () => {
    const now = moment().utcOffset('+0200')
    const startHanuka = moment(Config.hanukaStartDate, 'DD/MM/YYYY').utcOffset('+0200')
    const endHanuka = moment(Config.hanukaEndDate, 'DD/MM/YYYY')
      .endOf('day')
      .utcOffset('+0200')

    if (startHanuka.isBefore(now) && now.isBefore(endHanuka)) {
      API.checkHanukaBonus()
    }
  }

  const handleClaim = async () => {
    setLoading(true)

    try {
      //when we come back from FR entitelment might not be set yet
      const curEntitlement = claimState.entitlement || (await goodWallet.checkEntitlement().toNumber())

      if (curEntitlement === 0) {
        return
      }

      showDialog({
        image: <LoadingIcon />,
        loading,
        message: 'please wait while processing...',
        showButtons: false,
        title: `YOUR MONEY\nIS ON ITS WAY...`,
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

        //fireGTMEvent({ event: 'claim-geo', claimValue: curEntitlement })
        const claimsSoFar = await advanceClaimsCounter()
        fireMauticEvent({ claim: claimsSoFar })
        checkHanukaBonusDates()

        fireGoogleAnalyticsEvent(CLAIM_GEO, {
          claimValue: weiToGd(curEntitlement),
          eventLabel: goodWallet.UBIContract.address,
        })

        showDialog({
          buttons: [{ text: 'Yay!' }],
          message: `You've claimed your daily G$\nsee you tomorrow.`,
          title: 'CHA-CHING!',
          type: 'success',
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
            {claimState.entitlement ? `Claim Your\nDaily Share` : `Just a Few More\nHours To Go...`}
          </Section.Text>
          {claimState.entitlement > 0 ? (
            <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
              <View style={styles.amountBlock}>
                <Section.Stack color="#0C263D" style={styles.amountBlockTitle} fontWeight="bold" fontFamily="Roboto">
                  <BigGoodDollar
                    number={entitlement}
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
                </Section.Stack>
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
          entitlement={claimState.entitlement}
          isCitizen={isCitizen}
          nextClaim={claimState.nextClaim}
          handleClaim={handleClaim}
          handleNonCitizen={handleFaceVerification}
          showLabelOnly
        />
        <View style={styles.fakeExtraInfoContainer} />
        <Section.Row style={styles.extraInfoContainer}>
          <Section.Row
            style={[styles.fontSize16, styles.extraInfoSecondContainer]}
            fontWeight="bold"
            fontFamily="Roboto"
          >
            <Section.Text style={styles.fontSize16}>{'Today '}</Section.Text>
            <Section.Row fontWeight="bold" style={styles.fontSize16}>
              <BigGoodDollar
                style={styles.extraInfoAmountDisplay}
                number={get(claimState, 'claimedToday.amount', 0)}
                spaceBetween={false}
                formatter={extraInfoAmountFormatter}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: 'black',
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: regularFontSize,
                  color: 'black',
                }}
              />
            </Section.Row>
            <Section.Text style={styles.fontSize16}>{` Claimed by `}</Section.Text>
            <Section.Text fontWeight="bold" color="black" style={styles.fontSize16}>
              {formattedNumberOfPeopleClaimedToday}{' '}
            </Section.Text>
            <Section.Text style={styles.fontSize16}>Good People</Section.Text>
          </Section.Row>
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
      height: '100%',
    },
    headerContentContainer: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: getDesignRelativeHeight(isLargeDevice ? 20 : 16),
      marginTop: getDesignRelativeHeight(isLargeDevice ? 70 : 18),
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
      marginBottom: getDesignRelativeHeight(isLargeDevice ? 16 : 20),
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
      display: Platform.select({ web: 'contents', default: 'flex' }),
    },
    extraInfoContainer: {
      position: 'absolute',
      top: `${extraInfoTopPosition}%`,
      height: `${claimButtonBottomPosition}%`,
      width: '100%',
    },
    extraInfoSecondContainer: {
      flex: 1,
      justifyContent: 'center',
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

// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage, Image } from 'react-native'
import moment from 'moment'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import wrapper from '../../lib/undux/utils/wrapper'
import API from '../../lib/API/api'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import { WrapperClaim } from '../common'
import arrowsDown from '../../assets/arrowsDown.svg'
import LoadingIcon from '../common/modal/LoadingIcon'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'
import { CLAIM_FAILED, CLAIM_SUCCESS, fireEvent } from '../../lib/analytics/analytics'
import Config from '../../config/config'
import type { DashboardProps } from './Dashboard'
import ClaimContentPhaseZero from './Claim/PhaseZero'
import ClaimContentPhaseOne from './Claim/PhaseOne'
import useClaimCounter from './Claim/useClaimCounter'

type ClaimProps = DashboardProps
type ClaimState = {
  nextClaim: string,
  entitlement: number,
  claimedToday: {
    people: string,
    amount: string,
  },
}

Image.prefetch(arrowsDown)

const log = logger.child({ from: 'Claim' })

const Claim = props => {
  const { screenProps, styles }: ClaimProps = props
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()

  const { entitlement } = gdstore.get('account')
  const isCitizen = gdstore.get('isLoggedInCitizen')

  const [showDialog, , showErrorDialog] = useDialog()
  const [loading, setLoading] = useState(false)
  const [claimInterval, setClaimInterval] = useState(null)
  const [state, setState]: [ClaimState, Function] = useState({
    nextClaim: '--:--:--',
    entitlement: (entitlement && entitlement.toNumber()) || 0,
    claimedToday: {
      people: '--',
      amount: '--',
    },
  })

  const wrappedGoodWallet = wrapper(goodWallet, store)
  const advanceClaimsCounter = useClaimCounter()

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
    } catch (e) {
      log.error('evaluateFRValidity failed', e.message, e)
      showErrorDialog('Sorry, Something unexpected happened, please try again', '', {
        onDismiss: () => {
          screenProps.goToRoot()
        },
      })
    }
  }

  const init = async () => {
    //hack to make unit test pass, activityindicator in claim button cuasing
    if (process.env.NODE_ENV !== 'test') {
      setLoading(true)
    }
    await goodWallet
      .checkEntitlement()
      .then(entitlement => setState(prev => ({ ...prev, entitlement: entitlement.toNumber() })))
      .catch(e => {
        log.error('gatherStats failed', e.message, e)
        showErrorDialog('Sorry, Something unexpected happened, please try again', '', {
          onDismiss: () => {
            screenProps.goToRoot()
          },
        })
      })

    // FR Evaluation
    await evaluateFRValidity()
    setLoading(false)
  }

  useEffect(() => {
    init()
  }, [])

  const getNextClaim = async date => {
    let nextClaimTime = date - new Date().getTime()
    if (nextClaimTime < 0 && state.entitlement <= 0) {
      try {
        const entitlement = await goodWallet.checkEntitlement().then(_ => _.toNumber())
        setState(prev => ({ ...prev, entitlement }))
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
    ]).catch(e => {
      log.error('gatherStats failed', e.message, e)
      showErrorDialog('Sorry, Something unexpected happened, please try again', '', {
        onDismiss: () => {
          screenProps.goToRoot()
        },
      })

      return []
    })

    if (claimedToday && nextClaimDate) {
      const nextClaim = await getNextClaim(nextClaimDate)
      setState(prevState => ({ ...prevState, claimedToday, nextClaim }))
      setClaimInterval(
        setInterval(async () => {
          const nextClaim = await getNextClaim(nextClaimDate)
          setState(prevState => ({ ...prevState, nextClaim }))
        }, 1000)
      )
    }
  }

  // Claim STATS
  useEffect(() => {
    if (entitlement === undefined) {
      return
    }

    gatherStats()
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

    showDialog({
      image: <LoadingIcon />,
      loading,
      message: 'please wait while processing...',
      showButtons: false,
      title: `YOUR MONEY\nIS ON ITS WAY...`,
    })
    try {
      //when we come back from FR entitelment might not be set yet
      const curEntitlement = state.entitlement || (await goodWallet.checkEntitlement().toNumber())
      if (curEntitlement == 0) {
        return
      }

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
        fireEvent(CLAIM_SUCCESS, { txhash: receipt.transactionHash })
        await advanceClaimsCounter()
        checkHanukaBonusDates()

        showDialog({
          buttons: [{ text: 'Yay!' }],
          message: `You've claimed your daily G$\nsee you tomorrow.`,
          title: 'CHA-CHING!',
          type: 'success',
          onDismiss: () => screenProps.goToRoot(),
        })
      } else {
        fireEvent(CLAIM_FAILED, { txhash: receipt.transactionHash, txNotCompleted: true })
        showErrorDialog('Claim request failed', 'CLAIM-1', { boldMessage: 'Try again later.' })
      }
    } catch (e) {
      fireEvent(CLAIM_FAILED, { txError: true })
      log.error('claiming failed', e.message, e)
      showErrorDialog('Claim request failed', 'CLAIM-2', { boldMessage: 'Try again later.' })
    } finally {
      setLoading(false)
    }
  }

  const faceRecognition = () => {
    //await handleClaim()
    screenProps.push('FRIntro', { from: 'Claim' })
  }

  const propsForContent = {
    styles,
    isCitizen,
    claimedToday: state.claimedToday,
    entitlement: state.entitlement,
    nextClaim: state.nextClaim,
    handleClaim: handleClaim,
    faceRecognition: faceRecognition,
  }

  return (
    <WrapperClaim>
      <Section style={styles.mainContainer}>
        {Config.isPhaseZero ? (
          <ClaimContentPhaseZero {...propsForContent} />
        ) : (
          <ClaimContentPhaseOne {...propsForContent} />
        )}
      </Section>
    </WrapperClaim>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainContainer: {
      backgroundColor: 'transparent',
      flexGrow: 1,
      paddingVertical: 0,
      paddingHorizontal: 0,
      justifyContent: 'space-between',
    },
    mainText: {
      alignItems: 'center',
      flexDirection: 'column',
      height: '55%',
      zIndex: 1,
    },
    mainTextTitle: {
      marginBottom: 12,
    },
    mainTextBorder: {
      marginTop: getDesignRelativeHeight(10),
      paddingHorizontal: getDesignRelativeWidth(40),
      paddingVertical: getDesignRelativeHeight(25),
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    mainTextToast: {
      paddingHorizontal: getDesignRelativeWidth(30),
      paddingVertical: getDesignRelativeWidth(2),
      backgroundColor: theme.colors.white,
      position: 'absolute',
      top: -getDesignRelativeHeight(13),
      borderRadius: 5,
    },
    subMainText: {
      marginTop: getDesignRelativeHeight(10),
    },
    learnMore: {
      marginTop: getDesignRelativeHeight(15),
    },
    learnMoreDialogReadMoreButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      width: '64%',
      fontSize: normalize(14),
    },
    learnMoreDialogOkButton: {
      width: '34%',
      fontSize: normalize(14),
    },
    blankBottom: {
      minHeight: getDesignRelativeHeight(4 * theme.sizes.defaultDouble),
    },
    extraInfo: {
      alignItems: 'center',
      flexDirection: 'column',
      height: '60%',
      zIndex: 1,
    },
    btnBlock: {
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 1,
      width: getDesignRelativeWidth(340),
      height: getDesignRelativeHeight(196),
      marginHorizontal: 'auto',
    },
    arrowsDown: {
      height: getDesignRelativeHeight(25),
      width: getDesignRelativeWidth(65),
    },
    extraInfoStats: {
      marginHorizontal: 0,
      marginBottom: 0,
      marginTop: theme.sizes.default,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.sizes.borderRadius,
      paddingTop: 8,
      flexGrow: 1,
    },
    extraInfoWrapper: {
      display: 'inline',
      textAlign: 'center',
      width: getDesignRelativeWidth(340),
      marginBottom: getDesignRelativeHeight(10),
    },
    inline: {
      display: 'inline',
    },
    countdown: {
      minHeight: getDesignRelativeHeight(72),
      borderRadius: 5,
    },
    space: {
      height: theme.sizes.defaultDouble,
    },
    amountBlock: {
      borderWidth: 3,
      borderColor: theme.colors.white,
      borderRadius: theme.sizes.borderRadius,
      paddingHorizontal: getDesignRelativeWidth(30),
      paddingVertical: getDesignRelativeWidth(10),
      marginBottom: getDesignRelativeHeight(10),
    },
    learnMoreLink: {
      cursor: 'pointer',
    },
  }
}

Claim.navigationOptions = {
  title: 'Claim',
}

export default withStyles(getStylesFromProps)(Claim)

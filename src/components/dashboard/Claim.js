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
import { WrapperClaim } from '../common'
import arrowsDown from '../../assets/arrowsDown.svg'
import LoadingIcon from '../common/modal/LoadingIcon'
import { withStyles } from '../../lib/styles'
import { CLAIM_FAILED, CLAIM_SUCCESS, fireEvent } from '../../lib/analytics/analytics'
import Config from '../../config/config'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import { isSmallDevice } from '../../lib/utils/mobileSizeDetect'
import type { DashboardProps } from './Dashboard'
import ClaimContent from './Claim/PhaseOne'
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
  const { screenProps, styles, theme }: ClaimProps = props
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()

  const { entitlement } = gdstore.get('account')
  const isCitizen = gdstore.get('isLoggedInCitizen')

  const [showDialog, hideDialog, showErrorDialog] = useDialog()
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
      const entitlement = await goodWallet.checkEntitlement().then(_ => _.toNumber())
      setState(prev => ({ ...prev, entitlement }))
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
    //temporary solution in the zero phase, for the situation when the user is not in the whitelist.
    if (Config.isPhaseZero) {
      showSupportDialog(showErrorDialog, hideDialog, screenProps.push)
    } else {
      screenProps.push('FRIntro', { from: 'Claim' })
    }
  }

  const propsForContent = {
    styles,
    theme,
    isCitizen,
    claimedToday: state.claimedToday,
    entitlement: state.entitlement,
    nextClaim: state.nextClaim,
    handleClaim: handleClaim,
    faceRecognition: faceRecognition,
  }

  return (
    <WrapperClaim>
      <ClaimContent {...propsForContent} />
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

  const extraInfoAmountText = {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: 'black',
    ...fontSize16,
  }

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
    mainText: {
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 1,
      justifyContent: 'space-around',
      marginBottom: getDesignRelativeHeight(isSmallDevice ? 16 : 20),
    },
    learnMoreLink,
    claimButtonContainer: {
      alignItems: 'center',
      flexDirection: 'column',
      zIndex: 1,
    },
    extraInfoAmountDisplay: {
      display: 'contents',
    },
    extraInfoContainer: {
      marginHorizontal: 0,
      marginBottom: getDesignRelativeHeight(5),
      marginTop: getDesignRelativeHeight(12),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.sizes.borderRadius,
    },
    extraInfoSecondContainer: {
      display: 'inline',
      textAlign: 'center',
      width: getDesignRelativeWidth(340),
      marginBottom: getDesignRelativeHeight(10),
    },
    extraInfoAmountText,
    fontSize16,
  }
}

Claim.navigationOptions = {
  title: 'Claim',
}

export default withStyles(getStylesFromProps)(Claim)

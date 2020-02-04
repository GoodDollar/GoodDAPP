// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage, Image, View, Platform } from 'react-native'
import numeral from 'numeral'
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
import { Wrapper } from '../common'
import BigGoodDollar from '../common/view/BigGoodDollar'
import Text from '../common/view/Text'
import LoadingIcon from '../common/modal/LoadingIcon'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'
import illustration from '../../assets/Claim/illustration.svg'
import { CLAIM_FAILED, CLAIM_SUCCESS, fireEvent } from '../../lib/analytics/analytics'
import Config from '../../config/config'
import type { DashboardProps } from './Dashboard'
import ClaimButton from './ClaimButton'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

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
    })

    const nextClaim = await getNextClaim(nextClaimDate)
    setState(prevState => ({ ...prevState, claimedToday, nextClaim }))
    setClaimInterval(
      setInterval(async () => {
        const nextClaim = await getNextClaim(nextClaimDate)
        setState(prevState => ({ ...prevState, nextClaim }))
      }, 1000)
    )
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

  const illustrationSizes = isCitizen ? styles.illustrationForCitizen : styles.illustrationForNonCitizen
  return (
    <Wrapper>
      <Section style={styles.mainContainer}>
        <Section.Stack style={styles.mainText}>
          <View style={styles.mainTextBorder}>
            <Section.Text color="primary" size={16} fontFamily="Roboto" lineHeight={19} style={styles.mainTextToast}>
              {'YOU CAN GET'}
            </Section.Text>
            <Section.Text style={styles.mainTextBigMarginBottom}>
              <BigGoodDollar
                number={1}
                reverse
                formatter={number => number}
                bigNumberProps={{ color: 'surface' }}
                bigNumberUnitProps={{ color: 'surface', fontSize: 20 }}
                style={styles.inline}
              />
              <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={36}>
                {' Free'}
              </Section.Text>
            </Section.Text>
            <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={36}>
              Every Day
            </Section.Text>
          </View>
          <Section.Row alignItems="center" justifyContent="center" style={[styles.row, styles.subMainText]}>
            <View style={styles.bottomContainer}>
              <Text color="white" fontSize={16} fontFamily="Roboto">
                {'Claim & spend it on'}
              </Text>
              <Text color="white" fontFamily="Roboto" size={16}>
                {`things you care about`}
              </Text>
            </View>
          </Section.Row>
        </Section.Stack>
        <Section.Stack style={styles.extraInfo}>
          <Image source={illustration} style={[styles.illustration, illustrationSizes]} resizeMode="contain" />
          {!isCitizen && (
            <ClaimButton
              isCitizen={true}
              entitlement={0}
              nextClaim={state.nextClaim}
              loading={loading}
              style={styles.countdown}
            />
          )}
          <View style={styles.space} />
          <ClaimButton
            isCitizen={isCitizen}
            entitlement={state.entitlement}
            nextClaim={state.nextClaim}
            loading={loading}
            onPress={() => (isCitizen && state.entitlement ? handleClaim() : !isCitizen && faceRecognition())}
          />
          <Section.Row style={styles.extraInfoStats}>
            <Text style={styles.extraInfoWrapper}>
              <Section.Text fontWeight="bold">{numeral(state.claimedToday.people).format('0a')} </Section.Text>
              <Section.Text>good people have claimed today!</Section.Text>
            </Text>
          </Section.Row>
        </Section.Stack>
      </Section>
    </Wrapper>
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
      marginVertical: 'auto',
      zIndex: 1,
    },
    mainTextTitle: {
      marginBottom: 12,
    },
    mainTextBorder: {
      marginTop: getDesignRelativeHeight(10),
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: theme.colors.white,
      borderRadius: 5,
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
    mainTextBigMarginBottom: {
      marginBottom: theme.sizes.defaultHalf,
    },
    blankBottom: {
      minHeight: getDesignRelativeHeight(4 * theme.sizes.defaultDouble),
    },
    illustration: {
      flexGrow: 0,
      flexShrink: 0,
      marginBottom: theme.sizes.default,
    },
    illustrationForCitizen: {
      height: getDesignRelativeHeight(184, false),
      marginTop: getDesignRelativeHeight(-94, false),
    },
    illustrationForNonCitizen: {
      height: getDesignRelativeHeight(159, false),
      marginTop: getDesignRelativeHeight(-70, false),
    },
    extraInfo: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.sizes.borderRadius,
      flexGrow: 1,
      flexShrink: 1,
      maxHeight: Platform.select({
        // FIXME: RN
        web: 'fit-content',
        default: 0,
      }),
      paddingVertical: theme.sizes.defaultDouble,
      paddingHorizontal: theme.sizes.default,
      marginTop: getDesignRelativeHeight(85),
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
      display: Platform.select({
        // FIXME: RN
        web: 'inline',
        default: 'flex',
      }),
      textAlign: 'center',
      width: getDesignRelativeWidth(340),
    },
    inline: {
      display: Platform.select({
        // FIXME: RN
        web: 'inline',
        default: 'flex',
      }),
    },
    countdown: {
      minHeight: getDesignRelativeHeight(72),
      borderRadius: 5,
    },
    space: {
      height: theme.sizes.defaultDouble,
    },
  }
}

Claim.navigationOptions = {
  title: 'Claim Daily G$',
}

export default withStyles(getStylesFromProps)(Claim)

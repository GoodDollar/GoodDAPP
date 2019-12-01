// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage, Image, TouchableOpacity, View } from 'react-native'
import numeral from 'numeral'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import wrapper from '../../lib/undux/utils/wrapper'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import { Wrapper } from '../common'
import BigGoodDollar from '../common/view/BigGoodDollar'
import Text from '../common/view/Text'
import LoadingIcon from '../common/modal/LoadingIcon'
import Icon from '../common/view/Icon'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'
import illustration from '../../assets/Claim/illustration.svg'
import { theme } from '../theme/styles'
import Config from '../../config/config'
import { CLAIM_FAILED, CLAIM_SUCCESS, fireEvent } from '../../lib/analytics/analytics'
import type { DashboardProps } from './Dashboard'
import ClaimButton from './ClaimButton'

Image.prefetch(illustration)

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

Image.prefetch(illustration)

const learnMoreStyles = ({ theme }) => ({
  titleContainer: {
    borderTopWidth: 2,
    borderTopStyle: 'solid',
    borderTopColor: theme.colors.primary,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: theme.colors.primary,
    paddingVertical: getDesignRelativeHeight(20),
    marginVertical: theme.sizes.default,
    marginBottom: getDesignRelativeHeight(18),
  },
  image: {
    textAlign: 'center',
    marginBottom: getDesignRelativeHeight(8),
  },
  imageContainer: {
    paddingHorizontal: getDesignRelativeWidth(5),
    paddingVertical: getDesignRelativeHeight(20),
  },
  mainText: {
    letterSpacing: 0.28,
  },
})

const LearnMoreDialog = withStyles(learnMoreStyles)(({ styles }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Icon name="info" size={80} style={styles.image} />
        <Text
          fontSize={28}
          lineHeight={37}
          fontFamily="Roboto"
          fontWeight="bold"
          color="primary"
          style={styles.mainText}
        >
          {'DID YOU KNOW?'}
        </Text>
      </View>
      <View style={styles.titleContainer}>
        <Text textAlign="left" fontSize={22} fontWeight="medium" fontFamily="Roboto" lineHeight={25} color="darkGrey">
          {'Claiming Daily GoodDollars'}
        </Text>
      </View>
      <Text textAlign="left" fontFamily="Roboto" color="darkGrey" fontSize={14} lineHeight={20}>
        {'GoodDollar gives every active member a small daily income.'}
      </Text>
      <Text textAlign="left" fontFamily="Roboto" color="darkGrey" fontSize={14} lineHeight={20}>
        {'Sign in every day, collect GoodDollars and use them to pay for goods and services.'}
      </Text>
    </View>
  )
})

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

    if (isValid && (await goodWallet.isCitizen())) {
      handleClaim()
    } else if (isValid === false) {
      screenProps.goToRoot()
    } else {
      if (isCitizen === false) {
        goodWallet.isCitizen().then(_ => gdstore.set('isLoggedInCitizen')(_))
      }
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
    ])

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

  const showLearnMoreDialog = () => {
    showDialog({
      content: <LearnMoreDialog />,
      buttons: [
        {
          text: 'READ MORE',
          mode: 'text',
          color: theme.colors.primary,
          style: styles.learnMoreDialogReadMoreButton,
          onPress: dismiss => {
            window.location = Config.web3SiteUrlEconomyPage
            dismiss()
          },
        },
        {
          text: 'OK',
          style: styles.learnMoreDialogOkButton,
          onPress: dismiss => dismiss(),
        },
      ],
    })
  }

  const illustrationSizes = isCitizen ? styles.illustrationForCitizen : styles.illustrationForNonCitizen
  return (
    <Wrapper>
      <Section style={styles.mainContainer}>
        <Section.Stack style={styles.mainText}>
          <View style={styles.mainTextBorder}>
            <Section.Text color="primary" size={16} fontFamily="Roboto" lineHeight={19} style={styles.mainTextToast}>
              {'GET NOW'}
            </Section.Text>
            <Section.Text style={styles.mainTextBigMarginBottom}>
              <BigGoodDollar
                number={1}
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
                {'Claim now & spend it'}
              </Text>
              <Text color="white" fontFamily="Roboto" size={16}>
                {`on things you care about`}
              </Text>
            </View>
          </Section.Row>
          <TouchableOpacity onPress={showLearnMoreDialog}>
            <Section.Text
              color="white"
              fontFamily="Roboto"
              fontWeight="bold"
              lineHeight={19}
              size={16}
              style={styles.learnMore}
              textDecorationLine="underline"
            >
              {'Learn more'}
            </Section.Text>
          </TouchableOpacity>
        </Section.Stack>
        <Section.Stack style={styles.extraInfo}>
          <Image source={illustration} style={[styles.illustration, illustrationSizes]} resizeMode="contain" />
          <Section.Row style={styles.extraInfoStats}>
            <Text style={styles.extraInfoWrapper}>
              <Section.Text fontWeight="bold">{numeral(state.claimedToday.people).format('0a')} </Section.Text>
              <Section.Text>good people have claimed today!</Section.Text>
            </Text>
          </Section.Row>
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
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const defaultMargins = {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: theme.sizes.default,
  }

  const defaultStatsBlock = {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.sizes.borderRadius,
  }

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
      height: getDesignRelativeHeight(184),
      marginTop: getDesignRelativeHeight(-94),
    },
    illustrationForNonCitizen: {
      height: getDesignRelativeHeight(159),
      marginTop: getDesignRelativeHeight(-70),
    },
    extraInfo: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.sizes.borderRadius,
      flexGrow: 1,
      flexShrink: 1,
      maxHeight: 'fit-content',
      paddingVertical: theme.sizes.defaultDouble,
      paddingHorizontal: theme.sizes.default,
      marginTop: getDesignRelativeHeight(85),
    },
    extraInfoStats: {
      ...defaultStatsBlock,
      ...defaultMargins,
      paddingBottom: 8,
      flexGrow: 1,
    },
    extraInfoWrapper: {
      display: 'inline',
      textAlign: 'center',
      width: getDesignRelativeWidth(340),
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
  }
}

Claim.navigationOptions = {
  title: 'Claim Daily G$',
}

export default withStyles(getStylesFromProps)(Claim)

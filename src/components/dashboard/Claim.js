// @flow
import React, { useEffect, useState } from 'react'
import { Image } from 'react-native'
import numeral from 'numeral'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import wrapper from '../../lib/undux/utils/wrapper'
import { weiToGd } from '../../lib/wallet/utils'
import { CustomButton, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import LoadingIcon from '../common/modal/LoadingIcon'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import Section from '../common/layout/Section'
import illustration from '../../assets/Claim/illustration.svg'
import type { DashboardProps } from './Dashboard'

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

const Claim = props => {
  const { screenProps, styles }: ClaimProps = props
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const { entitlement } = gdstore.get('account')
  const [showDialog] = useDialog()
  const [loading, setLoading] = useState(false)
  const [claimInterval, setClaimInterval] = useState(null)
  const [state, setState]: [ClaimState, Function] = useState({
    nextClaim: '--:--:--',
    entitlement: entitlement || 0,
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
    }
  }

  // FR Evaluation
  useEffect(() => {
    evaluateFRValidity()
  }, [])

  const getNextClaim = nextClaimDate => new Date(nextClaimDate - new Date().getTime()).toISOString().substr(11, 8)

  const gatherStats = async () => {
    const [claimedToday, nextClaimDate] = await Promise.all([
      wrappedGoodWallet.getAmountAndQuantityClaimedToday(entitlement),
      wrappedGoodWallet.getNextClaimTime(),
    ])

    setState(prevState => ({ ...prevState, claimedToday, entitlement, nextClaim: getNextClaim(nextClaimDate) }))

    setClaimInterval(
      setInterval(() => {
        const nextClaim = getNextClaim(nextClaimDate)
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
      dismissText: 'OK',
      image: <LoadingIcon />,
      loading,
      message: 'please wait while processing...',
      showButtons: false,
      title: `YOUR G$\nIS ON ITS WAY...`,
    })
    try {
      //when we come back from FR entitelment might not be set yet
      const curEntitlement = weiToGd(entitlement || (await goodWallet.checkEntitlement()))
      const receipt = await goodWallet.claim({
        onTransactionHash: hash => {
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            type: 'claim',
            data: {
              from: 'GoodDollar',
              amount: curEntitlement,
            },
          }
          userStorage.enqueueTX(transactionEvent)
        },
      })

      if (receipt.status) {
        showDialog({
          dismissText: 'Yay!',
          message: `You've claimed your G$`,
          title: 'SUCCESS!',
          type: 'success',
          onDismiss: () => screenProps.goToRoot(),
        })
      } else {
        showDialog({
          dismissText: 'OK',
          message: 'Something went wrong with the transaction.\nSee feed details for further information.',
          title: 'Claiming Failed',
          type: 'error',
        })
      }
    } catch (e) {
      log.error('claiming failed', e.message, e)

      showDialog({
        dismissText: 'OK',
        message: e.message,
        boldMessage: `Try again later.`,
        title: 'Claiming Failed',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const faceRecognition = () => {
    screenProps.push('FRIntro', { from: 'Claim' })
  }

  const isCitizen = gdstore.get('isLoggedInCitizen')
  const { nextClaim, claimedToday } = state

  const ClaimButton = (
    <CustomButton
      compact={true}
      disabled={entitlement <= 0}
      loading={loading}
      mode="contained"
      onPress={() => {
        isCitizen ? handleClaim() : faceRecognition()
      }}
    >
      {`CLAIM YOUR SHARE - ${weiToGd(entitlement)} G$`}
    </CustomButton>
  )

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section style={[styles.mainContainer]}>
        <Section.Stack style={[styles.mainText]}>
          <Section.Text style={[styles.mainTextTitle]}>GoodDollar allows you to collect</Section.Text>
          <Section.Text style={[styles.mainTextBigMarginBottom]}>
            <Section.Text style={[styles.mainTextBig]}>1</Section.Text>
            <Section.Text style={[styles.mainTextSmall]}> G$</Section.Text>
            <Section.Text style={[styles.mainTextBig]}> Free</Section.Text>
          </Section.Text>
          <Section.Text style={[styles.mainTextBig]}>Every Day</Section.Text>
        </Section.Stack>
        <Section.Stack style={[styles.extraInfo]}>
          <Image source={illustration} style={styles.illustration} resizeMode="contain" />
          <Section.Row style={styles.extraInfoStats}>
            <Section.Text>
              <Section.Text style={[styles.extraInfoStatsText, styles.textBold, styles.textPrimary]}>
                {numeral(claimedToday.people).format('0a')}{' '}
              </Section.Text>
              <Section.Text style={[styles.extraInfoStatsText]}>People Claimed </Section.Text>
              <Section.Text style={[styles.extraInfoStatsText, styles.textBold, styles.textPrimary]}>
                {numeral(claimedToday.amount).format('0a')}
              </Section.Text>
              <Section.Text
                style={[styles.extraInfoStatsText, styles.textBold, styles.textPrimary, styles.extraInfoStatsSmallText]}
              >
                G${' '}
              </Section.Text>
              <Section.Text style={[styles.extraInfoStatsText]}>Today!</Section.Text>
            </Section.Text>
          </Section.Row>
          <Section.Stack style={[styles.extraInfoCountdown]}>
            <Section.Text style={[styles.extraInfoCountdownTitle]}>Next Daily Income:</Section.Text>
            <Section.Text style={[styles.extraInfoCountdownNumber]}>{nextClaim}</Section.Text>
          </Section.Stack>
          {ClaimButton}
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  mainContainer: {
    backgroundColor: 'transparent',
    flexGrow: 1,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  mainText: {
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: 64,
    paddingTop: theme.sizes.defaultDouble,
  },
  mainTextTitle: {
    color: '#fff',
    fontFamily: theme.fonts.default,
    fontSize: normalize(16),
    fontWeight: '400',
    marginBottom: 12,
  },
  mainTextBig: {
    color: '#fff',
    fontFamily: theme.fonts.slab,
    fontSize: normalize(36),
    fontWeight: '700',
  },
  mainTextBigMarginBottom: {
    marginBottom: theme.sizes.defaultHalf,
  },
  mainTextSmall: {
    color: '#fff',
    fontFamily: theme.fonts.slab,
    fontSize: normalize(20),
    fontWeight: '700',
  },
  illustration: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: theme.sizes.default,
    marginTop: -80,
    maxWidth: '100%',
    minHeight: 159,
    minWidth: 229,
  },
  extraInfo: {
    backgroundColor: '#fff',
    borderRadius: theme.sizes.borderRadius,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    paddingBottom: theme.sizes.defaultDouble,
    paddingLeft: theme.sizes.default,
    paddingRight: theme.sizes.default,
    paddingTop: theme.sizes.defaultDouble,
  },
  extraInfoStats: {
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.sizes.borderRadius,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: theme.sizes.default,
    paddingLeft: theme.sizes.defaultHalf,
    paddingRight: theme.sizes.defaultHalf,
    paddingTop: theme.sizes.default,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: theme.sizes.default,
    marginTop: 0,
  },
  extraInfoStatsText: {
    fontFamily: theme.fonts.default,
    fontSize: normalize(15.5),
    fontWeight: '400',
  },
  extraInfoStatsSmallText: {
    fontSize: normalize(10),
  },
  textBold: {
    fontFamily: theme.fonts.default,
    fontWeight: '700',
  },
  textPrimary: {
    color: theme.colors.primary,
  },
  extraInfoCountdown: {
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.sizes.borderRadius,
    flexDirection: 'column',
    flexGrow: 2,
    justifyContent: 'center',
    marginBottom: theme.sizes.defaultDouble,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    paddingBottom: theme.sizes.default,
    paddingLeft: theme.sizes.defaultHalf,
    paddingRight: theme.sizes.defaultHalf,
    paddingTop: theme.sizes.default,
  },
  extraInfoCountdownTitle: {
    fontFamily: theme.fonts.default,
    fontSize: normalize(16),
    fontWeight: '400',
    marginBottom: theme.sizes.default,
  },
  extraInfoCountdownNumber: {
    color: theme.colors.green,
    fontFamily: theme.fonts.slab,
    fontSize: normalize(36),
    fontWeight: '700',
  },
})

Claim.navigationOptions = {
  title: 'Claim Daily G$',
}

export default withStyles(getStylesFromProps)(Claim)

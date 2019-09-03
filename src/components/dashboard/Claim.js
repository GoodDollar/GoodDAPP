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
import BigGoodDollar from '../common/view/BigGoodDollar'
import Text from '../common/view/Text'
import TopBar from '../common/view/TopBar'
import LoadingIcon from '../common/modal/LoadingIcon'
import { withStyles } from '../../lib/styles'
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
      wrappedGoodWallet.getAmountAndQuantityClaimedToday(),
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
      image: <LoadingIcon />,
      loading,
      message: 'please wait while processing...',
      showButtons: false,
      title: `YOUR G$\nIS ON ITS WAY...`,
    })
    try {
      //when we come back from FR entitelment might not be set yet
      const curEntitlement = entitlement || (await goodWallet.checkEntitlement())
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
          buttons: [{ text: 'Yay!' }],
          message: `You've claimed your daily G$`,
          title: 'SUCCESS!',
          type: 'success',
          onDismiss: () => screenProps.goToRoot(),
        })
      } else {
        showDialog({
          message: 'Something went wrong with the transaction.\nSee feed details for further information.',
          title: 'Claiming Failed',
          type: 'error',
        })
      }
    } catch (e) {
      log.error('claiming failed', e.message, e)

      showDialog({
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
      <Text color="surface" fontWeight="medium">
        {`CLAIM YOUR SHARE - `}
      </Text>
      <BigGoodDollar
        number={entitlement}
        formatter={weiToGd}
        bigNumberProps={{ fontSize: 16, color: 'surface', fontWeight: 'medium' }}
        bigNumberUnitProps={{ fontSize: 10, color: 'surface', fontWeight: 'medium' }}
        style={styles.inline}
      />
    </CustomButton>
  )

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section style={styles.mainContainer}>
        <Section.Stack style={styles.mainText}>
          <Section.Text color="surface" style={styles.mainTextTitle}>
            GoodDollar allows you to collect
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
        </Section.Stack>
        <Section.Stack style={styles.extraInfo}>
          <Image source={illustration} style={styles.illustration} resizeMode="contain" />
          <Section.Row style={styles.extraInfoStats}>
            <Section.Text fontWeight="bold">{numeral(claimedToday.people).format('0a')} </Section.Text>
            <Section.Text>People Claimed </Section.Text>
            <BigGoodDollar
              number={claimedToday.amount}
              formatter={number => numeral(number).format('0a')}
              bigNumberProps={{ fontSize: 16 }}
              bigNumberUnitProps={{ fontSize: 10 }}
            />
            <Section.Text>Today!</Section.Text>
          </Section.Row>
          <Section.Stack style={styles.extraInfoCountdown}>
            <Section.Text style={styles.extraInfoCountdownTitle}>Next Daily Income:</Section.Text>
            <Section.Text color="surface" fontFamily="slab" fontSize={36} fontWeight="bold">
              {nextClaim}
            </Section.Text>
          </Section.Stack>
          {ClaimButton}
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

  const defaultPaddings = {
    paddingVertical: theme.sizes.default,
    paddingHorizontal: theme.sizes.defaultHalf,
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
    },
    mainText: {
      alignItems: 'center',
      flexDirection: 'column',
      marginBottom: 64,
      paddingTop: theme.sizes.defaultDouble,
    },
    mainTextTitle: {
      marginBottom: 12,
    },
    mainTextBigMarginBottom: {
      marginBottom: theme.sizes.defaultHalf,
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
      backgroundColor: theme.colors.surface,
      borderRadius: theme.sizes.borderRadius,
      flexGrow: 1,
      flexShrink: 1,
      minHeight: 0,
      paddingVertical: theme.sizes.defaultDouble,
      paddingHorizontal: theme.sizes.default,
    },
    extraInfoStats: {
      ...defaultStatsBlock,
      ...defaultMargins,
      paddingVertical: 8,
      flexGrow: 1,
    },
    extraInfoCountdown: {
      ...defaultStatsBlock,
      ...defaultPaddings,
      ...defaultMargins,
      backgroundColor: theme.colors.orange,
      flexGrow: 2,
      flexDirection: 'column',
    },
    extraInfoCountdownTitle: {
      marginBottom: theme.sizes.default,
    },
    inline: {
      display: 'inline',
    },
  }
}

Claim.navigationOptions = {
  title: 'Claim Daily G$',
}

export default withStyles(getStylesFromProps)(Claim)

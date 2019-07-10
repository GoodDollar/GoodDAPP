// @flow
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import illustration from '../../assets/Claim/illustration.png'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import wrapper from '../../lib/undux/utils/wrapper'
import { weiToMask } from '../../lib/wallet/utils'
import { CustomButton, Section, Text, TopBar, Wrapper } from '../common'
import type { DashboardProps } from './Dashboard'

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

const Claim = ({ screenProps }: ClaimProps) => {
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()

  const [showDialog] = useDialog()
  const [loading, setLoading] = useState(false)
  const [claimInterval, setClaimInterval] = useState(null)
  const [state, setState]: [ClaimState, Function] = useState({
    nextClaim: '--:--:--',
    entitlement: 0,
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
    store.set('loadingIndicator')({ loading: true })

    const entitlement = await wrappedGoodWallet.checkEntitlement()

    const [claimedToday, nextClaimDate] = await Promise.all([
      wrappedGoodWallet.getAmountAndQuantityClaimedToday(entitlement),
      wrappedGoodWallet.getNextClaimTime(),
    ])

    setState(prevState => ({ ...prevState, claimedToday, entitlement, nextClaim: getNextClaim(nextClaimDate) }))

    store.set('loadingIndicator')({ loading: false })

    setClaimInterval(
      setInterval(() => {
        const nextClaim = getNextClaim(nextClaimDate)
        setState(prevState => ({ ...prevState, nextClaim }))
      }, 1000)
    )
  }

  // Claim STATS
  useEffect(() => {
    gatherStats()
    return () => clearInterval(claimInterval)
  }, [])

  const handleClaim = async () => {
    setLoading(true)

    showDialog({
      title: `YOUR G$\nIS ON IT'S WAY...`,
      message: 'please wait while processing...',
      loading,
      dismissText: 'OK',
    })

    try {
      const receipt = await goodWallet.claim({
        onTransactionHash: async hash => {
          const entitlement = await wrappedGoodWallet.checkEntitlement()
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            type: 'claim',
            data: {
              from: 'GoodDollar',
              amount: entitlement,
            },
          }
          userStorage.enqueueTX(transactionEvent)
        },
      })

      if (receipt.status) {
        showDialog({
          title: 'SUCCESS!',
          message: `You've claimed your G$`,
          dismissText: 'Yay!',
        })
      } else {
        showDialog({
          title: 'Caliming Failed',
          message: 'Something went wrong with the transaction.\nSee feed details for further information.',
          dismissText: 'OK',
        })
      }
    } catch (e) {
      log.error('claiming failed', e)

      showDialog({
        title: 'Claiming Failed',
        message: `${e.message}.\nTry again later.`,
        dismissText: 'OK',
      })
    } finally {
      setLoading(false)
    }
  }

  const faceRecognition = () => {
    screenProps.push('FaceRecognition', { from: 'Claim' })
  }

  const { entitlement } = gdstore.get('account')
  const isCitizen = gdstore.get('isLoggedInCitizen')
  const { nextClaim, claimedToday } = state

  const ClaimButton = (
    <CustomButton
      disabled={entitlement <= 0}
      mode="contained"
      compact={true}
      onPress={() => {
        isCitizen ? handleClaim() : faceRecognition()
      }}
      loading={loading}
    >
      {`CLAIM YOUR SHARE - ${weiToMask(entitlement, { showUnits: true })}`}
    </CustomButton>
  )

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Stack grow={4} justifyContent="flex-start">
          <Text>GoodDollar allows you to collect</Text>
          <Section.Row justifyContent="center">
            <Text fontFamily="slabBold" fontSize={36} color="#00c3ae">
              1
            </Text>
            <Text fontFamily="slabBold" fontSize={20} color="#00c3ae">
              {' '}
              G$
            </Text>
            <Text fontFamily="slabBold" fontSize={36} color="#00c3ae">
              {' '}
              Free
            </Text>
          </Section.Row>
          <Section.Row justifyContent="center">
            <Text fontFamily="slabBold" fontSize={36} color="#00c3ae">
              Every Day
            </Text>
          </Section.Row>
          <Image source={illustration} style={styles.illustration} resizeMode="contain" />
        </Section.Stack>
        <Section grow={3} style={styles.extraInfo}>
          <Section.Row grow={1} style={styles.extraInfoStats} justifyContent="center">
            <Section.Row alignItems="baseline">
              <Text color="primary" fontWeight="bold">
                {claimedToday.people}
              </Text>
              <Text> People Claimed </Text>
              <Text color="primary" fontWeight="bold">
                {claimedToday.amount}{' '}
              </Text>
              <Text color="primary" fontSize={12} fontWeight="bold">
                G$
              </Text>
              <Text> Today!</Text>
            </Section.Row>
          </Section.Row>
          <Section.Stack grow={2} style={styles.extraInfoCountdown} justifyContent="center">
            <Text>Next daily income:</Text>
            <Text fontFamily="slabBold" fontSize={36} color="#00c3ae">
              {nextClaim}
            </Text>
          </Section.Stack>
          {ClaimButton}
        </Section>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  illustration: {
    marginTop: normalize(16),
    minWidth: normalize(229),
    maxWidth: '100%',
    minHeight: normalize(159),
  },
  extraInfo: { padding: 0 },
  extraInfoStats: { backgroundColor: '#e0e0e0', borderRadius: normalize(5) },
  extraInfoCountdown: {
    backgroundColor: '#e0e0e0',
    margin: 0,
    marginTop: normalize(8),
    marginBottom: normalize(8),
    borderRadius: normalize(5),
  },
})

Claim.navigationOptions = {
  title: 'Claim Daily G$',
}

export default Claim

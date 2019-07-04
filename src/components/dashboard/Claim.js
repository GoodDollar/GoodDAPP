// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
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
    amount: string
  }
}

const log = logger.child({ from: 'Claim' })

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
      people: '',
      amount: ''
    }
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

  const gatherStats = async () => {
    const entitlement = await wrappedGoodWallet.checkEntitlement()

    const [claimedToday, nextClaimDate] = await Promise.all([
      wrappedGoodWallet.getAmountAndQuantityClaimedToday(entitlement),
      wrappedGoodWallet.getNextClaimTime()
    ])

    setState(prevState => ({ ...prevState, claimedToday, entitlement }))

    setClaimInterval(
      setInterval(() => {
        const nextClaim = new Date(nextClaimDate - new Date().getTime()).toISOString().substr(11, 8)
        setState(prevState => ({ ...prevState, nextClaim }))
      }, 1000)
    )
  }

  // Claim STATS
  useEffect(() => {
    gatherStats()
    return () => clearInterval(claimInterval)
  }, [])

  const handleClaim = () => {
    setLoading(true)

    try {
      wrappedGoodWallet.claim({
        onTransactionHash: async hash => {
          const entitlement = await wrappedGoodWallet.checkEntitlement()
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            type: 'claim',
            data: {
              from: 'GoodDollar',
              amount: entitlement
            }
          }
          userStorage.enqueueTX(transactionEvent)
          showDialog({
            title: 'SUCCESS!',
            message: `You've claimed your G$`,
            dismissText: 'Yay!',
            onDismiss: screenProps.goToRoot
          })
        }
      })
    } catch (e) {
      log.error('claiming failed', e)

      showDialog({
        title: 'Claiming Failed',
        message: `${e.message}.\nTry again later.`,
        dismissText: 'OK'
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
      <Section.Stack grow={3} justifyContent="flex-start">
        <Text color="surface">GoodDollar allows you to collect</Text>
        <Section.Row justifyContent="center">
          <Text fontFamily="slabBold" fontSize={36} color="surface">
            1
          </Text>
          <Text fontFamily="slabBold" fontSize={20} color="surface">
            {' '}
            G$
          </Text>
          <Text fontFamily="slabBold" fontSize={36} color="surface">
            {' '}
            Free
          </Text>
        </Section.Row>
        <Section.Row justifyContent="center">
          <Text fontFamily="slabBold" fontSize={36} color="surface">
            Every Day
          </Text>
        </Section.Row>
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
        <Section.Stack grow={3} style={styles.extraInfoCountdown} justifyContent="center">
          <Text>Next daily income:</Text>
          <Text fontFamily="slabBold" fontSize={36} color="#00c3ae">
            {nextClaim}
          </Text>
        </Section.Stack>
        {ClaimButton}
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  extraInfo: { marginBottom: 0, padding: normalize(8), paddingTop: normalize(8), paddingBottom: normalize(8) },
  extraInfoStats: { backgroundColor: '#e0e0e0', borderRadius: normalize(5) },
  extraInfoCountdown: {
    backgroundColor: '#e0e0e0',
    marginTop: normalize(8),
    marginBottom: normalize(16),
    borderRadius: normalize(5)
  }
})

const claim = GDStore.withStore(Claim)

claim.navigationOptions = {
  title: 'Claim Daily G$'
}

export default claim

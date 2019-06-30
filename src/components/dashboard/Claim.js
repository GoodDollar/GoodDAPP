// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import goodWallet from '../../lib/wallet/GoodWallet'
import wrapper from '../../lib/undux/utils/wrapper'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import { useDialog } from '../../lib/undux/utils/dialog'
import { CustomButton, Section, TopBar, Wrapper } from '../common'
import { weiToMask } from '../../lib/wallet/utils'
import logger from '../../lib/logger/pino-logger'
import type { DashboardProps } from './Dashboard'

type ClaimProps = DashboardProps

type ClaimState = {
  loading: boolean,
  nextClaim: string,
  claimedToday: any
}

const log = logger.child({ from: 'Claim' })

const Claim = ({ navigation, screenProps, ...props }: ClaimProps) => {
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog] = useDialog()
  const [state: ClaimState, setState] = useState({
    loading: false,
    nextClaim: '23:59:59',
    entitlement: 0,
    claimedToday: {
      people: '',
      amount: ''
    }
  })

  let interval = null

  let goodWalletWrapped = wrapper(goodWallet, store)

  const initialize = async () => {
    //if we returned from facerecoginition then the isValid param would be set
    //this happens only on first claim
    const isValid = screenProps.screenState && screenProps.screenState.isValid
    log.debug('from FR:', { isValid })
    if (isValid && (await goodWallet.isCitizen())) {
      handleClaim()
    } else if (isValid === false) {
      screenProps.goToRoot()
    }

    const entitlement = await goodWalletWrapped.checkEntitlement()
    const [claimedToday, nextClaimDate] = await Promise.all([
      goodWalletWrapped.getAmountAndQuantityClaimedToday(entitlement),
      goodWalletWrapped.getNextClaimTime()
    ])
    setState({ ...state, claimedToday, entitlement })
    interval = setInterval(() => {
      const nextClaim = new Date(nextClaimDate - new Date().getTime()).toISOString().substr(11, 8)
      setState({ ...state, nextClaim })
    }, 1000)
  }

  useEffect(() => {
    initialize()
    return () => clearInterval(interval)
  }, [])

  const handleClaim = () => {
    setState({ ...state, loading: true })
    try {
      goodWalletWrapped.claim({
        onTransactionHash: async hash => {
          const entitlement = await goodWalletWrapped.checkEntitlement()
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
          setState({ ...state, loading: false })
        }
      })
    } catch (e) {
      log.error('claiming failed', e)
      showDialog({
        title: 'Claiming Failed',
        message: `${e.message}.\nTry again later.`,
        dismissText: 'OK'
      })
      setState({ ...state, loading: false })
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
      style={styles.claimButton}
      loading={state.loading}
    >
      {`CLAIM YOUR SHARE - ${weiToMask(entitlement, { showUnits: true })}`}
    </CustomButton>
  )

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section style={styles.mainContent}>
        <Section.Text>GoodDollar allows you to collect</Section.Text>
        <Section.Text>
          <Text>G$s</Text>
          <Text style={styles.everyDay}> every day</Text>
        </Section.Text>
      </Section>
      <Section style={styles.nextIncome}>
        <Section.Text>
          {claimedToday.people} PEOPLE CLAIMED {claimedToday.amount} G$ TODAY!
        </Section.Text>
      </Section>
      <Section style={styles.nextIncome}>
        <Section.Text style={styles.incomeTitle}>Next daily income:</Section.Text>
        <Section.Text style={styles.time}>{nextClaim}</Section.Text>
      </Section>
      {ClaimButton}
      <View />
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  claimButton: {
    flexGrow: 0,
    flexShrink: 1
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: 'none'
  },
  nextIncome: {
    justifyContent: 'center'
  },
  incomeTitle: {
    fontSize: normalize(18),
    textTransform: 'uppercase',
    fontFamily: 'Roboto, Regular'
  },
  time: {
    fontSize: normalize(36),
    fontFamily: 'Roboto, Medium'
  },
  everyDay: {
    fontSize: normalize(20)
  }
})

const claim = GDStore.withStore(Claim)
claim.navigationOptions = {
  title: 'Claim G$'
}

export default claim

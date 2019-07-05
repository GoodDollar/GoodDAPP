// @flow
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'mobile-device-detect'
import { useErrorDialog } from '../../lib/undux/utils/dialog'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
import { BigGoodDollar, CopyButton, CustomButton, Section, Wrapper } from '../common'
import DoneButton from '../common/buttons/DoneButton'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'

const ReceiveAmount = ({ screenProps }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [screenState] = useScreenState(screenProps)
  const [showErrorDialog] = useErrorDialog()
  const { amount, reason, fromWho } = screenState
  const [confirmed, setConfirmed] = useState()
  const [finished, setFinished] = useState()

  const code = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => generateReceiveShareObject(code), [code])

  const shareAction = async () => {
    try {
      await navigator.share(share)
      setFinished(true)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showErrorDialog(e)
      }
    }
  }

  useEffect(() => {
    if (finished) {
      screenProps.goToRoot()
    }
  }, [finished])

  const handleConfirm = () => {
    if (isMobile && navigator.share) {
      shareAction()
    } else {
      setConfirmed(true)
    }
  }

  return (
    <Wrapper>
      <Section justifyContent="space-between" grow>
        <Section.Title>Summary</Section.Title>
        <Section.Stack>
          <Section.Row>
            <Section.Text>From:</Section.Text>
            <Section.Text>{fromWho}</Section.Text>
          </Section.Row>
          <Section.Row>
            <Section.Text>Amount:</Section.Text>
            <BigGoodDollar number={amount} />
          </Section.Row>
          <Section.Row>
            <Section.Text>For:</Section.Text>
            <Section.Text>{reason}</Section.Text>
          </Section.Row>
          {/* <Section.Stack>
            <Section.Text style={[styles.lowerSecondaryText]}>This QR code requests exactly</Section.Text>
            <Section.Text style={styles.addressSection}>
              <Text style={styles.url}>{share.url}</Text>
            </Section.Text>
            <Section.Text>
              <BigGoodDollar style={styles.centered} number={amount} />
            </Section.Text>
            <Section.Text>{reason ? reason : null}</Section.Text>
          </Section.Stack> */}
        </Section.Stack>
        {confirmed ? (
          <Section.Stack>
            <CopyButton toCopy={share.url} />
            <DoneButton screenProps={screenProps} />
          </Section.Stack>
        ) : (
          <Section.Row>
            <Section.Stack grow={1}>
              <BackButton mode="text" screenProps={screenProps}>
                Cancel
              </BackButton>
            </Section.Stack>
            <Section.Stack grow={2}>
              <CustomButton onPress={handleConfirm}>Confirm</CustomButton>
            </Section.Stack>
          </Section.Row>
        )}
      </Section>
    </Wrapper>
  )
}

ReceiveAmount.navigationOptions = {
  title: RECEIVE_TITLE
}

ReceiveAmount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.nextRoutes && screenState.amount
}

export default ReceiveAmount

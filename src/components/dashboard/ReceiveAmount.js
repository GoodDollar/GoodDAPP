// @flow
import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withTheme } from 'react-native-paper'
import { useErrorDialog } from '../../lib/undux/utils/dialog'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
import { BigGoodDollar, CopyButton, CustomButton, Section, Wrapper } from '../common'
import DoneButton from '../common/buttons/DoneButton'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import logger from '../../lib/logger/pino-logger'
const log = logger.child({ from: 'ReceiveAmount' })

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'

const ReceiveAmount = ({ screenProps, ...props }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [screenState] = useScreenState(screenProps)
  const [showErrorDialog] = useErrorDialog()
  const { amount, reason, fromWho } = screenState
  const [confirmed, setConfirmed] = useState()
  const [finished, setFinished] = useState()

  const code = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => generateReceiveShareObject(code), [code])
  const styles = getStylesFromProps(props)

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
        <Section.Stack grow>
          <Section.Title>Summary</Section.Title>
        </Section.Stack>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Row style={styles.tableRow}>
            <Section.Text>From:</Section.Text>
            <Section.Text>{fromWho}</Section.Text>
          </Section.Row>
          <Section.Row style={styles.tableRow}>
            <Section.Text>Amount:</Section.Text>
            <BigGoodDollar number={amount} />
          </Section.Row>
          <Section.Row style={styles.tableRow}>
            <Section.Text>For:</Section.Text>
            <Section.Text>{reason}</Section.Text>
          </Section.Row>
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

export default withTheme(ReceiveAmount)

const getStylesFromProps = props => {
  const { theme } = props
  log.debug({ theme })
  return StyleSheet.create({
    qrCode: {
      padding: normalize(16),
      borderColor: theme.colors.primary,
      borderWidth: 1,
      borderRadius: normalize(5)
    },
    qrWrapper: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    tableRow: {
      borderBottomColor: theme.colors.placeholder,
      borderBottomWidth: normalize(2),
      borderBottomStyle: 'solid',
      marginTop: theme.defaultMargin * 2,
      alignItems: 'baseline'
    }
  })
}

// @flow
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'mobile-device-detect'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { useErrorDialog } from '../../lib/undux/utils/dialog'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
import { BigGoodDollar, CopyButton, CustomButton, Section, TopBar, Wrapper } from '../common'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
}

const RECEIVE_TITLE = 'Receive G$'

const FromRow = props => {
  const { styles, counterPartyDisplayName } = props
  if (!counterPartyDisplayName) {
    return null
  }

  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>From:</Section.Text>
      <Section.Text fontSize={24} fontWeight="bold">
        {counterPartyDisplayName}
      </Section.Text>
    </Section.Row>
  )
}

const AmountRow = props => {
  const { amount, styles } = props
  if (!amount) {
    return null
  }
  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>Amount:</Section.Text>
      <BigGoodDollar elementStyles={styles.bigGoodDollar} number={amount} />
    </Section.Row>
  )
}

const ReasonRow = props => {
  const { reason, styles } = props
  if (!reason) {
    return null
  }
  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>For:</Section.Text>
      <Section.Text fontSize={16}>{reason}</Section.Text>
    </Section.Row>
  )
}

const ReceiveAmount = ({ screenProps, ...props }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [screenState] = useScreenState(screenProps)
  const [showErrorDialog] = useErrorDialog()
  const { amount, reason, fromWho } = screenState
  const [confirmed, setConfirmed] = useState()
  const [finished, setFinished] = useState()

  const code = useMemo(() => generateCode(account, networkId, amount, reason, fromWho), [
    account,
    networkId,
    amount,
    reason,
    fromWho,
  ])
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
      <TopBar push={screenProps.push} hideBalance />
      <Section justifyContent="space-between" grow>
        <Section.Title>Summary</Section.Title>
        <Section.Stack grow justifyContent="center">
          <FromRow counterPartyDisplayName={fromWho} styles={styles} />
          <AmountRow amount={amount} styles={styles} />
          <ReasonRow reason={reason} styles={styles} />
        </Section.Stack>
        {confirmed ? (
          <Section.Stack>
            <CopyButton toCopy={share.url} onPressDone={screenProps.goToRoot} />
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
  title: RECEIVE_TITLE,
}

ReceiveAmount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.nextRoutes && screenState.amount
}

const getStylesFromProps = ({ theme }) => {
  return {
    tableRow: {
      // TODO: see where should we take this color from
      borderBottomColor: '#CBCBCB',
      borderBottomWidth: normalize(1),
      borderBottomStyle: 'solid',
      marginTop: theme.paddings.defaultMargin * 2,
      alignItems: 'baseline',
    },

    // TODO: all this properties can be removed once we merge Text component in
    tableRowLabel: {
      color: '#A3A3A3',
    },
    bigGoodDollar: {
      color: theme.colors.primary,
    },
    reason: {
      fontSize: normalize(16),
    },
    doneButton: {
      marginTop: theme.paddings.defaultMargin,
    },
  }
}

export default withStyles(getStylesFromProps)(ReceiveAmount)

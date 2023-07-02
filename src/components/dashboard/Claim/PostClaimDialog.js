// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// utils
import normalizeText from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { isSharingAvailable } from '../../../lib/share'
import { fireEvent, INVITE_SHARE } from '../../../lib/analytics/analytics'
import { useFormatG$ } from '../../../lib/wallet/GoodWalletProvider'
import { Icon, Section, ShareButton, Text } from '../../common'
import { theme } from '../../theme/styles'
import { useInvited } from '../../invite/useInvites'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

// const onDismiss = dismiss => {
//   fireEvent(INVITE_SHARE)
//   dismiss()
// }
const RedIcon = () => <Icon name="close" color={'red'} style={{ marginRight: theme.sizes.defaultDouble }} />
const GreenIcon = () => <Icon name="success" color={'green'} style={{ marginRight: theme.sizes.defaultDouble }} />

export const PostClaimDialog = () => {
  const [, , level = { bounty: 0 }, inviteState] = useInvited()
  const { toDecimals } = useFormatG$()

  //   const shareText = useInviteText()
  return (
    <ExplanationDialog
      title={t`Sharing is caring! Earn ${Number(toDecimals(level.bounty)).toFixed(0)}G$ for every friend you invite.`}
      text={t`Your friends will also get ${Number(toDecimals(level.bounty / 2)).toFixed(0)}G$ each`}
      textStyle={{
        fontSize: normalizeText(16),
        marginVertical: getDesignRelativeHeight(25, false),
      }}
      image={illustration}
      imageHeight={124}
    >
      <ShareButton
        style={{ flexGrow: 0, minWidth: 70, height: 32, minHeight: 32 }}
        color={theme.colors.primary}
        textStyle={{ fontSize: 14, color: theme.colors.white }}
        share={'https://xxx'}
        iconColor={'white'}
        actionText={isSharingAvailable ? 'Share invite link' : 'copy invite link'}
        onPressed={() => fireEvent(INVITE_SHARE, { method: isSharingAvailable ? 'native' : 'copy', postclaim: true })}
        withoutDone
      />
      <Section.Title>{`Tasks`}</Section.Title>
      <Section.Stack style={{ alignItems: 'center', alignSelf: 'center' }}>
        <Section.Row style={styles.row}>
          {inviteState.totalInvited > 0 ? <GreenIcon /> : <RedIcon />}
          <Text>Invite a friend</Text>
        </Section.Row>
        <Section.Row style={styles.row}>
          <GreenIcon />
          <Text>Save GoodDollars</Text>
        </Section.Row>
        <Section.Row style={styles.row}>
          <Icon name="close" color={'red'} style={{ marginRight: theme.sizes.defaultDouble }} />

          <Text>Exchange GoodDollars To cUSD</Text>
        </Section.Row>
        <Section.Row style={styles.row}>
          <Icon name="close" color={'red'} style={{ marginRight: theme.sizes.defaultDouble }} />

          <Text>Vote</Text>
        </Section.Row>
      </Section.Stack>
    </ExplanationDialog>
  )
}

const styles = {
  row: {
    alignSelf: 'baseline',
  },
}

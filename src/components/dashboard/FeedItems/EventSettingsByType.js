import FeedSendComplete from '../../common/animations/Feed/SendComplete/SendComplete'
import FeedSendPending from '../../common/animations/Feed/SendPending/SendPending'
import FeedReceiveSuccess from '../../common/animations/Feed/ReceiveSuccess/ReceiveSuccess'
import FeedBonusRewardSuccess from '../../common/animations/Feed/BonusRewardSuccess/BonusRewardSuccess'
import FeedInfo from '../../common/animations/Feed/Info/Info'
import FeedClaim from '../../common/animations/Feed/Claim/Claim'
import { eventSettings } from '../../dashboard/Claim/events'

const getEventSettingsByType = (theme, type) => {
  const styles = {
    claim: {
      actionSymbol: '+',
      color: theme.colors.lightGreen,
      component: FeedClaim,
      name: 'claim-filled',
    },
    bonuspending: {
      actionSymbol: '+',
      color: theme.colors.orange,
      name: 'bonus-reward',
    },
    bonuserror: {
      actionSymbol: '+',
      color: theme.colors.red,
      name: 'bonus-reward',
    },
    bonuscompleted: {
      actionSymbol: '+',
      color: theme.colors.lightGreen,
      component: FeedBonusRewardSuccess,
      name: 'bonus-reward',
    },
    claiming: {
      color: theme.colors.primary,
      component: FeedInfo,
      name: 'info',
      withoutAmount: true,
      withoutAvatar: true,
    },
    send: {
      actionSymbol: '-',
      color: theme.colors.red,
      component: FeedSendComplete,
      name: 'send-filled',
    },
    sendcompleted: {
      actionSymbol: '-',
      color: theme.colors.red,
      component: FeedSendComplete,
      name: 'send-filled',
    },
    senderror: {
      color: theme.colors.primary,
      name: 'system-filled',
      withoutAmount: true,
    },
    sendpending: {
      actionSymbol: '-',
      color: theme.colors.orange,
      component: FeedSendPending,
      name: 'clock-filled',
    },
    receive: {
      actionSymbol: '+',
      color: theme.colors.lightGreen,
      component: FeedReceiveSuccess,
      name: 'receive-filled',
    },
    withdraw: {
      actionSymbol: '+',
      color: theme.colors.green,
      component: FeedReceiveSuccess,
      name: 'receive-filled',
    },
    withdrawerror: {
      color: theme.colors.primary,
      component: FeedInfo,
      name: 'info',
      withoutAmount: true,
    },
    withdrawcompleted: {
      actionSymbol: '+',
      color: theme.colors.green,
      component: FeedReceiveSuccess,
      name: 'receive-filled',
    },
    withdrawpending: {
      actionSymbol: '+',
      color: theme.colors.orange,
      name: 'receive-filled',
    },
    message: {
      color: theme.colors.purple,
      name: 'social-good-filled',
      withoutAmount: true,
    },
    invite: {
      color: theme.colors.primary,
      component: FeedInfo,
      name: 'info',
      withoutAmount: true,
      withoutAvatar: true,
    },
    welcome: {
      color: theme.colors.primary,
      component: FeedInfo,
      name: 'info',
      withoutAmount: true,
      withoutAvatar: true,
    },
    claimsThreshold: eventSettings(theme),
    backup: {
      color: theme.colors.primary,
      component: FeedInfo,
      name: 'info',
      withoutAmount: true,
      withoutAvatar: true,
    },
    feedback: {
      color: theme.colors.primary,
      component: FeedInfo,
      name: 'info',
      withoutAmount: true,
    },
    spending: {
      color: theme.colors.primary,
      component: FeedInfo,
      name: 'info',
      withoutAmount: true,
      withoutAvatar: true,
    },
    empty: {
      color: theme.colors.lightGray,
    },
  }
  return styles[type] || styles.empty
}

export default getEventSettingsByType

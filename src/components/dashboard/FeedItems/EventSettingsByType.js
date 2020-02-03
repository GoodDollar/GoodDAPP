import FeedSendComplete from '../../common/animations/FeedSendComplete/FeedSendComplete'
import FeedSendPending from '../../common/animations/FeedSendPending/FeedSendPending'
import FeedReceiveSuccess from '../../common/animations/FeedReceiveSuccess/FeedReceiveSuccess'
import FeedBonusRewardSuccess from '../../common/animations/FeedBonusRewardSuccess/FeedBonusRewardSuccess'
import FeedInfo from '../../common/animations/FeedInfo/FeedInfo'
import FeedClaim from '../../common/animations/FeedClaim/FeedClaim'

const getEventSettingsByType = (theme, type) => {
  const styles = {
    claim: {
      actionSymbol: '+',
      color: theme.colors.lightGreen,
      component: FeedClaim,
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
    },
    claiming: {
      color: theme.colors.primary,
      component: FeedInfo,
      withoutAmount: true,
      withoutAvatar: true,
    },
    hanukaStarts: {
      color: theme.colors.primary,
      component: FeedInfo,
      withoutAmount: true,
      withoutAvatar: true,
    },
    send: {
      actionSymbol: '-',
      color: theme.colors.red,
      component: FeedSendComplete,
    },
    sendcompleted: {
      actionSymbol: '-',
      color: theme.colors.red,
      component: FeedSendComplete,
    },
    sendcancelled: {
      actionSymbol: '-',
      color: theme.colors.orange,
      component: FeedSendPending,
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
    },
    receive: {
      actionSymbol: '+',
      color: theme.colors.lightGreen,
      component: FeedReceiveSuccess,
    },
    withdraw: {
      actionSymbol: '+',
      color: theme.colors.green,
      component: FeedReceiveSuccess,
    },
    withdrawerror: {
      color: theme.colors.primary,
      component: FeedInfo,
      withoutAmount: true,
    },
    withdrawcompleted: {
      actionSymbol: '+',
      color: theme.colors.green,
      component: FeedReceiveSuccess,
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
      withoutAmount: true,
      withoutAvatar: true,
    },
    welcome: {
      color: theme.colors.primary,
      component: FeedInfo,
      withoutAmount: true,
      withoutAvatar: true,
    },
    backup: {
      color: theme.colors.primary,
      component: FeedInfo,
      withoutAmount: true,
      withoutAvatar: true,
    },
    feedback: {
      color: theme.colors.primary,
      component: FeedInfo,
      withoutAmount: true,
    },
    spending: {
      color: theme.colors.primary,
      component: FeedInfo,
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

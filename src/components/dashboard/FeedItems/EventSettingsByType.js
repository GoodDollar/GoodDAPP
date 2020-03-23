import FeedSendComplete from '../../common/animations/Feed/SendComplete/SendComplete'
import FeedSendPending from '../../common/animations/Feed/SendPending/SendPending'
import FeedReceiveSuccess from '../../common/animations/Feed/ReceiveSuccess/ReceiveSuccess'
import FeedBonusRewardSuccess from '../../common/animations/Feed/BonusRewardSuccess/BonusRewardSuccess'
import FeedInfo from '../../common/animations/Feed/Info/Info'
import FeedClaim from '../../common/animations/Feed/Claim/Claim'

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
    },
    bonuserror: {
      actionSymbol: '+',
      color: theme.colors.red,
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
    },
    message: {
      color: theme.colors.purple,
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

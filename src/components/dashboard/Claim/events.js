// @flow
import FeedInfo from '../../common/animations/Feed/Info/Info'

export const eventSettings = theme => {
  return {
    color: theme.colors.primary,
    component: FeedInfo,
    name: 'info',
    withoutAmount: true,
    withoutAvatar: true,
  }
}

export const longUseOfClaims = {
  id: '5',
  type: 'claimsThreshold',
  status: 'completed',
  data: {
    customName: 'Congrats! You’ve made it!',
    subtitle: 'Congrats! You’ve made it!',
    receiptData: {
      from: '0x0000000000000000000000000000000000000000',
    },
    reason:
      'Nice work.\n' +
      'You’ve claimed G$ for 14 days and your spot is now secured for GoodDollar’s live launch. \n' +
      'G$ are coming your way soon!',
    endpoint: {
      fullName: 'Congrats! You’ve made it!',
    },
  },
}

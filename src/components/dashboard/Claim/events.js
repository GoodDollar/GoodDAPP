// @flow
import FeedInfo from '../../common/animations/Feed/Info/Info'

export const CLAIM_TASK_COMPLETED = 'CLAIM_TASK_COMPLETED'
export const claimDaysThreshold = 14

export const eventSettings = theme => {
  return {
    color: theme.colors.primary,
    component: FeedInfo,
    name: 'info',
    withoutAmount: true,
    withoutAvatar: true,
  }
}

//@flow
/**
 * StandardFeed element. It's being used to show the feed on dashboard
 * @type
 */
export type StandardFeed = {
  id: string,
  date: number,
  type: string, // 'message' | 'withdraw' | 'send',
  data: {
    endpoint: {
      address: string,
      displayName: string,
      avatar?: string,
    },
    amount: string,
    message: string,
  },
}

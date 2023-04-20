// @flow
export type FeedEventProps = {
  item: {
    id: string,
    chainId: Number,
    date: string,
    data: {
      amount: number,
      endpoint: {
        title: string,
        avatar: string,
        displayName: string,
      },
      message: string,
      processing?: boolean,
    },
    status: string,
    type: string,
  },
  styles?: any,
  theme?: any,
  onPress?: (feed: number) => any,
}

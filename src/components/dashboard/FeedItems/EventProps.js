// @flow
export type FeedEventProps = {
  item: {
    id: string,
    date: string,
    data: {
      amount: number,
      endpoint: {
        title: string,
        withdrawStatus: string,
        avatar: string,
        fullName: string,
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

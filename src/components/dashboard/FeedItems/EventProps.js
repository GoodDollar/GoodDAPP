// @flow
export type FeedEventProps = {
  item: {
    id: string,
    date: String,
    data: {
      amount: number,
      endpoint: {
        title: string,
        withdrawStatus: string,
        avatar: string,
        fullName: string
      },
      message: string
    },
    type: string
  },
  styles?: any,
  onPress?: (feed: number) => any
}

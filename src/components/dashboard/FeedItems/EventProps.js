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
    }
  },
  onPress: ?(feed: number) => any
}

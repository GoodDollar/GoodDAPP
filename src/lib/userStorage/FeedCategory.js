// @flow
import { t } from '@lingui/macro'

export type FeedCategory = null | 'news' | 'tx'

export class FeedCategories {
  static All = null

  static News = 'news'

  static Transactions = 'tx'

  static get all() {
    const { All, Transactions, News } = this

    return [All, Transactions, News]
  }

  static label(category) {
    const { News, Transactions } = this

    switch (category) {
      case News:
        return t`News`
      case Transactions:
        return t`Transactions`
      default:
        return t`All`
    }
  }
}

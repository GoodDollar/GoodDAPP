import { IpfsStorage, OrbisCachedFeed } from '@gooddollar/web3sdk-v2'
import moment from 'moment'

import Config from '../../../config/config'
import { FeedSource } from '../feed'
import { FeedItemType } from '../../userStorage/FeedStorage'

const { EVENT_TYPE_NEWS } = FeedItemType

export default class OrbisNewsSource extends FeedSource {
  orbisFeed = new OrbisCachedFeed({ tag: 'publishWallet', context: Config.orbisFeedContext }, new IpfsStorage())

  static formatCeramicPost(ceramicPost) {
    const date = moment(ceramicPost.published).utc().format()

    return {
      _id: ceramicPost.id,
      id: ceramicPost.id,
      createdDate: date,
      date,
      displayType: EVENT_TYPE_NEWS,
      status: ceramicPost.hidden ? 'deleted' : 'published',
      type: EVENT_TYPE_NEWS,
      data: {
        reason: ceramicPost.content,
        counterPartyFullName: ceramicPost.title,
        subtitle: ceramicPost.title,
        picture: ceramicPost.picture,
        readMore: true,
        link: ceramicPost.link,
        sponsoredLink: ceramicPost.sponsored_link,
        sponsoredLogo: ceramicPost.sponsored_logo,
      },
    }
  }

  async syncFromRemote() {
    const { log } = this

    log.info('orbis sync from remote started')

    try {
      await this.orbisFeed.syncPosts()
      await this._loadFeed()
      log.info('orbis sync from remote done, starting periodic sync')
      this.orbisFeed.periodicSync(this._loadFeed)
    } catch (exception) {
      log.error('orbis sync from remote failed', exception.message, exception)
    }
  }

  /** @private */
  async _loadFeed() {
    const { log, Feed } = this

    const ceramicPosts = await this.orbisFeed.getPosts(0, 1000)
    const formattedCeramicPosts = ceramicPosts.map(OrbisNewsSource.formatCeramicPost)

    log.debug('orbis fetched posts', ceramicPosts.length, { ceramicPosts })

    // replacing the whole news feed with the new one posts from Orbis
    const existingItems = await Feed.find({ type: EVENT_TYPE_NEWS }).toArray()
    const allIds = formattedCeramicPosts.map(_ => _.id)
    const toDelete = existingItems.filter(_ => allIds.includes(_.id) === false).map(_ => _.id)
    if (toDelete.length > 0) {
      const deleteResult = await Feed.delete(...toDelete)
      log.debug('orbis deleted items no longer in orbis:', { toDelete, deleteResult })
    }
    await Feed.save(...formattedCeramicPosts)
    log.debug('orbis done saving posts to feed')
  }
}

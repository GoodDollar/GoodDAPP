import moment from 'moment'

import CeramicFeed from '../../ceramic/CeramicFeed'

import Config from '../../../config/config'
import { batch } from '../../utils/async'
import { FeedSource } from '../feed'

export default class NewsSource extends FeedSource {
  static historyCacheId = 'GD_CERAMIC_HISTORY'

  // format from ceramic format to TreadDB format
  static formatCeramicPost(ceramicPost) {
    return {
      _id: ceramicPost.id,
      id: ceramicPost.id,
      createdDate: moment(ceramicPost.published)
        .utc()
        .format(),
      date: moment(ceramicPost.published)
        .utc()
        .format(),
      displayType: 'news',
      status: ceramicPost.hidden ? 'deleted' : 'published',
      type: 'news',
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
    const { log, storage } = this
    const { historyCacheId } = NewsSource
    const historyId = await storage.getItem(historyCacheId)
    const logDone = () => log.info('ceramic sync from remote done')

    log.info('ceramic sync from remote started', { historyId })

    if (historyId) {
      try {
        await this._applyChangeLog(historyId)
        logDone()

        return
      } catch (exception) {
        // throw if not HISTORY_NOT_FOUND, otherwise falling back to _loadRemoteFeed()
        if ('HISTORY_NOT_FOUND' !== exception.name) {
          throw exception
        }
      }
    }

    await this._loadRemoteFeed()
    logDone()
  }

  /** @private */
  async _loadRemoteFeed() {
    const { log, Feed, storage } = this
    const { formatCeramicPost, historyCacheId } = NewsSource

    const ceramicPosts = await CeramicFeed.getPosts()
    const historyId = await CeramicFeed.getHistoryId()
    const formatedCeramicPosts = ceramicPosts.map(formatCeramicPost)

    log.debug('Ceramic fetched posts', { ceramicPosts, formatedCeramicPosts })

    await Feed.find({ type: 'news' }).delete()
    await Feed.save(...formatedCeramicPosts)
    await storage.setItem(historyCacheId, historyId)
  }

  /** @private */
  async _applyChangeLog(ceramicCachedHistoryId) {
    const { formatCeramicPost, historyCacheId } = NewsSource
    const { ceramicBatchSize } = Config
    const { log, Feed, storage } = this

    const { history, historyId } = await CeramicFeed.getHistory(ceramicCachedHistoryId)

    log.debug('Ceramic history', { history, historyId })

    await batch(history, ceramicBatchSize, async ({ item: postId, action }) => {
      switch (action) {
        case 'added':
        case 'updated': {
          const post = await CeramicFeed.getPost(postId)

          log.debug('fetching ceramic feed item', { postId, action })
          await Feed.save(formatCeramicPost(post))
          break
        }
        case 'removed': {
          log.debug('removing ceramic feed item', { postId, action })
          await Feed.delete(postId)
          break
        }
        default: {
          log.warn('invalid ceramic feed item action received', { postId, action })
        }
      }
    })

    await storage.setItem(historyCacheId, historyId)
  }
}

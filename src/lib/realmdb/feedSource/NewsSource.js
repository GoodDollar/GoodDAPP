import moment from 'moment'

import CeramicFeed from '../../ceramic/CeramicFeed'
import { isValidHistoryId } from '../../ceramic/client'

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
    const { log, storage, _resetLastSync } = this
    const { historyCacheId } = NewsSource

    log.info('ceramic sync from remote started')

    try {
      let lastHistoryId = await storage.getItem(historyCacheId)

      log.info('fetched last history id', { lastHistoryId })

      if (lastHistoryId && !isValidHistoryId(lastHistoryId)) {
        lastHistoryId = null
        await _resetLastSync('empty or invalid last history id')
      }

      const { history, historyId } = await CeramicFeed.getHistory()
      const changeLog = this._fetchChangeLog(history, lastHistoryId)
      const changeLogAvailable = false !== changeLog

      if (lastHistoryId && !changeLogAvailable) {
        await _resetLastSync('history id not found or history broken')
      }

      if (!historyId) {
        log.info('empty history or no posts published, ceramic sync from remote skipped')
        return
      }

      if (changeLogAvailable) {
        await this._applyChangeLog(changeLog)
      } else {
        await this._loadRemoteFeed()
      }

      log.info('ceramic sync updated last history id', { historyId })
      await storage.setItem(historyCacheId, historyId)

      log.info('ceramic sync from remote done')
    } catch (exception) {
      log.error('ceramic sync from remote failed', exception, exception.message)
    }
  }

  /** @private */
  _resetLastSync = async reason => {
    const { log, storage } = this
    const { historyCacheId } = NewsSource

    await storage.removeItem(historyCacheId)
    log.warn(`${reason}. reloading the whole feed`)
  }

  /** @private */
  _fetchChangeLog(history, lastHistoryId = null) {
    if (lastHistoryId) {
      try {
        return CeramicFeed.aggregateHistory(history, lastHistoryId)
      } catch (exception) {
        if ('HISTORY_NOT_FOUND' !== exception.name) {
          throw exception
        }
      }
    }

    return false
  }

  /** @private */
  async _mergePost(postId, action) {
    const { formatCeramicPost } = NewsSource
    const { log, Feed } = this
    let post = null

    try {
      log.debug('fetching ceramic feed item', { postId, action })
      post = await CeramicFeed.getPost(postId)
    } catch (exception) {
      if ('DOCUMENT_NOT_FOUND' !== exception.name) {
        throw exception
      }

      log.warn('imported ceramic feed item not exists', exception.message, exception, { postId, action })
    }

    if (post) {
      await Feed.save(formatCeramicPost(post))
    }
  }

  /** @private */
  async _loadRemoteFeed() {
    const { log, Feed } = this
    const { formatCeramicPost } = NewsSource

    const ceramicPosts = await CeramicFeed.getPosts()
    const formattedCeramicPosts = ceramicPosts.map(formatCeramicPost)

    log.debug('Ceramic fetched posts', { ceramicPosts, formattedCeramicPosts })

    await Feed.find({ type: 'news' }).delete()
    await Feed.save(...formattedCeramicPosts)
  }

  /** @private */
  async _applyChangeLog(changeLog) {
    const { ceramicBatchSize } = Config
    const { log, Feed } = this

    log.debug('Ceramic history', { changeLog })

    await batch(changeLog, ceramicBatchSize, async ({ item: postId, action }) => {
      switch (action) {
        case 'added':
        case 'updated': {
          await this._mergePost(postId, action)
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
  }
}

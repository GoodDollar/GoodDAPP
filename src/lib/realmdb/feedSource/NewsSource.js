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

      // get last history id
      log.info('fetched last history id', { lastHistoryId })

      // if was set but not valid (e.g. old DID format instead of sha1) - fallback to full reload
      if (lastHistoryId && !isValidHistoryId(lastHistoryId)) {
        lastHistoryId = null
        await _resetLastSync('empty or invalid last history id')
      }

      // fetching & aggregating (only if had last history id) history
      const { history, historyId } = await CeramicFeed.getHistory()
      const changeLog = this._fetchChangeLog(history, lastHistoryId)
      const changeLogAvailable = false !== changeLog

      // if we had last history id set but it's not found ot history broken - fallback to full reload
      if (lastHistoryId && !changeLogAvailable) {
        await _resetLastSync('history id not found or history broken')
      }

      // if history id from ceramic is empty that means history is empty - e.g. no posts, skipping process
      if (!historyId) {
        log.info('empty history or no posts published, ceramic sync from remote skipped')
        return
      }

      // if we have changelog (there was last history id stored, it was correct and existing in ceramic)
      if (changeLogAvailable) {
        // applying it
        await this._applyChangeLog(changeLog)
      } else {
        // otherwise performing full reload
        await this._loadRemoteFeed()
      }

      // updating last history id in the local storage
      log.info('ceramic sync updated last history id', { historyId })
      await storage.setItem(historyCacheId, historyId)

      log.info('ceramic sync from remote done')
    } catch (exception) {
      log.error('ceramic sync from remote failed', exception.message, exception)
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
    // skip on full reload (if last history is empty)
    if (lastHistoryId) {
      try {
        return CeramicFeed.aggregateHistory(history, lastHistoryId)
      } catch (exception) {
        // if history id not found or history broken - fallback to false, otherwise rethrow
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
      post = await CeramicFeed.getPost(postId) // trying to load post from Ceramic Network
    } catch (exception) {
      // rethrow any network/unexpected error
      if ('DOCUMENT_NOT_FOUND' !== exception.name) {
        throw exception
      }

      // otherwise (if document not found or broken) just skip it and continue process
      log.warn('imported ceramic feed item not exists', exception.message, exception, { postId, action })
    }

    // if we got ceramic document - formatting it and merging with the current feed
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

    // replacing the whole news feed with the new one posts from Ceramic
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

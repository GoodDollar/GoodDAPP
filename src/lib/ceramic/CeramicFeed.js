// @flow
/* eslint-disable require-await */

import { filter, groupBy, isArray, isEmpty, keys, last, negate } from 'lodash'
import Config from '../../config/config'

import IPFS from '../ipfs/IpfsStorage'
import { isValidCID } from '../ipfs/utils'
import logger from '../../lib/logger/js-logger'
import { batch } from '../../lib/utils/async'

import { CeramicModel, serializeCollection, serializeDocument } from './client'

const { ceramicIndex, ceramicLiveIndex, ceramicBatchSize } = Config
const log = logger.child({ from: 'CeramicFeed' })
const nonEmpty = negate(isEmpty)

// TODO: add logging
class Post extends CeramicModel {
  static index = ceramicIndex

  static liveIndex = ceramicLiveIndex
}

class CeramicFeed {
  get client() {
    return Post.client
  }

  async getPost(postId: string) {
    const post = await Post.find(postId)
    const serialized = serializeDocument(post)

    log.debug('get ceramic post', { serialized })
    return this._loadPostPictures(serialized)
  }

  async getPosts() {
    const feedPosts = await Post.all()
    const serialized = serializeCollection(feedPosts)

    log.debug('get ceramic posts collection', { serialized })
    return this._loadPostPictures(serialized)
  }

  async getHistoryId() {
    const { commitId } = await Post.getLiveIndex()
    const historyId = String(commitId)

    log.debug('get history id', { historyId })
    return historyId
  }

  async getHistory(afterHistoryId = null) {
    const { allCommitIds, commitId } = await Post.getLiveIndex()
    const historyId = String(commitId)

    let commitIds = allCommitIds.map(String)
    let history = []

    log.debug('get history', { commitId, commitIds, afterHistoryId })

    if (afterHistoryId) {
      const afterId = String(afterHistoryId)
      let afterIndex = commitIds.findIndex(commitId => commitId === afterId)

      if (afterIndex < 0) {
        throw new Error(`Couldn't find history id '${afterId}'`)
      }

      commitIds = commitIds.slice(afterIndex + 1)
    }

    log.debug('Got commit IDs:', { commitIds })

    const commits = batch(commitIds, ceramicBatchSize, async cid => {
      const { content, commitId } = await CeramicModel.loadDocument(cid)

      log.debug('Got commit document:', { commitId: String(commitId), content })
      return content
    })

    log.debug('Got commits:', { commits })

    const aggregated = groupBy(filter(commits, nonEmpty), 'item')

    history = filter(
      keys(aggregated).map(item => {
        const records = history[item]
        const lastRecord = last(records)

        log.debug('picking status for', { item, lastRecord })

        // if last status is updated - scrolling through previous statuses
        if (lastRecord.action === 'updated') {
          let index = records.length - 2

          while (index >= 0) {
            const record = records[index]

            log.debug('scrolling history for updated item', { item, record })

            switch (record.action) {
              case 'added':
                // if found 'added' - return 'added'
                log.debug('picked status for', { item, record })
                return record
              case 'removed':
                // if found 'removed' - ignore the item,
                // this is impossible maybe some error
                log.debug('skipping status for', { item })
                // eslint-disable-next-line array-callback-return
                return
              default:
                // skipping other 'updated'
                break
            }

            index -= 1
          }

          // if we hadn't found any 'added' or 'deleted'
          // going out of the loop to return the last status
        }

        // if last status is 'removed' or 'added' - return it
        log.debug('picked status for', { item, record: lastRecord })
        return lastRecord
      }),
    )

    return { historyId, history }
  }

  /** @private */
  async _loadPostPictures(documentOrFeed: any) {
    log.debug('load post picture', { documentOrFeed })

    if (isArray(documentOrFeed)) {
      return batch(documentOrFeed, ceramicBatchSize, async document => this._loadPostPictures(document))
    }

    const document = documentOrFeed
    let { picture } = document

    if (isValidCID(picture)) {
      picture = await IPFS.load(picture)
    }

    return { ...document, picture }
  }
}

export default new CeramicFeed()

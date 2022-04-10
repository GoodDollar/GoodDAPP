// @flow
/* eslint-disable require-await */

import { countBy, filter, groupBy, isArray, isEmpty, keys, last, negate } from 'lodash'
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

    const commits = await batch(commitIds, ceramicBatchSize, async cid => {
      const { content, commitId } = await CeramicModel.loadDocument(cid)

      log.debug('Got commit document:', { commitId: String(commitId), content })
      return content
    })

    log.debug('Got commits:', { commits })

    const aggregated = groupBy(filter(commits, nonEmpty), 'item')

    history = filter(
      keys(aggregated).map(item => {
        let action
        const records = history[item]

        // read history of specific document, aggredate by the event count
        const { added, removed, updated } = countBy(records, 'action')

        log.debug('picking status for', { item, records, added, removed, updated })

        switch (Math.sign(added - removed)) {
          case -1:
            // if removed actions > added actions - remove item
            action = 'removed'
            break
          case 1:
            // if removed actions < added actions - add item
            action = 'added'
            break
          default: {
            // if removed equal added OR both removed/added were 0
            let shouldUpdate = false

            if (added > 0) {
              // if there were 'added' and 'removed' - picking them
              const lastRecord = last(records.filter(({ action }) => 'updated' !== action))

              // if last action was added - the document may changed, so we need to update it
              shouldUpdate = lastRecord.action === 'added'
            }

            // if there were added and we should re-fetch
            // or there weren't added but there were updates
            if (shouldUpdate || updated > 0) {
              // we have to update item.
              action = 'updated'
              break
            }

            // otherwise do nothing, return empty record to be ignored
            log.debug('skipping status change for', { item })

            // eslint-disable-next-line array-callback-return
            return
          }
        }

        const record = { item, action }

        log.debug('picked status for', record)
        return record
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

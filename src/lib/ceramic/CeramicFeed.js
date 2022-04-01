// @flow
/* eslint-disable require-await */

import { isArray, isEmpty, negate } from 'lodash'
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
    }).then(documents => documents.filter(nonEmpty))

    log.debug('Got commits:', { commits })

    // prepare state map
    const map = commits.reduce((itemStates, { item, action }) => {
      const itemState = item in itemStates ? { ...itemStates[item] } : {}

      itemState[action] = true
      return { ...itemStates, [item]: itemState }
    }, {})

    history = commits.filter(({ item, action }) => {
      log.debug('commits filter', { item, action })

      switch (action) {
        case 'added':
          // if item was added then removed during last changes - don't need to fetch it
          return !map[item].removed
        case 'updated':
          // getting item will return latest content - don't need to refetch it on each update
          return !map[item].added
        default:
          // always return 'removed' actions
          return true
      }
    })

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

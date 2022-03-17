// @flow
/* eslint-disable require-await */

import { isArray, isEmpty, negate } from 'lodash'
import Config from '../../config/config'

import IPFS from '../ipfs/IpfsStorage'
import { isValidCID } from '../ipfs/utils'
import logger from '../../lib/logger/js-logger'
import { CeramicModel, serializeCollection, serializeDocument } from './client'

const log = logger.child({ from: 'CeramicFeed' })

// TODO: add logging
class Post extends CeramicModel {
  static index = Config.ceramicIndex

  static liveIndex = Config.ceramicLiveIndex
}

class CeramicFeed {
  subscriptions = new WeakMap()

  get client() {
    return Post.client
  }

  async getPost(postId: string) {
    const post = await Post.find(postId)
    const serialized = serializeDocument(post)

    return this._loadPostPictures(serialized)
  }

  async getPosts() {
    const feedPosts = await Post.all()
    const serialized = serializeCollection(feedPosts)

    return this._loadPostPictures(serialized)
  }

  async getHistory(afterHistoryId = null) {
    const { allCommitIds, commitId } = await Post.getLiveIndex()
    let commitIds = allCommitIds.map(String)
    let history = []

    if (afterHistoryId) {
      const afterId = String(afterHistoryId)
      let afterIndex = allCommitIds.findIndex(commitId => commitId === afterId)

      if (afterIndex < 0) {
        throw new Error(`Couldn't find history id '${afterId}'`)
      }

      commitIds = commitIds.slice(afterIndex + 1)
    }

    log.debug('Got commit IDs:', { commitIds })

    const commits = await Promise.all(
      commitIds.map(async cid => {
        const { content, commitId } = await CeramicModel.loadDocument(cid)

        log.debug('Got commit document:', { commitId: String(commitId), content })
        return content
      }),
    ).then(documents => documents.filter(negate(isEmpty)))

    log.debug('Got commits:', { commits })

    // prepare state map
    const map = commits.reduce((itemStates, { item, action }) => {
      const itemState = item in itemStates ? { ...itemStates[item] } : {}

      itemState[action] = true
      return { ...itemStates, [item]: itemState }
    }, {})

    history = commits.filter(({ item, action }) => {
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

    return { historyId: String(commitId), history }
  }

  /**
   * //TODO: maybe unused ?
   * @deprecated
   */
  async subscribe(onAction) {
    const { subscriptions } = this
    const liveIndex = await Post.getLiveIndex()

    const subscription = liveIndex.subscribe(({ content }) => {
      const { action, item } = content || {}

      if (!isEmpty(content)) {
        onAction(action, item)
      }
    })

    const unsubscribe = subscription.unsubscribe.bind(subscription)

    subscription.unsubscribe = () => {
      subscriptions.delete(onAction)
      return unsubscribe()
    }

    subscriptions.set(onAction, subscription)
    return subscription
  }

  /**
   * //TODO: maybe unused ?
   * @deprecated
   */
  unsubscribe(onAction) {
    const { subscriptions } = this

    if (!subscriptions.has(onAction)) {
      return
    }

    subscriptions.get(onAction).unsubscribe()
  }

  /** @private */
  async _loadPostPictures(documentOrFeed: any) {
    if (isArray(documentOrFeed)) {
      return Promise.all(documentOrFeed.map(async (document: object) => this._loadPostPictures(document)))
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

// @flow
/* eslint-disable require-await */

import { isArray, isEmpty, noop, pick } from 'lodash'
import Config from '../../config/config'

import IPFS from '../ipfs/IpfsStorage'
import { isValidCID } from '../ipfs/utils'
import { CeramicModel, serializeCollection, serializeDocument } from './client'

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

  async getHistory(afterHistoryId) {
    let history = []
    const { allCommitIds, commitId } = await Post.getLiveIndex()

    if (afterHistoryId) {
      const afterId = String(afterHistoryId)
      let afterIndex = allCommitIds.findIndex(commitId => String(commitId) === afterId)

      if (afterIndex >= 0) {
        const commits = await Promise.all(
          allCommitIds.slice(afterIndex + 1).map(async commitId => CeramicModel.loadDocument(commitId)),
        )
          .filter(({ content }) => !isEmpty(content))
          .map(({ content }) => pick(content, 'item', 'action'))

        // prepare state map
        const map = commits.reduce((acc, { item, action }) => {
          const itemState = item in acc ? { ...acc[item] } : {}

          itemState[action] = true
          return { ...acc, [item]: itemState }
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
      }
    }

    return { historyId: commitId, history }
  }

  async subscribe(onAction = noop) {
    const liveIndex = await Post.getLiveIndex()
    const subscription = liveIndex.subscribe(({ content }) => {
      const { action, item } = content

      onAction(action, item)
    })

    this.subscriptions.set(onAction, subscription)
    return subscription
  }

  unsubscribe(onAction = noop) {
    const { subscriptions } = this

    if (!subscriptions.has(onAction)) {
      return
    }

    const subscription = subscriptions.get(onAction)

    if (!subscription.closed) {
      subscriptions.get(onAction).unsubscribe()
    }

    subscriptions.delete(onAction)
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

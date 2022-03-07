// @flow
/* eslint-disable require-await */

import { isValidCID } from '../ipfs/utils'
import IPFS from '../ipfs/IpfsStorage'
import { Feed, Post } from './models'
import { isPagination, serializeCollection, serializeDocument, serializePagination } from './client'

class CeramicFeed {
  get client() {
    return Feed.client
  }

  async getFeeds() {
    const feeds = await Feed.all()

    return serializeCollection(feeds)
  }

  async getMainFeed() {
    const [mainFeed] = await Feed.all()

    return serializeDocument(mainFeed)
  }

  async getPost(postId: string) {
    const post = await Post.find(postId)
    const serialized = serializeDocument(post)

    return this._loadPostPictures(serialized)
  }

  async getPosts(feedId: string, page: number = 1, count: number = 10) {
    const feedPosts = await Post.paginateBy('feed', feedId, page, count)
    const serialized = serializePagination(feedPosts)

    return this._loadPostPictures(serialized)
  }

  /** @private */
  async _loadPostPictures(documentOrFeed: any) {
    if (isPagination(documentOrFeed)) {
      const feed = documentOrFeed
      let { items } = feed

      items = await Promise.all(items.map(async (document: object) => this._loadPostPictures(document)))

      return { ...feed, items }
    }

    const document = documentOrFeed
    let { picture } = document

    if (!isValidCID(picture)) {
      picture = await IPFS.load(picture)
    }

    return { ...document, picture }
  }
}

export default new CeramicFeed()

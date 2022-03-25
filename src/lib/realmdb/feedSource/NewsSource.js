import moment from 'moment'
import CeramicFeed from '../../ceramic/CeramicFeed'
import FeedSource from './FeedSource'

export default class NewsSource extends FeedSource {
  // format from ceramic format to TreadDB format
  formatCeramicPost(ceramicPost) {
    return {
      _id: ceramicPost.id,
      id: ceramicPost.id,
      createdDate: moment(ceramicPost.published).format(),
      date: moment(ceramicPost.published).format(),
      displayType: 'news',
      status: 'completed',
      type: 'news',
      data: {
        reason: ceramicPost.content,
        counterPartyFullName: ceramicPost.title,
        subtitle: ceramicPost.title,
        picture: ceramicPost.picture,
        readMore: true,
      },
    }
  }

  async syncFromRemote() {
    const { log, Feed, storage } = this
    const ceramicCachedHistoryId = await storage.getItem('GD_CERAMIC_HISTORY')
    log.info('ceramic sync from remote started', { ceramicCachedHistoryId })

    if (!ceramicCachedHistoryId) {
      const ceramicPosts = await CeramicFeed.getPosts()
      log.debug('Ceramic fetched posts', ceramicPosts)

      const formatedCeramicPosts = ceramicPosts.map(this.formatCeramicPost)

      await Feed.save(...formatedCeramicPosts)

      const historyId = await CeramicFeed.getHistoryId()
      await storage.setItem('GD_CERAMIC_HISTORY', historyId)
    } else {
      const { history, historyId } = await CeramicFeed.getHistory(ceramicCachedHistoryId)
      log.debug('Ceramic history', { history, historyId })

      await Promise.all(
        history.map(async ({ item: postId, action }) => {
          log.debug('ceramic feed item action', { postId, action })

          switch (action) {
            case 'added':
            case 'updated': {
              const post = await CeramicFeed.getPost(postId)
              await Feed.save(this.formatCeramicPost(post))
              break
            }
            default: {
              await Feed.delete(postId)
              break
            }
          }
        }),
      )

      await storage.setItem('GD_CERAMIC_HISTORY', historyId)
    }

    log.info('ceramic sync from remote done')
  }
}

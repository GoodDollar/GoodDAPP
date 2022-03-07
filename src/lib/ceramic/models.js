import Config from '../../config/config'
import { CeramicModel } from './client'

export class Feed extends CeramicModel {
  static index = Config.ceramicFeedIndex
}

export class Post extends CeramicModel {
  static indexes = {
    feed: Config.ceramicPostsIndex,
  }
}

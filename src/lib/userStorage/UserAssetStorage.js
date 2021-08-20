// @flow
import { assign } from 'lodash'

import IPFS from '../ipfs/IpfsStorage'
import { ThreadDB } from '../textile/ThreadDB'

export class UserAssetStorage {
  fileBackend: any

  frontendDB: ThreadDB

  static factory(frontendDB: ThreadDB): UserAssetStorage {
    return new UserAssetStorage(IPFS, frontendDB)
  }

  constructor(fileBackend: any, frontendDB: ThreadDB) {
    assign(this, { fileBackend, frontendDB })
  }

  // eslint-disable-next-line require-await
  async store(dataURL: string): Promise<string> {
    return this.fileBackend.store(dataURL)
  }
}

export default UserAssetStorage.factory

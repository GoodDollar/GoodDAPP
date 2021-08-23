// @flow
import { assign, pick } from 'lodash'

import IPFS from '../ipfs/IpfsStorage'
import { ThreadDB } from '../textile/ThreadDB'

export class UserAssetStorage {
  fileBackend: any

  frontendDB: ThreadDB

  localCache: { [string]: { binary: boolean, dataUrl: string } } = {}

  static factory(frontendDB: ThreadDB): UserAssetStorage {
    return new UserAssetStorage(IPFS, frontendDB)
  }

  constructor(fileBackend: any, frontendDB: ThreadDB) {
    assign(this, { fileBackend, frontendDB })
  }

  // eslint-disable-next-line require-await
  async store(dataUrl: string): Promise<string> {
    const cid = await this.fileBackend.store(dataUrl)

    await this._writeCache(cid, { dataUrl, binary: true })
    return cid
  }

  // eslint-disable-next-line require-await
  async load(cid: string, withMetadata: boolean = false): Promise<string | { binary: boolean, dataUrl: string }> {
    let avatar = await this._readCache(cid)

    if (!avatar) {
      avatar = await this.fileBackend.load(cid, true)
      await this._writeCache(cid, avatar)
    }

    return withMetadata ? avatar : avatar.dataUrl
  }

  // async as invokes threaddb method to remove asset from the cache collection
  async clearCache(cid: string): Promise<void> {
    await this.frontendDB.Ipfs.delete(cid)
    delete this.localCache[cid]
  }

  async _readCache(cid: string): Promise<string | null> {
    const { localCache } = this
    let data = localCache[cid]

    if (!data) {
      data = await this.frontendDB.Ipfs.findById(cid)

      if (data) {
        localCache[cid] = pick(data, 'dataUrl', 'binary')
      }
    }

    return data
  }

  async _writeCache(cid: string, data: { dataUrl: string, binary: boolean }): Promise<void> {
    const { dataUrl, binary = true } = data
    const cachedData = { dataUrl, binary }

    await this.frontendDB.Ipfs.save({ _id: cid, ...cachedData })
    this.localCache[cid] = cachedData
  }
}

export default UserAssetStorage.factory

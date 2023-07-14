import { pick, values } from 'lodash'
import api from '../../API/api'
import { NETWORK_ID } from '../../constants/network'
import { FeedSource } from '../feed'

const SYNC_CHAINS = values(pick(NETWORK_ID, 'CELO', 'MAINNET', 'GOERLI'))
const LAST_BLOCK_ITEM = 'GD_lastTatumBlock'

export default class TatumSource extends FeedSource {
  async syncFromRemote() {
    const { db, /*Feed, */ log, storage } = this
    const { /*user, encryptedFeed*/ address } = db

    const lastBlock = await storage.getItem(LAST_BLOCK_ITEM)

    log.info('Tatum sync started', { lastBlock, address })

    await SYNC_CHAINS.reduce(
      (promise, chainId) =>
        promise.then(async () => {
          const txs = await api.tatumQuery(address, chainId, lastBlock)

          log.info('Tatum got txs', { txs, chainId })
        }),
      Promise.resolve(),
    )

    // if (lastBlock > 0) {
    //   syncQuery.date = { $gt: new Date(lastBlock) }
    // }

    // // const newItems = await db.wrapQuery(() => encryptedFeed.find(syncQuery))

    // const filtered = newItems.filter(_ => !_._id.toString().includes('settings') && _.txHash)

    // log.debug('_syncFromRemote', { newItems, filtered, lastSync: lastBlock })

    // if (filtered.length) {
    //   let decrypted = (await Promise.all(filtered.map(i => db.decrypt(i)))).filter(_ => _)
    //   log.debug('_syncFromRemote', { decrypted })

    //   await Feed.save(...decrypted)
    // }

    //    storage.setItem('GD_lastRealmSync', Date.now())

    // // sync items that we failed to save
    // const failedSync = await Feed.find({ sync: false }).toArray()

    // if (failedSync.length) {
    //   log.debug('_syncFromRemote: saving failed items', failedSync.length)

    //   failedSync.forEach(async item => {
    //     await db.encrypt(item)

    //     Feed.table.update({ _id: item.id }, { $set: { sync: true } })
    //   })
    // }

    log.info('Tatum sync done')
  }
}

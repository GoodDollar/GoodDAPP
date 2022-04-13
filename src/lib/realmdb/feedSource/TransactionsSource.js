import FeedSource from './FeedSource'

export default class TransactionsSource extends FeedSource {
  async syncFromRemote() {
    const { db, log, Feed, storage } = this
    const { user, encryptedFeed } = db

    const lastSync = (await storage.getItem('GD_lastRealmSync')) || 0
    const newItems = await db.wrapQuery(() =>
      encryptedFeed.find({
        user_id: user.id,
        date: { $gt: new Date(lastSync) },
      }),
    )

    const filtered = newItems.filter(_ => !_._id.toString().includes('settings') && _.txHash)

    log.debug('_syncFromRemote', { newItems, filtered, lastSync })

    if (filtered.length) {
      let decrypted = (await Promise.all(filtered.map(i => db.decrypt(i)))).filter(_ => _)
      log.debug('_syncFromRemote', { decrypted })

      await Feed.save(...decrypted)
    }

    storage.setItem('GD_lastRealmSync', Date.now())

    //sync items that we failed to save
    const failedSync = await Feed.find({ sync: false }).toArray()

    if (failedSync.length) {
      log.debug('_syncFromRemote: saving failed items', failedSync.length)

      failedSync.forEach(async item => {
        await db.encrypt(item)

        Feed.table.update({ _id: item.id }, { $set: { sync: true } })
      })
    }

    log.info('_syncfromremote done')
  }
}

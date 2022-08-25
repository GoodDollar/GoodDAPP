const fromDate = new Date('2022/08/25')

const dups = [
  '438d04bb495445fdc73fcf4a094f08b59bfb07d6',
  '5e30c18ab9cbadbbc78295efe74c171c1d330a68',
  'f20c90ef5a3766acd6f6c43f207a6cb4e1e47965',
  '19f74bc0114a491e9063e0777bec01ff0e617008',
  'e37be25c6601d856415089d70cab2c1afcce8c90',
  'fa099df98af9df6e748294d668fe4e43e09087af',
  '461cf6da71bdb4aad65cf1dc2ed4f164036a63de',
  'f8153aef7abacf3c2915dca7b6dfcb615cbf1a7e',
  'c10d790911f8e8a7f25003b89118cf3612eced9f',
  '2183dccd7525a2464d7713973f6aaad485861def',
  'ae1f17b1e4cc7e69d9fbbec9791dea2b776749d2',
  '65219d1429ba5d0d279df0d3350fecbbeb484cc7',
  '42acc150f42e05935a07a9b602bc5ad718085c2f',
  '9306e442c670d7ac30461b39231711fdbbcbfb02',
  '56b6f85c00f2870320513f97fc4eda5a6f65e3b7',
  'e1d5c4ab71e8c8551fa3e3e7006848557d79f27e',
  'ae3c0d15c46e0e45011b913b7227c351bf707024',
  '2afe3c551a669f5712ea8012339b94a9c46a608f',
  'd66dafd4161ffc95b9850969df62a0bb03f6e5a9',
  '779b507543f42eff1b42bdfa1236e3f1ac0a454c',
  'cf17cff2898c977d681ba101b550b5c2a404dba6',
  '5057ad5e869e0ac9ac3c8eca9e8244b5b82bb735',
  '86db07cb26373a33f47bddbd39c7d15328f6c3c8',
  '7cecbdbf747746daf450dd3c993dd9200ec07ac3',
  'abd0aba824f71f68476bbe563c0c84b33b27ee45',
  '5dc479bf922dd72bc9229274b5ceb845ac4868c0',
  'e8ee2b8059add4e286bf2a6036add0466e5f922b',
  '2018869f0c028a94a5497196744783f55bcce53c',
  '7ffa07e409f1af60655326873cabff0331c8deab',
]

/**
 * @returns {Promise<void>}
 */
// eslint-disable-next-line require-await
const deleteDups = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  const faceIdentifier = userStorage.getFaceIdentifier()
  const { account: walletAddress } = goodWallet

  if (!dups.includes(faceIdentifier.toLowerCase())) {
    log.info('no duplicate detected, skipping', { faceIdentifier, walletAddress })
    return
  }

  log.info('duplicated account detected', { faceIdentifier })

  // also de-whitelists user
  await userStorage.deleteFaceSnapshot()
  log.info('successfully de-whitelisted', { walletAddress })
}

export default { fromDate, update: deleteDups, key: 'deleteDups' }

import { isString } from 'lodash'

import userStorage from '../userStorage/UserStorage'
import Base64Storage from '../nft/Base64Storage'

import { isValidDataUrl } from '../utils/base64'
import { isValidCID } from '../ipfs/utils'

const fromDate = new Date('2021/06/08')

const uploadProfileAvatar = async () => {
  const avatar = await userStorage.getProfileFieldValue('avatar')

  // if empty - do nothing
  if (!isString(avatar)) {
    return
  }

  // if still base64 - re-set avatar, userStorage will resize & upload
  // both avatar and smallAvatar it and store theirs CIDs in the GunDB
  if (isValidDataUrl(avatar)) {
    await userStorage.setAvatar(avatar, true)
  } else {
    // if already cid - check is cid valid and exists
    try {
      if (!isValidCID(avatar)) {
        throw new Error('Not a valid CID')
      }

      await Base64Storage.load(avatar, true)
    } catch {
      // set null (delete avatar) if fails
      await userStorage.removeAvatar(true)
    }
  }
}

// const hasCounterPartyAvatar = ({ data }) => {
//   const { counterPartySmallAvatar } = data || {}

//   return !!counterPartySmallAvatar
// }

// const uploadCounterPartyAvatar = async feedEvent => {
//   const { data } = feedEvent
//   const { counterPartySmallAvatar } = data
//   let avatar = counterPartySmallAvatar

//   // if still base64 - re-upload and store CID in the GunDB
//   if (isValidDataUrl(avatar)) {
//     avatar = await Base64Storage.store(avatar)
//   }

//   if (avatar === counterPartySmallAvatar) {
//     return
//   }

//   userStorage.feedStorage.updateFeedEvent({
//     ...feedEvent,
//     data: {
//       ...data,
//       counterPartySmallAvatar: avatar,
//     },
//   })
// }

/**
 * @returns {Promise<void>}
 */
const uploadAvatars = async (lastUpdate, prevVersion, log) => {
  // const allEvents = await userStorage.getAllFeed()
  // const eventsWithCounterParty = allEvents.filter(hasCounterPartyAvatar)

  await uploadProfileAvatar()

  // await Promise.all(eventsWithCounterParty.map(uploadCounterPartyAvatar))
}

export default { fromDate, update: uploadAvatars, key: 'uploadAvatars' }

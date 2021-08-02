import { isString } from 'lodash'

import userStorage from '../../userStorage/UserStorage'

import { asImageRecord, isValidBase64Image } from '../../utils/image'
import { loadIfRawBase64, updateFeedEventAvatar } from '../utils'

const fromDate = new Date('2021/07/15')

const uploadProfileAvatar = async () => {
  const avatar = await userStorage.getProfileFieldValue('avatar')

  // if empty - do nothing
  if (!isString(avatar)) {
    return
  }

  // if still base64 - re-set avatar, userStorage will resize & upload
  // both avatar and smallAvatar it and store theirs CIDs in the GunDB
  // if already cid - check is cid valid
  let avatarRecord

  try {
    // if still base64 - convert to image record
    if (isValidBase64Image(avatar)) {
      avatarRecord = await asImageRecord(avatar)
    } else {
      // if already cid - check is cid valid,
      // then check if still raw base64
      // if yes - load it as the image record
      // if cid isn't valid, an exception will be thrown
      avatarRecord = await loadIfRawBase64(avatar)
    }

    // if we have image record prepared - re-set avatar from it
    // userStorage will resize & upload both avatar and smallAvatar
    // as a single nft.storage asset and store its CID in the GunDB
    if (avatarRecord) {
      await userStorage.setAvatar(avatarRecord, true)
    }
  } catch {
    // set null (delete avatar) if fails
    await userStorage.removeAvatar(true)
  }
}

const hasCounterPartyAvatar = ({ data }) => {
  const { counterPartySmallAvatar } = data || {}

  return !!counterPartySmallAvatar
}

const uploadCounterPartyAvatar = async feedEvent => {
  const { data } = feedEvent
  const { counterPartySmallAvatar } = data
  const avatar = await updateFeedEventAvatar(counterPartySmallAvatar)

  if (avatar === counterPartySmallAvatar) {
    return
  }

  userStorage.feedStorage.updateFeedEvent({
    ...feedEvent,
    data: {
      ...data,
      counterPartySmallAvatar: avatar,
    },
  })
}

/**
 * @returns {Promise<void>}
 */
const uploadAvatars = async (lastUpdate, prevVersion, log) => {
  const allEvents = await userStorage.getAllFeed()
  const eventsWithCounterParty = allEvents.filter(hasCounterPartyAvatar)

  await uploadProfileAvatar()
  await Promise.all(eventsWithCounterParty.map(uploadCounterPartyAvatar))
}

export default { fromDate, update: uploadAvatars, key: 'uploadAvatars' }

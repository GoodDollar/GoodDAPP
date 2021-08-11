import userStorage from '../userStorage/UserStorage'

import { analyzeAvatar, updateFeedEventAvatar } from './utils'

const fromDate = new Date('2021/08/06')

const uploadProfileAvatar = async () => {
  const avatar = await userStorage.getProfileFieldValue('avatar')
  const { shouldUpload, shouldUnset, dataUrl } = await analyzeAvatar(avatar)

  if (shouldUnset) {
    await userStorage.removeAvatar()
  } else if (shouldUpload) {
    await userStorage.setAvatar(dataUrl)
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

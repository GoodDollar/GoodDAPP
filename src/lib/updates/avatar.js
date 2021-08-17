import { first, groupBy, set, values } from 'lodash'
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
  const { counterPartySmallAvatar, counterPartyAddress } = data || {}

  return !(!counterPartySmallAvatar || !counterPartyAddress)
}

const uploadCounterPartyAvatar = async feedEvents => {
  const {
    data: { counterPartySmallAvatar },
  } = first(feedEvents)

  try {
    // upload only unique avatars
    const avatar = await updateFeedEventAvatar(counterPartySmallAvatar)

    if (avatar === counterPartySmallAvatar) {
      return
    }

    // set uploaded CID to the all events in the group
    feedEvents.forEach(feedEvent => {
      set(feedEvent, 'data.counterPartySmallAvatar', avatar)
      userStorage.feedStorage.updateFeedEvent(feedEvent)
    })
  } catch {
    // catch quietly individual upload exception
    return
  }
}

/**
 * @returns {Promise<void>}
 */
const uploadAvatars = async (lastUpdate, prevVersion, log) => {
  const allEvents = await userStorage.getAllFeed()
  const eventsWithCounterParty = allEvents.filter(hasCounterPartyAvatar)

  // group events by counterparty to decrease uploads
  const groupedEvents = values(groupBy(eventsWithCounterParty, 'data.counterPartyAddress'))

  await uploadProfileAvatar()
  log.debug('done storing user avatar')
  await Promise.all(groupedEvents.map(uploadCounterPartyAvatar))
  log.debug('done storing feed avatars')
}

export default { fromDate, update: uploadAvatars, key: 'uploadAvatars' }

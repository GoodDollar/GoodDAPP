import * as feedUtils from './feed'

// eslint-disable-next-line require-await
export const analyzeAvatar = async (avatar, userStorage) => feedUtils.analyzeAvatar(avatar, userStorage)

// eslint-disable-next-line require-await
export const updateFeedEventAvatar = async (avatar, userStorage) => feedUtils.updateFeedEventAvatar(avatar, userStorage)

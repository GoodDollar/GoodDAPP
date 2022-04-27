import { defaultUserState } from '../constants/user'
import { createObjectStorageContext } from './utils'

export const UserObjectStorage = createObjectStorageContext(defaultUserState)

export const UserContext = UserObjectStorage.Context

export const UserContextProvider = UserObjectStorage.ContextProvider

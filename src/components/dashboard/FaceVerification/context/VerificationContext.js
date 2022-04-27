import { defaultVerificationState } from '../sdk/FaceTecSDK.constants'
import { createObjectStorageContext } from '../../../../lib/contexts/utils'

export const VerificationStorage = createObjectStorageContext(defaultVerificationState)

export const VerificationContext = VerificationStorage.Context

export const VerificationContextProvider = VerificationStorage.ContextProvider

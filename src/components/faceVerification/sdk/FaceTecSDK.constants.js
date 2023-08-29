import { t } from '@lingui/macro'
import Config from '../../../config/config'

export const unexpectedErrorMessage = t`An unexpected issue during the face verification API call`

export const resultSuccessMessage = t`You’re a beautiful
& unique unicorn!`
export const resultFacescanUploadMessage = t`Uploading Your face snapshot to verify`
export const resultFacescanProcessingMessage = t`Verifying you're
one of a kind`

export const MAX_ATTEMPTS_ALLOWED = Config.faceVerificationMaxAttemptsAllowed
export const MAX_RETRIES_ALLOWED = MAX_ATTEMPTS_ALLOWED - 1

export const defaultVerificationState = {
  attemptsCount: 0,
  attemptsHistory: [],
  reachedMaxAttempts: false,
}

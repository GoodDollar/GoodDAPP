import Config from '../../../../config/config'

export const resultSuccessMessage = `You’re a beautiful\n& unique unicorn!`
export const resultFacescanUploadMessage = `Uploading Your face snapshot to verify`
export const resultFacescanProcessingMessage = `Verifying you're\none of a kind`

export const MAX_ATTEMPTS_ALLOWED = Config.faceVerificationMaxAttemptsAllowed
export const MAX_RETRIES_ALLOWED = MAX_ATTEMPTS_ALLOWED - 1

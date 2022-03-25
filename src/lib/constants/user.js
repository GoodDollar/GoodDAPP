export const defaultAccountValue = {
  balance: undefined,
  entitlement: undefined,
  ready: false,
}

export const defaultVerificationState = {
  attemptsCount: 0,
  attemptsHistory: [],
  reachedMaxAttempts: false,
}

export const defaultUserState = {
  isLoggedIn: false,
  isLoggedInCitizen: false,
  account: defaultAccountValue,
  uploadedAvatar: undefined,
  verification: defaultVerificationState,
}

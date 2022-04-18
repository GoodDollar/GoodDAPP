export const defaultVerificationState = {
  attemptsCount: 0,
  attemptsHistory: [],
  reachedMaxAttempts: false,
}

export const defaultUserState = {
  isLoggedIn: false,
  isLoggedInCitizen: false,
  balance: undefined,
  entitlement: undefined,
  ready: false,
  ...defaultVerificationState,
}

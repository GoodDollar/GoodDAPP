import analytics from '../analytics/analytics'

export const usePosthogClient = () => {
  const posthog = analytics.posthog
  return posthog
}

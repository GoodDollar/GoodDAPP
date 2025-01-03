import { useEffect, useMemo } from 'react'
import { usePostHog } from 'posthog-react-native'
import { once } from 'lodash'

import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'useFeatureFlags' })

const defaultFeatureFlags = {
  'show-usd-balance': false,
  'wallet-chat': true,
  'micro-bridge': true,
  'send-receive-feature': true,
  'dashboard-buttons': true,
  'goodid-newsfeed': false,
  'gw-deprecation-dialog': false,
}

const defaultFlagsWithPayload = {
  'next-tasks': {
    tasks: [
      {
        enabled: false,
        tag: 'Just an example for options',
        taskHeader: "If you don't want to show a header, remove the taskheader",
        description: 'What will be shown in the task container ',
        url: 'https://www.google.com',
        buttonText: 'Go to the survey.',
        showButtons: false,
      },
      {
        enabled: true,
        tag: 'Faces',
        taskHeader: 'What are your thoughts on Segmented Basic Income?',
        description:
          'Learn more about GoodOffers and explore the exciting opportunities coming up for GoodDollar members!',
        url: 'https://x.com/gooddollarorg/status/1851985741724676309',
        buttonText: 'Discover GoodOffers',
        showButtons: false,
      },
    ],
  },
  'claim-feature': {
    enabled: true,
    disabledMessage: '',
  },
  'share-link': [
    {
      shareTitle: 'I signed up to GoodDollar. Join me.',
      shareMessage:
        'If you believe in economic inclusion and the distribution of prosperity for all, then I invite you to sign up for GoodDollar and start collecting your daily digital UBI.\nUse my invite link and receive an extra {reward} G$ bonus:\n\n',
      id: 'celo',
      chance: 0,
    },
    {
      shareTitle: '',
      shareMessage: '',
      id: 'celo-onlyurl',
      chance: 1,
    },
  ],
  'security-dialog': {
    enabled: false,
    dialogText: '',
    dialogTitle: '',
    withButtons: false,
  },
}

const addLogger = once(posthog =>
  posthog.on('error', e => {
    log.error('PostHog fetch error', e.message)
  }),
)

export const useFeatureFlagOrDefault = featureFlag => {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) {
      return
    }
    addLogger(posthog)
  }, [posthog])

  return useMemo(() => posthog?.getFeatureFlag(featureFlag) ?? defaultFeatureFlags[featureFlag], [posthog, featureFlag])
}

export const useFlagWithPayload = featureFlag => {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) {
      return
    }
    addLogger(posthog)
  }, [posthog])

  return useMemo(
    () => posthog?.getFeatureFlagPayload(featureFlag) ?? defaultFlagsWithPayload[featureFlag],
    [posthog, featureFlag],
  )
}

import { useEffect, useMemo } from 'react'
import { usePostHog } from 'posthog-react-native'
import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'useFeatureFlags' })

const defaultFeatureFlags = {
  'show-usd-balance': false,
  'wallet-chat': true,
  'micro-bridge': true,
  'send-receive-feature': true,
  'dashboard-buttons': true,
}

const defaultFlagsWithPayload = {
  'next-task': {
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
        tag: 'Recap',
        description: 'Read our annual recap to learn what the GoodDollar community has achieved in 2023.',
        url: 'https://x.com/gooddollarorg/status/1741704879117045845?s=20',
        buttonText: 'Go to recap',
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

let alreadyHasErrorHandler = false

export const useFeatureFlagOrDefault = featureFlag => {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) {
      log.error('PostHog failed to initialize')
      return
    }

    if (!alreadyHasErrorHandler) {
      posthog.on('error', e => {
        log.error('PostHog fetch error', e.message)
      })

      alreadyHasErrorHandler = true
    }
  }, [posthog])

  const isEnabled = posthog ? posthog.getFeatureFlag(featureFlag) : undefined
  return isEnabled || defaultFeatureFlags[featureFlag]
}

export const useFlagWithPayload = featureFlag => {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) {
      log.error('posthog failed to initalize')
      return
    }

    if (posthog && !alreadyHasErrorHandler) {
      posthog.on('error', e => {
        log.error('posthog fetch error', e.message)
      })

      alreadyHasErrorHandler = true
    }
  }, [posthog])

  const payload = useMemo(() => (posthog ? posthog.getFeatureFlagPayload(featureFlag) : []), [posthog, featureFlag])

  return payload || defaultFlagsWithPayload[featureFlag]
}

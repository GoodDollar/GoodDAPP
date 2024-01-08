import React from 'react'
import { PostHogProvider, usePostHog } from 'posthog-react-native'

import Config from '../../config/config'

const { posthogApiKey, posthogHost } = Config
const posthogOpts = { host: posthogHost }

export const CustomPostHogProvider = ({ children }) => {
  if (!usePostHog()) {
    return (
      <PostHogProvider apiKey={posthogApiKey} options={posthogOpts} autocapture={false}>
        {children}
      </PostHogProvider>
    )
  }

  // already wrapped via provider
  return children
}

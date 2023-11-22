import { useSendAnalytics, IAnalyticsConfig, IAppProps } from '@gooddollar/web3sdk-v2'

import { assign, isArray } from 'lodash'
import { useCallback } from 'react'

import { getEnv, osVersion } from 'utils/env'
import { version } from '../../package.json'

const indicativeKey = import.meta.env.REACT_APP_INDICATIVE_KEY
const posthogKey = import.meta.env.REACT_APP_POSTHOG_KEY
const mixpanelKey = import.meta.env.REACT_APP_MIXPANEL_KEY

export const analyticsConfig: IAnalyticsConfig = {
    google: { enabled: true },
    indicative: { apiKey: indicativeKey, enabled: !!indicativeKey },
    posthog: { apiKey: posthogKey, enabled: !!posthogKey },
    mixpanel: { apiKey: mixpanelKey, enabled: !!mixpanelKey },
}

export const appInfo: IAppProps = {
    env: getEnv(),
    version,
    osVersion,
}

export interface IAnalyticsData {
    event: string
    action: string
    type?: string
    amount?: string | number
    tokens?: [string | undefined, string | undefined]
    network?: string
    token?: string
    error?: string
    label?: string
}

function useSendAnalyticsData(): (data: IAnalyticsData) => void {
    const send = useSendAnalytics()

    return useCallback(
        (data: IAnalyticsData): void => {
            const { event, tokens, ...trackData } = data

            if (isArray(tokens)) {
                assign(trackData, { tokens: [...tokens] })
            }

            send(event, trackData)
        },
        [send]
    )
}

export default useSendAnalyticsData

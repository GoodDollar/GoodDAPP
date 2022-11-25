import { IAnalyticsConfig, IAppProps, useSendAnalytics } from "@gooddollar/web3sdk-v2";
import { assign, isArray } from "lodash";
import { useCallback } from "react";

import { getEnv, osVersion } from 'utils/env'
import { version } from '../../package.json'

export const analyticsConfig: IAnalyticsConfig = {
  google: { enabled: true }
}

export const appInfo: IAppProps = {
  env: getEnv(),
  version,
  osVersion
}

export interface IAnalyticsData {
  event: string,
  action: string,
  type?: string,
  amount?: string | number,
  tokens?: [string | undefined, string | undefined],
  network?: string,
  token?: string
}

function useSendAnalyticsData(): (data: IAnalyticsData) => void {
  const send = useSendAnalytics();

  return useCallback((data: IAnalyticsData): void => {
    const { event, tokens, ...trackData } = data

    if (isArray(tokens)) {
      assign(trackData, { tokens: [...tokens] });
    }

    send(event, trackData);
  }, [send])
}

export default useSendAnalyticsData;

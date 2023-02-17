import { openLink } from '@gooddollar/web3sdk-v2'
import { noop } from 'lodash'
import { ReactElement, useRef } from 'react'

export interface IHttpsProviderProps {
    enabled: boolean
    children: ReactElement
}

const HTTPS = 'https:'

function checkSchemeAndRedirect(): boolean {
    const url = new URL(document.location.href)
    const shouldRedirect = url.protocol !== HTTPS

    if (shouldRedirect) {
        url.protocol = HTTPS
        // do not await
        openLink(url.toString(), '_self').catch(noop)
    }

    return shouldRedirect
}

export function HttpsProvider({ enabled, children }: IHttpsProviderProps): ReactElement | null {
    const redirectedRef = useRef(false)

    if (enabled && !redirectedRef.current) {
        redirectedRef.current = checkSchemeAndRedirect()
    }

    if (redirectedRef.current) {
        return null
    }

    return children
}

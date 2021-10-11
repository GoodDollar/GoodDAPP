import React, { ReactNode, useMemo } from 'react'
import { BLOCKED_ADDRESSES } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function Blocklist({ children }: { children: ReactNode }) {
    const { i18n } = useLingui()
    const { account } = useActiveWeb3React()
    const blocked: boolean = useMemo(() => Boolean(account && BLOCKED_ADDRESSES.indexOf(account) !== -1), [account])
    if (blocked) {
        return <div>{i18n._(t`Blocked address`)}</div>
    }
    return <>{children}</>
}

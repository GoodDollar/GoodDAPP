// @flow
import React from 'react'
import { SvgXml } from '@gooddollar/good-design'
import { NavLink } from 'components/Link'
import { ExternalLink } from 'theme'

import Donate from 'assets/svg/donate.svg'
import Claim from 'assets/svg/claim.svg'
import Swap from 'assets/svg/swap.svg'
import Dapplib from 'assets/svg/library.svg'

const actionIcons = {
    dapplib: {
        icon: Dapplib,
        width: 70,
        height: 40,
        route: 'https://www.notion.so/gooddollar/dApp-Library-c3260e6b31914ab599e649935ce771e3',
    },
    donate: {
        route: 'https://gooddollar.notion.site/Donate-to-a-G-Cause-e7d31fb67bb8494abb3a7989ebe6f181',
        icon: Donate,
        width: 40,
        height: 40,
    },
    claim: {
        route: '/claim',
        icon: Claim,
        width: 30,
        height: 40,
    },
    swap: {
        route: '/swap',
        icon: Swap,
        width: 30,
        height: 40,
    },
}

type ActionButtonProps = {
    action: string
    isExternal?: boolean
}
export const ActionButton = ({ action, isExternal = false }: ActionButtonProps) => {
    const { width, height, icon, route } = actionIcons[action]

    if (isExternal) {
        return (
            <ExternalLink url={route} withIcon={false} dataAttr={action}>
                <SvgXml width={width} height={height} src={icon} />
            </ExternalLink>
        )
    }

    return (
        <NavLink to={route} isNavBar>
            <SvgXml width={width} height={height} src={icon} />
        </NavLink>
    )
}

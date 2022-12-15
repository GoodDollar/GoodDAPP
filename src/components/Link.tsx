import * as H from 'history'
import React from 'react'

import {
    Link as ReactRouterLink,
    LinkProps as ReactRouterLinkProps,
    NavLink as ReactRouterNavLink,
    NavLinkProps as ReactRouterNavLinkProps,
} from 'react-router-dom'

function Link<S = H.LocationState>({
    href = '#',
    children,
    className = 'p-1 line md:p-2',
    ...rest
}: React.PropsWithoutRef<ReactRouterLinkProps<S>> & React.RefAttributes<HTMLAnchorElement>): JSX.Element {
    return (
        <ReactRouterLink href={href} className={className} {...rest}>
            {children}
        </ReactRouterLink>
    )
}

export default Link

export function NavLink<S = H.LocationState>({
    href = '#',
    children,
    className = 'p-2 line md:p-1 xl:p-3 whitespace-nowrap',
    ...rest
}: React.PropsWithoutRef<ReactRouterNavLinkProps<S>> & React.RefAttributes<HTMLAnchorElement>): JSX.Element {
    return (
        <ReactRouterNavLink href={href} className={className} activeClassName="active" {...rest}>
            {children}
        </ReactRouterNavLink>
    )
}

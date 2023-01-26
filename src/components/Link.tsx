import * as H from 'history'
import React from 'react'

import {
    Link as ReactRouterLink,
    LinkProps as ReactRouterLinkProps,
    NavLink as ReactRouterNavLink,
    NavLinkProps as ReactRouterNavLinkProps,
} from 'react-router-dom'

import { Pressable, Text, useColorModeValue } from 'native-base'
import { noop } from 'lodash'

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
    className = 'pt-2 pr-2 w-52 rounded-xl line xl:pr-3 whitespace-nowrap',
    onPress,
    ...rest
}: React.PropsWithoutRef<ReactRouterNavLinkProps<S>> &
    React.RefAttributes<HTMLAnchorElement> & { onPress: typeof noop }): JSX.Element {
    const textColor = useColorModeValue('goodGrey.700', 'goodGrey.300')

    return (
        <ReactRouterNavLink href={href} className={className} activeClassName="active" {...rest}>
            <Pressable onPress={onPress} _hover={{ bg: 'primary:alpha.10' }} py={1} px={2} borderRadius="12px">
                <Text fontFamily="subheading" fontSize="sm" color={textColor}>
                    {children}
                </Text>
            </Pressable>
        </ReactRouterNavLink>
    )
}

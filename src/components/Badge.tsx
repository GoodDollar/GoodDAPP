import React from 'react'

export type BadgeColor = 'default' | 'blue' | 'pink'

export interface BadgeProps {
    color?: BadgeColor
}

export const COLOR = {
    default: '',
    blue: 'outline-blue rounded xs blue px-2 py-1',
    pink: 'outline-pink rounded xs pink px-2 py-1',
}

function Badge({
    color = 'default',
    children,
    className = '',
}: BadgeProps & React.HTMLAttributes<HTMLDivElement>): JSX.Element {
    return <div className={`${COLOR[color]} ${className}`}>{children}</div>
}

export default Badge

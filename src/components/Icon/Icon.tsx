import * as React from 'react'

interface IconProps {
    children?: React.ReactNode
    viewBox: string
}

const Icon = ({ children, viewBox, ...rest }: IconProps): React.ReactElement => {
    return (
        <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" {...rest}>
            {children}
        </svg>
    )
}

export default Icon

import React from 'react'
import styled from 'styled-components'

export interface IconProps {
    children: React.ReactNode
    viewBox: string
    [p: string]: any
}

const SvgSC = styled.svg<{ size: string; width: string; height: string }>`
    height: ${({ size, height }) => height || size};
    width: ${({ size, width }) => width || size};
`

export const Icon = ({ children, viewBox, size, width, height, ...rest }: IconProps): React.ReactElement => {
    return (
        <SvgSC
            viewBox={viewBox}
            size={size}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
            {...rest}
        >
            {children}
        </SvgSC>
    )
}

export default Icon

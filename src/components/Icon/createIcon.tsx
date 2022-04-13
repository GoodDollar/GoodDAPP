import React from 'react'
import Icon from './Icon'

const createIcon = (
    path: React.ReactNode,
    { displayName, ...props }: { displayName: string; [x: string]: any }
): React.ElementType => {
    const IconComponent = (iconProps: any) => (
        <Icon {...props} {...iconProps}>
            {path}
        </Icon>
    )

    IconComponent.displayName = displayName

    return IconComponent
}

export default createIcon

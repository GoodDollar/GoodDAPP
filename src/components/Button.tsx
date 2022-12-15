import React from 'react'
import { ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router-dom'

const SIZE = {
    default: 'px-4 py-3',
    small: 'px-2 py-1',
    large: 'px-4 py-3',
}

const FILLED = {
    default: 'ransparent',
    blue: 'w-full rounded   pacity-100',
    pink: 'w-full rounded   pacity-100',
    gradient: 'w-full  from-blue to-pink',
}

const OUTLINED = {
    default: 'ransparent',
    blue: 'outline-blue rounded xs blue pacity-40',
    pink: 'outline-pink rounded xs pink pacity-40',
    gradient: 'from-blue to-pink',
}

const VARIANT = {
    outlined: OUTLINED,
    filled: FILLED,
}

export type ButtonColor = 'blue' | 'pink' | 'gradient' | 'default'

export type ButtonSize = 'small' | 'large' | 'default'

export type ButtonVariant = 'outlined' | 'filled'

export interface ButtonProps {
    children?: React.ReactChild | React.ReactChild[]
    color?: ButtonColor
    size?: ButtonSize
    variant?: ButtonVariant
}

function Button({
    children,
    className,
    color = 'default',
    size = 'default',
    variant = 'filled',
    ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
    return (
        <button
            className={`${VARIANT[variant][color]} ${SIZE[size]} rounded focus:outline-none focus:ring disabled:opacity-50  ${className}`}
            {...rest}
        >
            {children}
        </button>
    )
}

export default Button

// export function IconButton() {}

export function BackButton({ defaultRoute, className }: { defaultRoute: string; className?: string }): JSX.Element {
    const history = useHistory()
    return (
        <button
            onClick={() => {
                if (history.length < 3) {
                    history.push(defaultRoute)
                } else {
                    history.goBack()
                }
            }}
            className={`flex justify-center items-center p-2 mr-4 rounded-full w-12 h-12 ${className || ''}`}
        >
            <ChevronLeft className={'w-6 h-6'} />
        </button>
    )
}

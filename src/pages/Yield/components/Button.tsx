import React from 'react'
import { ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router-dom'

const FILLED = {
    default: '	w-full rounded   px-4 py-3',
    blue: 'w-full rounded   px-4 py-3',
    pink: 'w-full rounded   px-4 py-3',
    gradient: 'from-blue to-pink'
}

const OUTLINED = {
    default: 'outline-blue rounded xs blue px-2 py-1',
    blue: 'outline-blue rounded xs blue px-2 py-1',
    pink: 'outline-pink rounded xs pink px-2 py-1',
    gradient: 'from-blue to-pink'
}

const VARIANT = {
    outlined: OUTLINED,
    filled: FILLED
    // gradient: 'bg-gradient-to-r from-blue to-pink'
}

export type ButtonColor = 'blue' | 'pink' | 'gradient' | 'default'

export type ButtonVariant = 'outlined' | 'filled'

export interface ButtonProps {
    children?: React.ReactChild | React.ReactChild[]
    color?: ButtonColor
    variant?: ButtonVariant
}

function Button({
    children,
    className,
    color = 'default',
    variant = 'filled',
    ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
    return (
        <button
            className={`${VARIANT[variant][color]} focus:outline-none focus:ring disabled:opacity-50 ${className} `}
            {...rest}
        >
            {children}
        </button>
    )
}

export default Button

export function BackButton({ defaultRoute }: { defaultRoute: string }): JSX.Element {
    const history = useHistory()
    return (
        <Button
            onClick={() => {
                if (history.length < 3) {
                    history.push(defaultRoute)
                } else {
                    history.goBack()
                }
            }}
            className="p-2 mr-4 rounded-full w-10 h-10"
        >
            <ChevronLeft className={'w-6 h-6'} />
        </Button>
    )
}

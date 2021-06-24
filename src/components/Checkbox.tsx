import QuestionHelper from 'components/QuestionHelper'
import React from 'react'
import Settings from './Settings'

export type Color = 'pink' | 'blue'

const COLOR = {
    pink: 'focus:ring-pink',
    blue: 'focus:ring-blue'
}

export interface CheckboxProps {
    color: Color
    set: (value: boolean) => void
}

function Checkbox({
    color,
    set,
    className = '',
    ...rest
}: CheckboxProps & React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
    return (
        <input
            type="checkbox"
            onChange={event => set(event.target.checked)}
            className={`appearance-none h-5 w-5 rounded-sm ${COLOR[color]} ${className}`}
            {...rest}
        />
    )
}

export default Checkbox

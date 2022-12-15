import React from 'react'
import styled from 'styled-components'

export interface CheckboxProps {
    set: (value: boolean) => void
}

const CheckboxSC = styled.div`
    display: flex;
    position: relative;

    & label {
        background-color: #fff;
        border: 1px solid #cdd1e7;
        border-radius: 50%;
        cursor: pointer;
        height: 16px;
        left: 0;
        position: absolute;
        top: 0;
        width: 16px;
    }

    & label:after {
        border: 2px solid #fff;
        border-radius: 1px;
        border-top: none;
        border-right: none;
        content: '';
        height: 6px;
        left: 3px;
        opacity: 0;
        position: absolute;
        top: 3px;
        transform: rotate(-45deg);
        width: 8px;
    }

    & input[type='checkbox'] {
        visibility: hidden;
    }

    & input[type='checkbox']:checked + label {
        background-color: #0075ff;
        border-color: #0075ff;
    }

    & input[type='checkbox']:checked + label:after {
        opacity: 1;
    }
`

function Checkbox({
    set,
    name,
    className = '',
    ...rest
}: CheckboxProps & React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
    return (
        <CheckboxSC>
            <input
                type="checkbox"
                onChange={(event) => set(event.target.checked)}
                className={className}
                {...rest}
                id={name}
            />
            <label htmlFor={name}></label>
        </CheckboxSC>
    )
}

export default Checkbox

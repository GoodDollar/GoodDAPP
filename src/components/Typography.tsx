import { classNames } from 'functions'
import React, { FunctionComponent } from 'react'

export type TypographyWeight = 400 | 700

export type TypographyVariant = 'hero' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'caption' | 'caption2'

const VARIANTS = {
    hero: 'hero',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    body: 'body',
    caption: 'caption',
    caption2: ''
}

export interface TypographyProps {
    variant?: TypographyVariant
    weight?: TypographyWeight
    component?: keyof React.ReactHTML
    className?: string
    children?: React.ReactNode
}

function Typography({
    variant = 'body',
    weight = 400,
    component = 'div',
    className = '',
    children = []
}: TypographyProps): JSX.Element {
    return React.createElement(component, { className: classNames(VARIANTS[variant], className) }, children)
}

export default Typography

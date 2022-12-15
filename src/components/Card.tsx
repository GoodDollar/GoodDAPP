import React from 'react'

export default function Card({
    header = undefined,
    footer = undefined,
    backgroundImage = '',
    title = '',
    description = '',
    children,
    className,
}: any) {
    return (
        <div
            className={`relative ${className}`}
            style={{
                borderRadius: '10px',
                backgroundImage: `url(${backgroundImage})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'center bottom',
            }}
        >
            <div>
                {header && <>{header}</>}

                <div className="px-2 py-4 sm:p-8">
                    {title && <div className="mb-4 ">{title}</div>}
                    {description && <div className="">{description}</div>}
                    {children}
                </div>

                {footer && <>{footer}</>}
            </div>
        </div>
    )
}

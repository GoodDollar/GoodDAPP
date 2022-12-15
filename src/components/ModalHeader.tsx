import React from 'react'
import Title from './gd/Title'

function ModalHeader({
    title = undefined,
    onClose,
    className = '',
}: {
    title?: string
    className?: string
    onClose: () => void
}): JSX.Element {
    return (
        <div className={`relative mb-2 ${className}`}>
            {title && <Title className="text-center">{title}</Title>}
            <div
                className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 rounded-full cursor-pointer"
                onClick={onClose}
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M5.62728 7.92357L2.30765 11.2432L0.488422 9.42397L3.80805 6.10434L0.319628 2.61592L2.21388 0.721668L5.7023 4.21009L9.02193 0.890463L10.8412 2.70969L7.52153 6.02932L11.01 9.51774L9.1157 11.412L5.62728 7.92357Z"
                        fill="#696D73"
                    />
                </svg>
            </div>
        </div>
    )
}

export default ModalHeader

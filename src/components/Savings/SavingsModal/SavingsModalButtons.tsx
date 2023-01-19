import { ModalType } from '.'
import React, { FC, useCallback } from 'react'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import { ActionOrSwitchButton, ActionOrSwitchButtonProps } from 'components/gd/Button/ActionOrSwitchButton'
import { SupportedV2Network, SupportedV2Networks } from '@gooddollar/web3sdk-v2'

type ButtonType = {
    id: ModalType
    title: string
}

export type SavingButtonTypes = ButtonType[]

interface SavingsButtonProps {
    types: SavingButtonTypes
    chain: number
    toggleModal: any
    styles: any
}

export interface ModalButtonProps extends Omit<ActionOrSwitchButtonProps, 'requireChain'> {
    chain: number
    type: ModalType
    title: string
    toggleModal: (type?: ModalType) => void
}
export const ModalButton: FC<ModalButtonProps> = ({ chain, type, title, toggleModal, ...props }) => {
    const sendData = useSendAnalyticsData()
    const network = SupportedV2Networks[chain]
    const onClick = useCallback(() => {
        sendData({ event: 'savings', action: 'savings_' + type + '_confirm', network })
        toggleModal(type)
    }, [toggleModal, type, sendData])

    const requireChain = SupportedV2Networks[chain] as SupportedV2Network

    return (
        // todo: update to web3action from good-design
        <ActionOrSwitchButton
            width="130px"
            size="sm"
            borderRadius="6px"
            requireChain={requireChain}
            noShadow={true}
            onClick={onClick}
            {...props}
        >
            {' '}
            {title}{' '}
        </ActionOrSwitchButton>
    )
}

export const SavingsButtons = ({ types, chain, toggleModal, styles }: SavingsButtonProps) => (
    <div className={styles}>
        {types.map(({ id, title }) => (
            <>
                <ModalButton type={id} title={title} chain={chain} toggleModal={toggleModal} />
                <div className={'mb-1 mr-1'}></div>
            </>
        ))}
    </div>
)

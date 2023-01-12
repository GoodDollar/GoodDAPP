import React, { FC, useCallback } from 'react'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import { ModalType } from '.'
import { ActionOrSwitchButton, ActionOrSwitchButtonProps } from 'components/gd/Button/ActionOrSwitchButton'
import { SupportedV2Network, SupportedV2Networks } from '@gooddollar/web3sdk-v2'

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

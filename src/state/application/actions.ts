import { createAction } from '@reduxjs/toolkit'
import { ApplicationState, ApplicationModal, PopupContent } from './types'
export { ApplicationModal } from './types'
export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>(
    'application/addPopup'
)
export const removePopup = createAction<{ key: string }>('application/removePopup')
export const setKashiApprovalPending = createAction<string>('application/setKashiApprovalPending')
export const setTheme = createAction<ApplicationState['theme']>('application/setTheme')

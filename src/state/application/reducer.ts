import { createReducer, nanoid } from '@reduxjs/toolkit'
import { addPopup, removePopup, setKashiApprovalPending, setOpenModal, setTheme, updateBlockNumber } from './actions'
import { ApplicationState } from './types'
import { AsyncStorage } from '@gooddollar/web3sdk-v2'

const initialState: ApplicationState = {
    blockNumber: {},
    popupList: [],
    openModal: null,
    kashiApprovalPending: '',
    theme: 'light' as 'light' | 'dark'
}

// TODO: remove store, replace via React.Context
export default createReducer(initialState, builder =>
    builder
        .addCase(updateBlockNumber, (state, action) => {
            const { chainId, blockNumber } = action.payload
            if (typeof state.blockNumber[chainId] !== 'number') {
                state.blockNumber[chainId] = blockNumber
            } else {
                state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
            }
        })
        .addCase(setOpenModal, (state, action) => {
            state.openModal = action.payload
        })
        .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
            state.popupList = (key ? state.popupList.filter(popup => popup.key !== key) : state.popupList).concat([
                {
                    key: key || nanoid(),
                    show: true,
                    content,
                    removeAfterMs
                }
            ])
        })
        .addCase(removePopup, (state, { payload: { key } }) => {
            state.popupList.forEach(p => {
                if (p.key === key) {
                    p.show = false
                }
            })
        })
        .addCase(setKashiApprovalPending, (state, action) => {
            state.kashiApprovalPending = action.payload
        })
        .addCase(setTheme, (state, action) => {
            AsyncStorage.safeSet('application.theme', action.payload)
            state.theme = action.payload
        })
)

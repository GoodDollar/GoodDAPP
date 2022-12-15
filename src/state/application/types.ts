import { TokenList } from '@uniswap/token-lists'

export type PopupContent =
    | {
          txn: {
              hash: string
              success: boolean
              summary?: string
          }
      }
    | {
          listUpdate: {
              listUrl: string
              oldList: TokenList
              newList: TokenList
              auto: boolean
          }
      }

export enum ApplicationModal {
    WALLET,
    SETTINGS,
    SELF_CLAIM,
    ADDRESS_CLAIM,
    CLAIM_POPUP,
    MENU,
    DELEGATE,
    VOTE,
    LANGUAGE,
    NETWORK,
    FAUCET,
}

export type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
    readonly blockNumber: { readonly [chainId: number]: number }
    readonly popupList: PopupList
    readonly openModal: ApplicationModal | null
    kashiApprovalPending: string
    theme: 'light' | 'dark'
}

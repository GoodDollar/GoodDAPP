import { SavingsSDK } from '@gooddollar/web3sdk-v2'

export type SavingsBalance = {
    account: string
    provider: any
    defaultEnv: string
}

export const hasSavingsBalance = ({ account, provider, defaultEnv }: SavingsBalance): Promise<boolean | undefined> => {
    const sdk = new SavingsSDK(provider, defaultEnv)

    return sdk.hasBalance(account).catch(() => false)
}

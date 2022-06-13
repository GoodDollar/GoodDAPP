export interface TransactionDetails {
    blockHash: string
    blockNumber: number
    contractAddress: string | null
    cumulativeGasUsed: number
    from: string
    gasUsed: number
    logsBloom: string
    status: boolean
    to: string
    transactionHash: string
    transactionIndex: number
    events: any[]
}

import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import Uniswap from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { Router, Trade } from '@uniswap/v2-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { DEFAULT_DEADLINE_FROM_NOW } from '../../constants'
import { isZero } from '../../functions'
import { getAccount, getChainId } from '../utils/web3'
import { SupportedChainId } from '../constants/chains'
import { ERC20Contract } from './ERC20Contract'
import { G$ } from '../constants/tokens'

export async function swapCallArguments(
    web3: Web3,
    trade: Trade<Currency, Currency, TradeType>, // trade to execute, required
    allowedSlippage: Percent,
    deadline: number = DEFAULT_DEADLINE_FROM_NOW // in seconds from now
): Promise<any> {
    const account = await getAccount(web3)

    return Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage,
        recipient: account,
        ttl: deadline
    })
}

export async function approveBuy(web3: Web3, trade: Trade<Currency, Currency, TradeType>) {
    console.log(trade.route.path)
    if (trade.route.path[0].isNative) {
        return
    }

    const account = await getAccount(web3)

    const contract = ERC20Contract(web3, trade.route.path[0].address)

    await contract.methods
        .approve(
            '0xFB76e9E7d88E308aB530330eD90e84a952570319',
            trade.inputAmount.multiply(trade.inputAmount.decimalScale).toFixed(0)
        )
        .send({ from: account })
}

export async function approveSell(web3: Web3, trade: Trade<Currency, Currency, TradeType>) {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const contract = ERC20Contract(web3, G$[chainId].address)

    await contract.methods
        .approve(
            '0xFB76e9E7d88E308aB530330eD90e84a952570319',
            trade.inputAmount.multiply(trade.inputAmount.decimalScale).toFixed(0)
        )
        .send({ from: account })
}

export async function swap(
    web3: Web3,
    trade: Trade<Currency, Currency, TradeType>, // trade to execute, required
    allowedSlippage: Percent, // in bips
    deadline: number = DEFAULT_DEADLINE_FROM_NOW // in seconds from now
): Promise<any> {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const contract = fuseUniswapContract(web3)
    const parameters = await swapCallArguments(web3, trade, allowedSlippage, deadline)

    const { methodName, args, value } = parameters

    return contract.methods[methodName](...args).send({
        ...(chainId === SupportedChainId.FUSE && { gasPrice: 1_000_000_000 }),
        ...(value && !isZero(value) ? { value, from: account } : { from: account })
    })
}

/**
 * Returns instance of compound contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export function fuseUniswapContract(web3: Web3, address?: string) {
    address = address ?? '0xFB76e9E7d88E308aB530330eD90e84a952570319'

    return new web3.eth.Contract(Uniswap.abi as AbiItem[], address)
}

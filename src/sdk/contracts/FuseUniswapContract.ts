import Web3 from 'web3'
import { BigNumber } from 'ethers'
import { AbiItem } from 'web3-utils'
import Uniswap from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { Router, Trade } from '@uniswap/v2-sdk'
import { MaxUint256 } from '@ethersproject/constants'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { DEFAULT_DEADLINE_FROM_NOW } from '../../constants'
import { isZero } from '../../functions'
import { getAccount, getChainId } from '../utils/web3'
import { SupportedChainId } from '../constants/chains'
import { ERC20Contract } from './ERC20Contract'
import { G$ } from '../constants/tokens'
import { UNISWAP_CONTRACT_ADDRESS } from '../constants/addresses'

/**
 * Builds swap call arguments for the contract
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 * @param {Percent} allowedSlippage Slippage in percent.
 * @param {number} [deadline=DEFAULT_DEADLINE_FROM_NOW] Deadline in seconds.
 */
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

/**
 * Approve token spend for buy.
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 */
export async function approveBuy(web3: Web3, trade: Trade<Currency, Currency, TradeType>): Promise<void> {
    if (trade.route.path[0].isNative) {
        return
    }

    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const contract = ERC20Contract(web3, trade.route.path[0].address)

    const contractDeploymentAddress = UNISWAP_CONTRACT_ADDRESS[chainId]
    const input = BigNumber.from(trade.inputAmount.multiply(trade.inputAmount.decimalScale).toFixed(0))

    const allowance = await contract.methods
        .allowance(account, contractDeploymentAddress)
        .call()
        .then((_: string) => BigNumber.from(_))

    if (input.lte(allowance)) return

    await contract.methods.approve(contractDeploymentAddress, MaxUint256.toString()).send({ from: account })
}

/**
 * Approve token spend for sell.
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 */
export async function approveSell(web3: Web3, trade: Trade<Currency, Currency, TradeType>) {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const contract = ERC20Contract(web3, G$[chainId].address)

    const contractDeploymentAddress = UNISWAP_CONTRACT_ADDRESS[chainId]

    const input = BigNumber.from(trade.inputAmount.multiply(trade.inputAmount.decimalScale).toFixed(0))

    const allowance = await contract.methods
        .allowance(account, contractDeploymentAddress)
        .call()
        .then((_: string) => BigNumber.from(_))

    if (input.lte(allowance)) return

    await contract.methods.approve(contractDeploymentAddress, MaxUint256.toString()).send({ from: account })
}

/**
 *
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 * @param {Percent} allowedSlippage Slippage in percent.
 * @param {Function} onSent On sent event.
 * @param {number} [deadline=DEFAULT_DEADLINE_FROM_NOW] Deadline in seconds.
 */
export async function swap(
    web3: Web3,
    trade: Trade<Currency, Currency, TradeType>, // trade to execute, required
    allowedSlippage: Percent, // in bips
    onSent?: (transactionHash: string, from: string) => void,
    deadline: number = DEFAULT_DEADLINE_FROM_NOW // in seconds from now
): Promise<any> {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const contract = await fuseUniswapContract(web3)
    const parameters = await swapCallArguments(web3, trade, allowedSlippage, deadline)

    const { methodName, args, value } = parameters

    const req = contract.methods[methodName](...args).send({
        ...(chainId === SupportedChainId.FUSE && { gasPrice: 1_000_000_000 }),
        ...(value && !isZero(value) ? { value, from: account } : { from: account })
    })

    if (onSent) req.on('transactionHash', (hash: string) => onSent(hash, account))

    return req
}

/**
 * Returns instance of uniswap on fuse contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export async function fuseUniswapContract(web3: Web3, address?: string) {
    const chainId = await getChainId(web3)
    address = address ?? UNISWAP_CONTRACT_ADDRESS[chainId]

    return new web3.eth.Contract(Uniswap.abi as AbiItem[], address)
}

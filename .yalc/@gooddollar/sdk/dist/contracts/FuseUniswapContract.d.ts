import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Trade } from '@uniswap/v2-sdk';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
/**
 * Builds swap call arguments for the contract
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 * @param {Percent} allowedSlippage Slippage in percent.
 * @param {number} [deadline=DEFAULT_DEADLINE_FROM_NOW] Deadline in seconds.
 */
export declare function swapCallArguments(web3: Web3, trade: Trade<Currency, Currency, TradeType>, // trade to execute, required
allowedSlippage: Percent, deadline?: number): Promise<any>;
/**
 * Approve token spend for buy.
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 */
export declare function approveBuy(web3: Web3, trade: Trade<Currency, Currency, TradeType>): Promise<void>;
/**
 * Approve token spend for sell.
 * @param {Web3} web3 Web3 instance.
 * @param {Trade<Currency, Currency, TradeType>} trade Calculated trade.
 */
export declare function approveSell(web3: Web3, trade: Trade<Currency, Currency, TradeType>): Promise<void>;
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
export declare function swap(web3: Web3, trade: Trade<Currency, Currency, TradeType>, // trade to execute, required
allowedSlippage: Percent, // in bips
onSent?: (transactionHash: string, from: string) => void, deadline?: number): Promise<any>;
/**
 * Returns instance of uniswap on fuse contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export declare function fuseUniswapContract(web3: Web3, address?: string): Promise<Contract>;
//# sourceMappingURL=FuseUniswapContract.d.ts.map
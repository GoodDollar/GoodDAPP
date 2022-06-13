import Web3 from 'web3';
import { Currency, CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core';
import { LIQUIDITY_PROTOCOL } from 'constants/protocols';
import { TransactionDetails } from 'constants/transactions';
import { DAO_NETWORK } from 'constants/chains';
export declare type Stake = {
    APY?: Fraction;
    address: string;
    protocol: LIQUIDITY_PROTOCOL;
    liquidity: Fraction;
    rewards: {
        G$: CurrencyAmount<Currency>;
        GDAO: CurrencyAmount<Currency>;
    };
    socialAPY: Fraction;
    tokens: {
        A: Token;
        B: Token;
    };
    isV2?: boolean;
};
declare type MyReward = {
    claimed: CurrencyAmount<Currency>;
    unclaimed: CurrencyAmount<Currency>;
};
export declare type MyStake = {
    address: string;
    protocol: LIQUIDITY_PROTOCOL;
    multiplier: boolean;
    rewards: {
        reward: MyReward;
        reward$: MyReward;
        GDAO: MyReward;
    };
    stake: {
        amount: CurrencyAmount<Currency>;
        amount$: CurrencyAmount<Currency>;
    };
    tokens: {
        A: Token;
        B: Token;
    };
    network: DAO_NETWORK;
    isDeprecated?: boolean;
    isV2?: boolean;
};
/**
 * Return list of all stakes.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<Stake[]>}
 */
export declare function getList(web3: Web3): Promise<Stake[]>;
/**
 * Return list of all user's stakes.
 * @param {Web3} web3 Web3 instance.
 * @param {string} account account address to get staking data for.
 * @returns {Promise<Stake[]>}
 */
export declare function getMyList(mainnetWeb3: Web3, fuseWeb3: Web3, account: string): Promise<MyStake[]>;
/**
 * Return price of token in $ (USDC token).
 * @param {Web3} web3 Web3 instance.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @returns {Promise<Fraction>>}
 */
export declare const getTokenPriceInUSDC: ((web3: Web3, protocol: LIQUIDITY_PROTOCOL, token: Token) => Promise<Fraction | null>) & import("lodash").MemoizedFunction;
export declare const getReserveSocialAPY: ((web3: Web3, chainId: number) => Promise<Fraction>) & import("lodash").MemoizedFunction;
/**
 * Returns reserve ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Promise<Fraction>>}
 */
export declare const getReserveRatio: ((web3: Web3, chainId: number) => Promise<Fraction>) & import("lodash").MemoizedFunction;
/**
 * Approve token spend for stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export declare function approve(web3: Web3, spender: string, amount: string, token: Token, onSent?: (transactionHash: string) => void): Promise<void>;
/**
 * Make a stake in the governance staking contract
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export declare function stakeGov(web3: Web3, address: string, amount: string, token: Token, inInterestToken?: boolean, //unused - only for compatability with the stake method
onSent?: (transactionHash: string, from: string) => void): Promise<TransactionDetails>;
/**
 * Make a stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export declare function stake(web3: Web3, address: string, amount: string, token: Token, inInterestToken?: boolean, onSent?: (transactionHash: string, from: string) => void): Promise<TransactionDetails>;
/**
 * Withdraw a stake.
 * @param {Web3} web3 Web3 instance.
 * @param {MyStake} stake Stake address.
 * @param {string} percentage How much to withdraw in percentages.
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export declare function withdraw(web3: Web3, stake: MyStake, percentage: string, withdrawIntoInterestToken?: boolean, onSent?: (transactionHash: string, from: string) => void, onReceipt?: () => void, onError?: (e: any) => void): Promise<TransactionDetails>;
/**
 * Claim GOOD rewards from staking.
 * @param {Web3} web3 Web3 instance.
 * @param {function} [onSent] calls when transactions sent to a blockchain
 */
export declare function claimGood(web3: Web3, onSent?: (firstTransactionHash: string, from: string, chainId: number) => void, onReceipt?: () => void, onError?: (e: any) => void): Promise<TransactionDetails[]>;
/**
 * Claim G$ rewards from staking.
 * @param {Web3} web3 Web3 instance.
 * @param {function} [onSent] calls when transactions sent to a blockchain
 */
export declare function claim(web3: Web3, onSent?: (firstTransactionHash: string, from: string, chainId: number) => void, onReceipt?: () => void): Promise<TransactionDetails[]>;
export {};
//# sourceMappingURL=staking.d.ts.map
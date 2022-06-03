import Web3 from 'web3';
import { Currency, CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core';
import { LIQUIDITY_PROTOCOL } from 'constants/protocols';
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
export {};
//# sourceMappingURL=staking.d.ts.map
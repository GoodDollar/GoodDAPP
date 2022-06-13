import { BaseProvider } from '@ethersproject/providers';
import { SupportedChainId } from './chains';
import Web3 from 'web3';
/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export declare function getProvider(chainId: SupportedChainId, web3?: Web3): BaseProvider;
//# sourceMappingURL=provider.d.ts.map
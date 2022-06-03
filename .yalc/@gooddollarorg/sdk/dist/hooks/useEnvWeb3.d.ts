import Web3 from 'web3';
import { SupportedChainId, DAO_NETWORK } from 'constants/chains';
export interface RPC {
    MAINNET_RPC: string | undefined;
    ROPSTEN_RPC: string | undefined;
    KOVAN_RPC: string | undefined;
    FUSE_RPC: string | undefined;
}
export declare const defaultRPC: {
    1: any;
    3: any;
    42: any;
    122: string;
};
export declare const getRpc: (chainId: number) => string;
/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export declare const useEnvWeb3: (dao: DAO_NETWORK, activeWeb3?: any | undefined, activeChainId?: number) => [Web3 | null, SupportedChainId];
//# sourceMappingURL=useEnvWeb3.d.ts.map
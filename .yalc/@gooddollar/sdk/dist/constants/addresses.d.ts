import { ObjectLike } from '@gooddollar/goodprotocol/releases/deployment.json';
import { SupportedChainId } from './chains';
export declare const getNetworkEnv: (network?: string) => string;
declare type AddressMap = {
    [chainId: number]: string;
};
/**
 * Fetch contract address from @gooddollar/goodprotocol npm package.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} name Contract name.
 * @see node_modules/@gooddollar/goodprotocol/releases/deployment.json
 */
export declare function G$ContractAddresses<T = ObjectLike>(chainId: SupportedChainId, name: string): T;
export declare const UNI_ADDRESS: AddressMap;
export declare const UNISWAP_FACTORY_ADDRESSES: AddressMap;
export declare const UNISWAP_INIT_CODE_HASH: AddressMap;
export declare const UNISWAP_CONTRACT_ADDRESS: AddressMap;
export {};
//# sourceMappingURL=addresses.d.ts.map
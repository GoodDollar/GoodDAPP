import { ethers } from "ethers";
import { BaseProvider } from "@ethersproject/providers/src.ts/base-provider";
import { JsonRpcProvider } from "@ethersproject/providers/src.ts/json-rpc-provider";

import { NETWORK_LABELS, SupportedChainId } from "./chains";

/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export function getProvider(chainId: SupportedChainId): BaseProvider | JsonRpcProvider {
  if (chainId === SupportedChainId.FUSE) {
    return new ethers.providers.JsonRpcProvider("https://rpc.fuse.io/")
  }

  return ethers.getDefaultProvider(NETWORK_LABELS[chainId])
}

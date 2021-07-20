import Web3 from "web3";

import { ubiSchemeContract } from "./contracts/UBISchemeContract";
import { getAccount, getChainId } from "./utils/web3";
import { debug } from "./utils/debug";
import { NETWORK_LABELS, SupportedChainId } from "./constants/chains";
import { InvalidChainId } from "./utils/errors";

/**
 * Check UBI token availability.
 * @param {Web3} web3 Web3 instance.
 * @returns {string} Amount of UBI tokens.
 */
export async function check(web3: Web3): Promise<string> {
  await validateChaiId(web3)

  const contract = await ubiSchemeContract(web3)

  const result = await contract.methods.checkEntitlement().call()
  debug('UBI', result.toString())

  return result.toString()
}

/**
 * Claim UBI token.
 * @param {Web3} web3 Web3 instance.
 */
export async function claim(web3: Web3): Promise<void> {
  await validateChaiId(web3)

  const contract = await ubiSchemeContract(web3)
  const account = await getAccount(web3)

  return contract.methods.claim().send({ from: account })
}

/**
 * Validate that selected network is FUSE.
 * @param {Web3} web3 Web3 instance.
 */
async function validateChaiId(web3: Web3): Promise<void> {
  const chainId = await getChainId(web3)

  if (chainId !== SupportedChainId.FUSE) {
    throw new InvalidChainId(NETWORK_LABELS[SupportedChainId.FUSE])
  }
}

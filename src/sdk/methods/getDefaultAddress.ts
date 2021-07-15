import { Token } from "@uniswap/sdk-core";

type AddressMap = { [chainId: string]: Token | string }
type StringOrNumber = number | string
type PromiseStringOrNumber = Promise<StringOrNumber>

/**
 * Returns default address for chain ID from given map.
 * @param {AddressMap} map Addresses map.
 * @param {StringOrNumber | PromiseStringOrNumber} chainId Chain ID.
 * @return {Promise<string>} Address for given chain ID.
 * @throws {Error} When chainId not in map.
 */
export async function getDefaultAddress(map: AddressMap, chainId: StringOrNumber | PromiseStringOrNumber): Promise<string> {
  let id: string
  if (chainId instanceof Promise) {
    id = (await chainId).toString()
  } else {
    id = chainId.toString()
  }

  const data = map[id]

  if (!data) {
    throw new Error('Unsupported chain ID')
  }

  if (data instanceof Token) {
    return data.address
  }

  return data
}
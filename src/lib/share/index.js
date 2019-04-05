// @flow
import { decode, encode, isMNID } from 'mnid'

export function generateCode(address: string, networkId: number, amount: number) {
  const mnid = encode({ address, network: `0x${networkId.toString(16)}` })

  return amount > 0 ? `${mnid}|${amount}` : mnid
}

export function readCode(code: string) {
  const [mnid, value] = code.split('|')

  if (!isMNID(mnid)) {
    return null
  }

  const { network, address } = decode(mnid)
  const amount = value && parseInt(value)

  return {
    networkId: parseInt(network),
    address,
    amount: amount ? amount : undefined
  }
}

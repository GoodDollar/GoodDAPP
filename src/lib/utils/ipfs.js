import { isString, trimStart } from 'lodash'
export { NFTStorage, Blob, File } from 'nft.storage/src/lib'

const cidRe = /^[\w\d]+$/i

// checks is string a valid CID. it should be at least 40 chars length and contrain only letters & numbers
export const isValidCID = source => isString(source) && source.length >= 40 && cidRe.test(source)

// returns ipfs or of the CID's metadata.json
export const metadataUrl = cid => `ipfs://${cid}/metadata.json`

// parses ipfs url (e.g. ipfs://<cid>/<path>) onto cid + path
// this is need because different gateways have different routing
// ipfs.io appends full path to the end e.g. https://ipfs.io/ipfs/<cid>/<path
// but dweb.link prepends cid in the domain name and appends a path only
// e.g. https://<cid>.ipfs.dweb.link/<path>
export const parseIpfsUrl = ipfsUrl => {
  // get full path and trim starting // if any
  const { pathname } = new URL(ipfsUrl)
  const trimmedPath = trimStart(pathname, '/')

  // find the position of the slash splitting cid and path
  const slashPos = trimmedPath.indexOf('/')

  // cut cid before and path after it
  const cid = trimmedPath.substring(0, slashPos)
  const path = trimmedPath.substring(slashPos + 1)

  // return object parsed
  return { cid, path }
}

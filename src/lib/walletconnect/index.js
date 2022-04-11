import { isValidURI } from '../utils/uri'

/**
 * Parses the read WalletConnet URI from QR Code.
 * If not valid, returns null.
 * If valid, returns the WalletConnet URI.
 * @param {string} link - receive WalletConnect URI
 * @returns {string|null} - {link|null}
 */
function readWalletConnectUri(link) {
  // checks that the link has the expected strings in it
  const isValidWalletConnectUri = link.match(/wc:.*/g)

  if (!isValidURI(link) || !isValidWalletConnectUri) {
    return null
  }

  return link
}

export default { readWalletConnectUri }

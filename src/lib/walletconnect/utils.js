/**
 * Parses the read WalletConnet URI from QR Code.
 * If not valid, returns null.
 * If valid, returns the WalletConnet URI.
 * @param {string} link - receive WalletConnect URI
 * @returns {string|null} - {link|null}
 */
export const readWalletConnectUri = link => {
  // checks that the link has the expected strings in it
  const eip1328UriFormat = /wc:[\w\d-]+@\d+\?bridge=.*&key=[a-z0-9]+/
  const validUri = link.match(eip1328UriFormat)[0]

  if (!validUri) {
    return null
  }

  return link
}

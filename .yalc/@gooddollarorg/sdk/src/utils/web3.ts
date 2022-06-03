import Web3 from 'web3'
/**
 * Returns current chain ID based on web3 instance.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<number>}
 */
export async function getChainId(web3: Web3): Promise<number> {
    return web3.eth.getChainId()
}

/**
 * Returns current account ID based on web3 instance.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<number>}
 */
export async function getAccount(web3: Web3): Promise<string> {
    const [account] = await web3.eth.getAccounts()

    return account
}

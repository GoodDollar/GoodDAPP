import Web3 from 'web3';
/**
 * Check wallet whitelisted.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<boolean>}
 */
export declare function isWhitelisted(web3: Web3, account: string): Promise<boolean>;
/**
 * Check UBI token availability.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<string>} Amount of UBI tokens.
 */
export declare function check(web3: Web3): Promise<string>;
/**
 * Claim UBI token.
 * @param {Web3} web3 Web3 instance.
 */
export declare function claim(web3: Web3, account: string): Promise<void>;
//# sourceMappingURL=ubi.d.ts.map
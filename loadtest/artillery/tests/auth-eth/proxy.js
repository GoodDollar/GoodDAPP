import '../../../mock-browser'
import bip39 from 'bip39-light'
import Config from "../../../../src/config/config";
import {GoodWallet} from "../../../../src/lib/wallet/GoodWalletClass";
import {UserStorage} from "../../../../src/lib/gundb/UserStorageClass";
import {GoodWalletLogin} from "../../../../src/lib/login/GoodWalletLogin";

/**
 * Main method
 * @returns {Promise<boolean>}
 */
const runProxy = async () => {
  try {
   // await createCreds()
  } catch (e) {
    console.log(e);
  }
  
  return true
}

/**
 * Generate random data (but it not work)
 * @returns {Promise<Credentials|Error>}
 */
const createCreds = async () => {
  try {
    const gun = global.Gun({ file: './loadtest/loadtestAuthEth.json', peers: [`${Config.serverUrl}/gun`] })
    let mnemonic = bip39.generateMnemonic()
    let wallet = new GoodWallet({ mnemonic })
    await wallet.ready
    let storage = new UserStorage(wallet, gun)
    await storage.ready
    let login = new GoodWalletLogin(wallet, storage)
    return await login.auth()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  runProxy
}

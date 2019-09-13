import Gun from 'gun'
import bip39 from 'bip39-light'
import {GoodWallet} from "../../../../src/lib/wallet/GoodWalletClass";
import {UserStorage} from "../../../../src/lib/gundb/UserStorageClass";
import {GoodWalletLogin} from "../../../../src/lib/login/GoodWalletLogin";
import {log} from '../../utils/commons'

const fs = require("fs");
const rimraf = require("rimraf");
/**
 * Main method
 * @returns {Promise<boolean>}
 */
const runProxy = async () => {
  try {
    await generatedData()
  } catch (e) {
    console.log(e);
  }
  
  return true
}

const generatedData = async () => {
  const count = process.env.DURATION * process.env.ARRIVALRATE
  log('Run generated random data: ' + count)
  let creds = []
  
  if (fs.existsSync(`${__dirname}/temp`)) {
    rimraf.sync(`${__dirname}/temp`);
  }
  fs.mkdirSync(`${__dirname}/temp`);
  
  for (let i = 0; i < count; i++) {
    creds.push(await createSignature(i))
  }
  
  
  if (creds) {
    fs.writeFileSync(`${__dirname}/random.data`, JSON.stringify(creds))
  }
  
  return true
}

/**
 * Generate random data (but it not work)
 * @returns {Promise<Credentials|Error>}
 */
const createSignature = async (i) => {
  try {
    const gun = Gun({
      file: `${__dirname}/temp/${i}.json`,
    })
    let mnemonic = bip39.generateMnemonic()
    const wallet = new GoodWallet({mnemonic})
    await wallet.ready
    const storage = new UserStorage(wallet, gun)
    let login = new GoodWalletLogin(wallet, storage)
    await storage.ready
    const creds = await login.login()
    return creds
    
  } catch (e) {
    console.log(e)
  }
  
}

module.exports = {
  runProxy
}

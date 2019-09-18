import './mock-browser'
import bip39 from 'bip39-light'
import faker from 'faker'
import Gun from 'gun'
import { GoodWallet } from '../src/lib/wallet/GoodWalletClass'
import { GoodWalletLogin } from '../src/lib/login/GoodWalletLogin'
import { UserStorage } from '../src/lib/gundb/UserStorageClass'
import delay from 'delay'
import API from '../src/lib/API/api'
import Config from "../src/config/config"
let failedTests = {}

const addUser = async (i) => {
  let result = {
    addPablicDataTime: 0,
    addPrivateDataTime: 0,
  }

  try {
    let mnemonic = bip39.generateMnemonic()
    let wallet = new GoodWallet({ mnemonic })
    await wallet.ready
    await API.ready
    const storage = new UserStorage(wallet,  Gun())
    await storage.ready
    const randomName = faker.name.findName() // Rowan Nikolaus
    const randomEmail = faker.internet.email() // Kassandra.Haley@erich.biz
    const randomCard = faker.phone.phoneNumber('+38097#######')
    let login = new GoodWalletLogin(wallet, storage)
    let creds = await login.auth()
    
    let publicUserData = {
      fullName: randomName,
      walletAddress: wallet.account,
    }
    
    let privateUserData = {
      email: randomEmail,
      mobile: randomCard,
      
    }
    const startTimeForSave = new Date().getTime()
    await storage.setProfile(publicUserData)
    const endTimeForSave = new Date().getTime()
    result.addPablicDataTime = endTimeForSave - startTimeForSave
  
    const startTimeForGet = new Date().getTime()
    await storage.setProfile(privateUserData)
    const endTimeForGet = new Date().getTime()
    result.addPrivateDataTime = endTimeForGet - startTimeForGet
    
    
  } catch (error) {
    console.info(`Test failed`, error)
    failedTests[error.message] === undefined ? (failedTests[error.message] = 1) : (failedTests[error.message] += 1)
    return result
  } finally {
    // fs.unlinkSync('./loadtest/loadtest' + i + '.json')
  }
  
  return result
}

const run = async numTests => {
  let res = []
  let addPablicDataTime = 0
  let addPrivateDataTime = 0
  await delay(3000)
  for (let i = 0; i < numTests; i++) {
    let runT = await addUser(i)
    res.push(runT)
    addPablicDataTime += run.addPablicDataTime
    addPrivateDataTime += run.addPrivateDataTime
  }
  
  console.info(res)
  console.info(`Average addition time (Public):${addPablicDataTime/numTests}` )
  console.info(`Average addition time (Private):${addPrivateDataTime/numTests}`)
  console.info('Done. Quiting')
  process.exit(-1)
}

let numTests = process.argv[2]
console.info('arrgs', process.argv, numTests)
run(numTests)

import '../mock-browser'
import fs from 'fs'
import childProcess from 'child_process'
import {log} from './utils/commons'

class artilleryTest {
  errorMessage = []
  
  constructor(testName) {
    this.testName = testName.trim()
    this.pathToFolder = `${__dirname}/tests/${this.testName}`
    this.pathToProxy = `${__dirname}/tests/${this.testName}/proxy.js`
    this.pathToTest = `${__dirname}/tests/${this.testName}/test.yml`
    this.testResult = ''
  }
  
  /**
   * init abd run test
   *
   * @returns {Promise<void>}
   */
  init = async () => {
    this.isTestExists();
    if (this.errorMessage.length > 0) {
      console.log('Errors', this.errorMessage)
    } else {
      await this.runProxy()
      await this.runTest()
      log(this.testResult)
    }
  }
  
  /**
   * Before run test, run proxy
   *
   * @returns {Promise<boolean>}
   */
  runProxy = async () => {
    log('Run proxy test')
    try {
      const {runProxy} = require(this.pathToProxy);
      await runProxy()
    } catch (e) {
      console.log(e);
    }
    
    return true
  }
  
  /**
   * Run test
   *
   * @returns {Promise<void>}
   */
  runTest = async () => {
    log('Run test')
    this.testResult = childProcess.execSync(`${__dirname}/../../node_modules/.bin/artillery run ${ this.pathToTest}`).toString();
  }
  
  /**
   * Checking test files
   */
  isTestExists = () => {
    log('Start check file')
    
    if (!fs.existsSync(this.pathToFolder)) {
      this.addError(`Folder not found ${this.pathToFolder}`)
    }
    
    if (!fs.existsSync(this.pathToProxy)) {
      this.addError(`File not found ${this.pathToProxy}`)
    }
    
    if (!fs.existsSync(this.pathToTest)) {
      this.addError(`File not found ${this.pathToTest}`)
    }
    log('End check file')
  }
  
  /**
   * Add error message
   *
   * @param {string} error
   */
  addError = (error) => {
    this.errorMessage.push(error)
  }
  
}


/**
 * Run process
 *
 * @param {string} testName
 *
 * @returns {Promise<void>}
 */
const run = async testName => {
  log('Waiting for tests to finish...')
  try {
    const Test = new artilleryTest(testName)
    await Test.init()
  } catch (e) {
    console.log(e)
  }
  log('Done. Quiting')
  process.exit(-1)
};

let testName = process.argv[2]

testName.trim()
if (testName) {
  run(testName)
} else {
  log('Done. Quiting')
  process.exit(-1)
}

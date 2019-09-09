import fs from 'fs'
import childProcess from 'child_process'

class artilleryTest {
  errorMessage = []

  constructor (testName) {
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
      this.runProxy()
      this.runTest()
      this.log(this.testResult)
    }
  }
  
  /**
   * Before run test, run proxy
   *
   * @returns {Promise<boolean>}
   */
  runProxy = async () => {
    this.log('Run proxy test')
    try {
      const { runProxy } = require(this.pathToProxy);
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
    this.log('Run test')
    this.testResult = childProcess.execSync(`artillery run ${ this.pathToTest}`).toString();
  }

  /**
   * Checking test files
   */
  isTestExists = () => {
    this.log('Start check file')

      if (!fs.existsSync(this.pathToFolder)) {
        this.addError(`Folder not found ${this.pathToFolder}`)
      }

      if (!fs.existsSync(this.pathToProxy)) {
        this.addError(`File not found ${this.pathToProxy}`)
      }

      if (!fs.existsSync(this.pathToTest)) {
        this.addError(`File not found ${this.pathToTest}`)
      }
    this.log('End check file')
  }
  
  /**
   * Add error message
   *
   * @param {string} error
   */
  addError = (error) => {
    this.errorMessage.push(error)
  }

  /**
   * Log
   *
   * @param {string} msg
   */
  log = (msg) => {
    console.info((new Date()) + ' || - ' , msg)
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
  console.info('Waiting for tests to finish...')
  try {
    const Test = new artilleryTest(testName)
    Test.init()
  } catch (e) {
    console.log(e)
  }
  console.info('Done. Quiting')
  process.exit(-1)
};

let testName = process.argv[2]

testName.trim()
if (testName) {
  run(testName)
} else {
  console.log('please enter test name')
}

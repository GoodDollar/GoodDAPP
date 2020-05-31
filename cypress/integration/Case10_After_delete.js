/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
//import HomePage from '../PageObjects/HomePage'
//import GDls from '../fixtures/GDls.json'

describe('Test after delete wallet', () => {
  // before('load localStorage', () => {
  //   Object.keys(GDls).forEach(key => {
  //     localStorage.setItem(key, GDls[key])
  //   })
  // })

  // it('try to login with localStorage value', () => {
  //   StartPage.open()
  //   HomePage.waitForHomePageDisplayed()
  //   HomePage.sendButton.should('not.be.visible')
  //   StartPage.signInButton.should('be.visible')
  // })
  it('try to login with pass phrase', () => {
   cy.readFile('cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
     StartPage.open()
     StartPage.signInButton.click()
     LoginPage.recoverFromPassPhraseLink.click()
     LoginPage.pageHeader.should('contain', 'Recover')
     LoginPage.mnemonicsInput.type(mnemonic)
     LoginPage.recoverWalletButton.click()
     LoginPage.errorWindow.should('be.visible')
   })
 })
})

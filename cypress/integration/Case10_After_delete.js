/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
//import GDls from '../fixtures/GDls.json'

describe('Test case 10: Test after delete wallet', () => {
  it('try to login with pass phrase', () => {
    localStorage.clear()
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

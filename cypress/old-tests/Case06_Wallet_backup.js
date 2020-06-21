/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import RecoverWalletPage from '../PageObjects/RecoverWalletPage'

describe('Test case 6: Ability to send recovering email', () => {
  it('User is able to recover mnemonics by email', () => {
    localStorage.clear()
    StartPage.open()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    cy.readFile('cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()
    })
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(2).click()
    for (let i = 0; i < 12; i++) {
      RecoverWalletPage.mnemonicInputs.eq(i).should('be.visible')
      RecoverWalletPage.mnemonicInputs
        .eq(i)
        .invoke('val')
        .should('not.be.empty')
    }
    RecoverWalletPage.resendEmailButton.click()
    RecoverWalletPage.successMessageTitle.should('be.visible')
    RecoverWalletPage.successMessageText.should('be.visible')
  })
})

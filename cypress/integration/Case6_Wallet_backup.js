/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import RecoverWalletPage from '../PageObjects/RecoverWalletPage'

describe('Test case 6: Ability to send recovering email', () => {
  before('authorization', () => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(Cypress.env('mainAccountMnemonics'))
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
    HomePage.claimButton.should('be.visible')
  })

  it('User is able to recover mnemonics by email', () => {
    HomePage.optionsButton.click()
    HomePage.options.eq(1).click()
    for (let i = 0; i < 12; i++) {
      RecoverWalletPage.mnemonicInputs.eq(i).should('be.visible')
    }
    RecoverWalletPage.resendEmailButton.click()
    RecoverWalletPage.successMessageDiv.should('contain', 'We sent an email with recovery instructions for your wallet')
  })
})

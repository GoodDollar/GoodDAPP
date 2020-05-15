/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import HomePage from '../PageObjects/HomePage'
import LoginPage from '../PageObjects/LoginPage'


describe('Test case 9: Delete temporary user', () => {
  it('User to sign up and delete', () => {
    localStorage.clear()
    cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt').then((text) => {
    //localStorage.setItem('GD_mnemonic', text)
    
    StartPage.open()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(text)
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
    HomePage.waitForHomePageDisplayed()
 })

    HomePage.optionsButton.click()
    HomePage.deleteAccountButton.click()
    HomePage.confirmDeletionButton.click()
    StartPage.createWalletButton.should('be.visible')
  })
})

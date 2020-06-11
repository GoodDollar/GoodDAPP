/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import ReceiveMoneyPage from '../PageObjects/ReceiveMoneyPage'

describe('Test case 8: Ability to send money request and reseive money', () => {
  it('User is able to send money request', () => {
    cy.clearLocalStorage()
    cy.clearCookies()
    StartPage.open()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(Cypress.env('additionalAccountMnemonics'))
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
    HomePage.receiveButton.click()
    ReceiveMoneyPage.pageHeader.should('contain', 'Receive G$')
    ReceiveMoneyPage.qrImage.should('be.visible')
    ReceiveMoneyPage.requestSpecificAmountButton.should('be.visible')
    ReceiveMoneyPage.shareYourWalletLinkButton.should('be.visible')
    ReceiveMoneyPage.requestSpecificAmountButton.click()
    ReceiveMoneyPage.nameInput.should('be.visible')
    ReceiveMoneyPage.nextButton.should('be.visible')
    ReceiveMoneyPage.nameInput.type('Test Account')
    ReceiveMoneyPage.nextButton.click()
    ReceiveMoneyPage.moneyInput.should('be.visible')
    ReceiveMoneyPage.nextButton.should('be.visible')
    ReceiveMoneyPage.moneyInput.type('0.01')
    ReceiveMoneyPage.nextButton.click()
    ReceiveMoneyPage.messageInput.should('be.visible')
    ReceiveMoneyPage.nextButton.should('be.visible')
    ReceiveMoneyPage.messageInput.type('test lalala')
    ReceiveMoneyPage.nextButton.click()
    ReceiveMoneyPage.nextButton.click()
    ReceiveMoneyPage.shareLinkButton.click()
    ReceiveMoneyPage.doneButton.should('be.visible')

    //get link from clipboard
    //cy.task('getClipboard').then(reseiveMoneyUrl => {

    cy.get('[data-gdtype="copy-link"]').invoke('attr', 'data-testid').then(reseiveMoneyUrl => {
      cy.log(reseiveMoneyUrl)
      const moneyLink = reseiveMoneyUrl
      const pattern = /(?:http[s]?:\/\/)[^\s[",><]*/gim
      const validMoneyLnk = moneyLink.match(pattern)
      cy.log(validMoneyLnk)
      ReceiveMoneyPage.doneButton.click()
      HomePage.claimButton.should('be.visible')
      cy.clearLocalStorage()
      cy.clearCookies()
      cy.readFile('cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
       StartPage.open()
       StartPage.signInButton.click()
       LoginPage.recoverFromPassPhraseLink.click()
       LoginPage.pageHeader.should('contain', 'Recover')
       LoginPage.mnemonicsInput.type(mnemonic)
       LoginPage.recoverWalletButton.click()
       LoginPage.yayButton.click()
       HomePage.claimButton.should('be.visible')
       HomePage.moneyAmountDiv.invoke('text').then(moneyBeforeSending => {
        cy.visit(validMoneyLnk.toString())
        ReceiveMoneyPage.confirmWindowButton.should('be.visible')
        ReceiveMoneyPage.confirmWindowButton.click()
        LoginPage.yayButton.click()
        HomePage.claimButton.should('be.visible')
        HomePage.moneyAmountDiv.should('not.contain', moneyBeforeSending, { timeout: 20000 })
        HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBeforeSending) - 0.01).toFixed(0))
        })
      })
    })
  })
})
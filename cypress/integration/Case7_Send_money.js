/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SendMoneyPage from '../PageObjects/SendMoneyPage'

describe('Test case 7: Ability to send money', () => {
  it('User is able to send money', () => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(Cypress.env('mainAccountMnemonics'))
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
    HomePage.sendButton.click()
    SendMoneyPage.nameInput.type('another person')
    SendMoneyPage.nextButton.click()
    SendMoneyPage.moneyInput.type('0.01')
    SendMoneyPage.nextButton.click()
    SendMoneyPage.messageInput.type('test message')
    SendMoneyPage.nextButton.click()
    SendMoneyPage.confirmButton.click()
    SendMoneyPage.copyLinkButton.click()
    SendMoneyPage.doneButton.should('be.visible')
    SendMoneyPage.doneButton.invoke('attr', 'data-url').then(sendMoneyUrl => {
      var moneyLink = sendMoneyUrl
      var pattern = /(?:http[s]?:\/\/)[^\s[",><]*/gim
      var validMoneyLnk = moneyLink.match(pattern)

      //  SendMoneyPage.doneButton.click();
      cy.clearLocalStorage()
      cy.clearCookies()
      StartPage.open()
      StartPage.continueOnWebButton.click()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(Cypress.env('additionalAccountMnemonics'))
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.claimButton.should('be.visible')
      HomePage.moneyAmountDiv.invoke('text').then(moneyBefore => {
        cy.log('Money before sending: ' + moneyBefore)
        cy.visit(validMoneyLnk.toString())
        //wait for blockchain payment
        cy.contains('Claim').should('be.visible')
        HomePage.moneyAmountDiv.invoke('text').should('eq', (+moneyBefore + 0.01).toFixed(2))
      })
    })
  })
})

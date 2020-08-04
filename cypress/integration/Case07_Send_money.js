/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SendMoneyPage from '../PageObjects/SendMoneyPage'

describe('Test case 7: Ability to send money', () => {
  it('User is able to send money from a new wallet using the "claim"', () => {
    localStorage.clear()

    cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()

      HomePage.claimButton.click()

      return SendMoneyPage.hasWaitButton()
    }).then(hasWaitButton => {
      if (hasWaitButton) {
        SendMoneyPage.waitButton.click()
      }

      return HomePage.isInQueue()
    }).then(isInQueue => {
      const urlRequest = Cypress.env('REACT_APP_SERVER_URL')
      const bodyPass = Cypress.env('GUNDB_PASSWORD')

      if (!isInQueue) {
        return
      }

      return cy.request('POST', urlRequest + '/admin/queue', { password: bodyPass, allow: 0 })
    }).then(() => {
      cy.reload()
      cy.contains('Welcome to GoodDollar!').should('be.visible')
      HomePage.claimButton.should('be.visible')
      HomePage.claimButton.click()

      SendMoneyPage.dailyClaimText.should('be.visible')
      SendMoneyPage.dailyClaimText.click()
      SendMoneyPage.claimButton.click()
      SendMoneyPage.claimButton.should('have.attr', 'data-focusable')
      SendMoneyPage.verifyButton.should('be.visible')
      SendMoneyPage.verifyButton.click()

      LoginPage.yayButton.click()
      cy.contains('G$').should('be.visible')

      HomePage.sendButton.click()
      SendMoneyPage.nameInput.type('another person')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.moneyInput.type('0.05')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.messageInput.type('test message')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.confirmButton.click()
      SendMoneyPage.copyLinkButton.click()
      SendMoneyPage.doneButton.should('be.visible')

      return cy.get('[data-testid*="http"]').invoke('attr', 'data-testid')
    }).then(sendMoneyUrl => {
      const { sendMoneyLinkRegex } = SendMoneyPage
      const [validMoneyLnk] = sendMoneyLinkRegex.exec(sendMoneyUrl)

      cy.log(sendMoneyUrl)
      cy.log(validMoneyLnk)

      SendMoneyPage.doneButton.click()
      cy.clearLocalStorage()
      cy.clearCookies()
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(Cypress.env('additionalAccountMnemonics'))
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.claimButton.should('be.visible')

      cy.visit(validMoneyLnk)
      cy.contains('Claim').should('be.visible')

      return HomePage.moneyAmountDiv.invoke('text')
    }).then(moneyBefore => {
      cy.log('Money before sending: ' + moneyBefore)

      // wait for blockchain payment
      SendMoneyPage.yayButton.should('be.visible')
      HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBefore) + 0.05).toFixed(2))
      SendMoneyPage.yayButton.click()
      cy.contains(Cypress.env('usernameForRegistration')).should('be.visible')
      cy.contains('test message').should('be.visible')
      cy.contains('another person').should('not.be.visible')
    })
  })

  it('User is able to send money from exist wallet without "claim"', () => {
    let link

    localStorage.clear()
    StartPage.open()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(Cypress.env('additionalAccountMnemonics'))
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
    HomePage.claimButton.should('be.visible')
    HomePage.sendButton.click()
    SendMoneyPage.nameInput.type('exist user')
    SendMoneyPage.nextButton.click()
    SendMoneyPage.moneyInput.type('0.03')
    SendMoneyPage.nextButton.click()
    SendMoneyPage.messageInput.type('without claim')
    SendMoneyPage.nextButton.click()
    SendMoneyPage.confirmButton.click()
    SendMoneyPage.copyLinkButton.click()
    SendMoneyPage.doneButton.should('be.visible')

    cy.get('[data-testid*="http"]').invoke('attr', 'data-testid').then(sendMoneyUrl => {
      const { sendMoneyLinkRegex } = SendMoneyPage
      const [validMoneyLnk] = sendMoneyLinkRegex.exec(sendMoneyUrl)

      cy.log(sendMoneyUrl)
      cy.log(validMoneyLnk)
      link = validMoneyLnk

      SendMoneyPage.doneButton.click()
      cy.clearLocalStorage()
      cy.clearCookies()

      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')

      return cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt')
    }).then(mnemonic => {
      cy.log(mnemonic)

      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.claimButton.should('be.visible')

      cy.visit(link)
      cy.contains('Claim').should('be.visible')

      return HomePage.moneyAmountDiv.invoke('text')
    }).then(moneyBefore => {
      cy.log('Money before sending: ' + moneyBefore)

      // wait for blockchain payment
      SendMoneyPage.yayButton.should('be.visible')
      HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBefore) + 0.03).toFixed(2))
      SendMoneyPage.yayButton.click()

      cy.contains(Cypress.env('additionalAccountUsername')).should('be.visible')
      cy.contains('without claim').should('be.visible')
      cy.contains('exist user').should('not.be.visible')
    })
  })
})

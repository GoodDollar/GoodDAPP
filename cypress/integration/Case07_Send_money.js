/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SendMoneyPage from '../PageObjects/SendMoneyPage'

let link

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
      cy.contains('Learn More').should('be.visible')

      return SendMoneyPage.hasWaitButton
    }).then(hasWaitButton => {
      const urlRequest = Cypress.env('REACT_APP_SERVER_URL')
      const bodyPass = Cypress.env('GUNDB_PASSWORD')

      if (!hasWaitButton) {
        return
      }

      SendMoneyPage.waitButton.click()
      cy.request('POST', urlRequest + '/admin/queue', { password: bodyPass, allow: 0 })
    }).then(() => {
      cy.reload()
      HomePage.waitForHomePageDisplayed()

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

      cy.visit(validMoneyLnk)
      cy.contains('Claim').should('be.visible')

      return HomePage.moneyAmountDiv.invoke('text')
    }).then(moneyBefore => {
      cy.log('Money before sending: ' + moneyBefore)

      // wait for blockchain payment
      HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBefore) + 0.05).toFixed(2))
      SendMoneyPage.yayButton.click()
      cy.contains(Cypress.env('usernameForRegistration')).should('be.visible')
      cy.contains('test message').should('be.visible')
      cy.contains('another person').should('not.be.visible')
    })
  })

  it('User is able to send money from exist wallet without "claim"', () => {
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
      HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBefore) + 0.03).toFixed(2))
      SendMoneyPage.yayButton.click()

      cy.contains(Cypress.env('additionalAccountUsername')).should('be.visible')
      cy.contains('without claim').should('be.visible')
      cy.contains('exist user').should('not.be.visible')
    })
  })

  it('Check the link of send TX that was already used', () =>{
    localStorage.clear()

    cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.claimButton.should('be.visible')

      return HomePage.moneyAmountDiv.invoke('text')
    }).then(moneyBefore => {
      cy.visit(link)
      cy.log('Money before sending: ' + moneyBefore)
      SendMoneyPage.alreadyUsedText.should('be.visible')
      HomePage.moneyAmountDiv.invoke('text').should('eq', moneyBefore)
      cy.contains('Ok').click()
    })
  })

  it('Check the link of send TX that canceled before withdrawn', () => {
    let moneyStart
    let moneyLink

    localStorage.clear()
    cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()

      HomePage.moneyAmountDiv.invoke('text').then(moneyBeforeAbort => {
        moneyStart = moneyBeforeAbort
        cy.log('Money before sending: ' + moneyStart)
      })

      HomePage.sendButton.click()
      SendMoneyPage.nameInput.type('canceled body')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.moneyInput.type('0.01')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.messageInput.type('send canceled before withdrawn')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.confirmButton.click()
      SendMoneyPage.copyLinkButton.click()
      SendMoneyPage.doneButton.should('be.visible')

      return cy.get('[data-testid*="http"]').invoke('attr', 'data-testid')
    }).then(sendMoneyUrl => {
      const { sendMoneyLinkRegex } = SendMoneyPage
      const [validMoneyLnk] = sendMoneyLinkRegex.exec(sendMoneyUrl)

      moneyLink = validMoneyLnk
      cy.log(sendMoneyUrl)
      cy.log(validMoneyLnk)

      SendMoneyPage.doneButton.click()
      HomePage.waitForHomePageDisplayed()
      HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyStart) - 0.01).toFixed(2))
      
      cy.wait(10000) //wait for transaction to complete
      cy.contains('canceled body').should('be.visible')
      cy.contains('canceled body').click()
      SendMoneyPage.cancelButton.should('be.visible')
      SendMoneyPage.cancelButton.click()
      cy.contains('canceled body').should('not.be.visible')

      cy.clearLocalStorage()
      cy.clearCookies()
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(Cypress.env('additionalAccountMnemonics'))
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()

      return HomePage.moneyAmountDiv.invoke('text')
    }).then(moneyBefore => {
      cy.log('Money before sending: ' + moneyBefore)
      
      cy.visit(moneyLink)
      SendMoneyPage.alreadyUsedText.should('be.visible')
      HomePage.moneyAmountDiv.invoke('text').should('eq', moneyBefore)
      cy.contains('Ok').click()
    })
  })

  it('User is able to send money from a new wallet using address', () => {
    let moneyStart

    localStorage.clear()
    cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()

      return HomePage.moneyAmountDiv.invoke('text')
    }).then(moneyBeforeAbort => {
      moneyStart = moneyBeforeAbort
      cy.log('Money before sending: ' + moneyStart)
      HomePage.sendButton.click()
      SendMoneyPage.sendAddressButton.click()
      SendMoneyPage.addressInput.type('1x1234567890qwerty')
      SendMoneyPage.errorAddressText.should('be.visible')
      SendMoneyPage.addressInput.clear()
      SendMoneyPage.addressInput.type(Cypress.env('mainWalletAddress'))
      SendMoneyPage.nextButton.click()
      SendMoneyPage.moneyInput.type('1000000000')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.errorMoneyText.should('be.visible')
      SendMoneyPage.moneyInput.clear()
      SendMoneyPage.moneyInput.type('0.01')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.messageInput.type('send to address')
      SendMoneyPage.nextButton.click()
      SendMoneyPage.sendingText.should('be.visible')
      cy.contains(Cypress.env('mainWalletAddress')).should('be.visible')
      cy.contains('send to address').should('be.visible')
      SendMoneyPage.confirmButton.click()
      SendMoneyPage.yayButton.click()
      cy.contains(Cypress.env('mainAccountUsername')).should('be.visible')
      cy.contains('send to address').should('be.visible')

      return HomePage.moneyAmountDiv.invoke('text')
    }).then(moneyAfterAbort => {
      cy.log('Money after sending: ' + moneyAfterAbort)
      cy.log('calc: ' + (Number(moneyStart) - 0.01).toFixed(2))
      HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyStart) - 0.01).toFixed(2))

      cy.clearLocalStorage()
      cy.clearCookies()
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(Cypress.env('additionalAccountMnemonics'))
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()
      cy.contains(Cypress.env('usernameForRegistration')).should('be.visible')
    })
  })
})

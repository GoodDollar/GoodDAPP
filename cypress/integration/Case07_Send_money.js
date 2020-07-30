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
      //cy.wait(2000) // wait for a pop-up to appear confirming the decision in the queue
      cy.contains(/OK, I’ll WAIT/i).click()
      HomePage.claimButton.invoke('text').then(text => {
        if (text == 'Queue') {
          const urlRequest = Cypress.env('REACT_APP_SERVER_URL')
          const bodyPass = Cypress.env('GUNDB_PASSWORD')
          cy.request('POST', urlRequest + '/admin/queue', { password: bodyPass, allow: 0 }).then(response => {
            expect(response.body).to.have.property('stillPending')
          })
          cy.reload()
          cy.contains('Welcome to GoodDollar!').should('be.visible')
          HomePage.claimButton.should('be.visible')
          HomePage.claimButton.click()
        }        
      })

      /*
      cy.get('#root')
        .find('[role="button"]')
        .its('length')
        .then(res => {
          cy.log(res)
          if (res == 4) {
            cy.get('[role="button"]')
              .contains(/OK, I’ll WAIT/i)
              .click()
          }
          if (res != 2) {
            HomePage.claimButton.invoke('text').then(text => {
              cy.log(text)
              if (text == 'Queue') {
                const urlRequest = Cypress.env('REACT_APP_SERVER_URL')
                const bodyPass = Cypress.env('GUNDB_PASSWORD')
                cy.request('POST', urlRequest + '/admin/queue', { password: bodyPass, allow: 0 }).then(response => {
                  expect(response.body).to.have.property('stillPending')
                })
                cy.reload()
                cy.contains('Welcome to GoodDollar!').should('be.visible')
                HomePage.claimButton.should('be.visible')
                HomePage.claimButton.click()
              }
            })
          }
        })
        */

      SendMoneyPage.dailyClaimText.should('be.visible')
      SendMoneyPage.claimButton.click()
      SendMoneyPage.claimButton.should('have.attr', 'data-focusable')
      SendMoneyPage.verifyButton.should('be.visible')
      SendMoneyPage.verifyButton.click()

      // face verification
      // cy.wait(5000)
      // SendMoneyPage.readyButton.should('be.visible')
      // SendMoneyPage.readyButton.click()

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

      //get link from clipboard
      // cy.task('getClipboard').then(sendMoneyUrl => {

      cy.get('[data-testid*="http"]')
        .invoke('attr', 'data-testid')
        .then(sendMoneyUrl => {
          cy.log(sendMoneyUrl)
          const moneyLink = sendMoneyUrl
          const pattern = /(?:http[s]?:\/\/)[^\s[",><]*/gim
          const validMoneyLnk = moneyLink.match(pattern)
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
          HomePage.moneyAmountDiv.invoke('text').then(moneyBefore => {
            cy.log('Money before sending: ' + moneyBefore)
            cy.visit(validMoneyLnk.toString())

            //wait for blockchain payment
            cy.contains('Claim').should('be.visible')
            HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBefore) + 0.05).toFixed(2))
            SendMoneyPage.yayButton.click()
            cy.contains(Cypress.env('usernameForRegistration')).should('be.visible')
            cy.contains('test message').should('be.visible')
            cy.contains('another person').should('not.be.visible')            
          })
        })
    })
  })

  it('User is able to send money from exist wallet without "claim"', () => {
    let validMoneyLnk
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
    cy.get('[data-testid*="http"]')
      .invoke('attr', 'data-testid')
      .then(sendMoneyUrl => {
        cy.log(sendMoneyUrl)
        const moneyLink = sendMoneyUrl
        const pattern = /(?:http[s]?:\/\/)[^\s[",><]*/gim
        validMoneyLnk = moneyLink.match(pattern)
        cy.log(validMoneyLnk)
      })
    SendMoneyPage.doneButton.click()
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.claimButton.should('be.visible')
      HomePage.moneyAmountDiv.invoke('text').then(moneyBefore => {
        cy.log('Money before sending: ' + moneyBefore)
        cy.visit(validMoneyLnk.toString())

        //wait for blockchain payment
        cy.contains('Claim').should('be.visible')
        HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBefore) + 0.03).toFixed(2))
        SendMoneyPage.yayButton.click()
        cy.contains(Cypress.env('additionalAccountUsername')).should('be.visible')
        cy.contains('without claim').should('be.visible')
        cy.contains('exist user').should('not.be.visible')
      })
    })
  })
})

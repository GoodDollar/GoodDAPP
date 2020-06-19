/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'

// import HomePage from '../PageObjects/HomePage'
// import SendMoneyPage from '../PageObjects/SendMoneyPage'

describe('Test feeds', () => {
  it('User is able to send money', () => {
    const todaysDate = Cypress.moment().format('DD.MM.YY')

    // cy.clearLocalStorage()
    // cy.clearCookies()
    localStorage.clear()
    cy.readFile('cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      cy.log(todaysDate)

      cy.contains('Welcome to GoodDollar!').should('be.visible')
      cy.contains('Welcome to GoodDollar!').click()
      cy.get('img[src="/static/media/invite.bbc5ae11.png"]').should('be.visible')
      cy.contains(todaysDate).should('be.visible')
      cy.contains('Welcome to GoodDollar!').should('be.visible')
      cy.contains('GoodDollar coins every day').should('be.visible')
      cy.get('[role="button"]')
        .contains(/Ok/i)
        .click()

      /*
      HomePage.moneyAmountDiv.invoke('text').then(moneyBefore => {
        cy.log('Money before: ' + moneyBefore)
        let moneyStart = moneyBefore

        HomePage.sendButton.click()
        SendMoneyPage.nameInput.type('vasya pupkin')
        SendMoneyPage.nextButton.click()
        SendMoneyPage.moneyInput.type('0.01')
        SendMoneyPage.nextButton.click()
        SendMoneyPage.messageInput.type('for testing feeds')
        SendMoneyPage.nextButton.click()
        SendMoneyPage.confirmButton.click()
        SendMoneyPage.copyLinkButton.click()
        SendMoneyPage.doneButton.should('be.visible')
        SendMoneyPage.doneButton.click()

        HomePage.moneyAmountDiv.invoke('text').should('eq', (Number(moneyBefore) - 0.01).toFixed(2))
        HomePage.moneyAmountDiv.invoke('text').then(moneyAfter => {
          cy.log('Money after: ' + moneyAfter)
        })

        cy.contains('vasya pupkin').should('be.visible')
        cy.contains('vasya pupkin').click()
        cy.contains('Payment Pending...').should('be.visible')
        //cy.get('img').should('have.attr', 'src').and('contain.text', 'close')
        //cy.get('img').should('have.attr', 'src', '/static/media/close.e1a37435.svg')
        cy.contains('27.05.20').should('be.visible')
        cy.contains('-0.01G$').should('be.visible')
        cy.contains('To: vasya pupkin').should('be.visible')
        cy.contains('for testing feeds').should('be.visible')
        cy.get('[role="button"]')
          .contains(/Cancel link/i)
          .should('be.visible')
        cy.get('[role="button"]')
          .contains(/Share link/i)
          .should('be.visible')
        cy.get('[role="button"]')
          .contains(/Cancel link/i)
          .click()
        //cy.get('[role="button"]').contains(/Ok/i).click()

        cy.contains('vasya pupkin').should('not.be.visible')

        HomePage.moneyAmountDiv.invoke('text').should('eq', moneyBefore)
        HomePage.moneyAmountDiv.invoke('text').then(moneyEnd => {
          cy.log('Money in end: ' + moneyEnd)
        })
      })*/
    })
  })
})

/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'

describe('Test feeds', () => {
  it('Testing first start feed', () => {
    const todaysDate = Cypress.moment().format('DD.MM.YY')
    localStorage.clear()
    cy.readFile('cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()
      HomePage.profileAvatar.click()
      HomePage.backArrow.eq(0).click()
      cy.wait(3000) // wait for cards animation
      
      HomePage.welcomeFeed.should('be.visible')
      cy.log(todaysDate)
      cy.contains('Welcome to GoodDollar!').should('be.visible')
      cy.contains('Welcome to GoodDollar!').click()
      cy.get('img[src="/static/media/invite.bbc5ae11.png"]').should('be.visible')
      // cy.contains(todaysDate).should('be.visible')
      cy.contains('Welcome to GoodDollar!').should('be.visible')
      cy.contains('GoodDollar coins every day').should('be.visible')
      cy.get('[role="button"]')
        .contains(/LET`S DO IT/i)
        .click()
    })
  })
})

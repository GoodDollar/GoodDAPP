/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import HomePage from '../PageObjects/HomePage'

describe('Test case 1: Create temporary user', () => {
  it('User to sign up the wallet with correct values', () => {
    cy.visit(Cypress.env('baseUrl'))
    localStorage.clear()

    StartPage.createWalletButton.click()
    SignUpPage.nameInput.should('be.visible')
    SignUpPage.nameInput.type(Cypress.env('usernameForRegistration'))
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    SignUpPage.phoneInput.type(Cypress.env('numberForCheckingRegistration'), { delay: 300 })
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    SignUpPage.waitForSignUpPageDisplayed()
    for (let i = 0; i < 6; i++) {
      SignUpPage.codeInputs.eq(i).type(i, { delay: 500 })
      //.should('be.visible')
    }
    SignUpPage.emailInput.should('be.visible')
    SignUpPage.emailInput.type(Cypress.env('emailForCheckingRegistration'))
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    SignUpPage.letStartButton.click()
    SignUpPage.gotItButton.click()
    HomePage.welcomeFeed.should('be.visible')
    HomePage.optionsButton.click()
    HomePage.backupButton.click().should(() => {
      //expect(localStorage.getItem('GD_mnemonic')).to.not.be.null
      cy.writeFile('cypress/fixtures/userMnemonicSave.txt', localStorage.getItem('GD_mnemonic'))
      let LOCAL_STORAGE_MEMORY = {}
      Object.keys(localStorage).forEach(key => {
        LOCAL_STORAGE_MEMORY[key] = localStorage[key]
      })
      cy.log('ALL: ', LOCAL_STORAGE_MEMORY)
      cy.writeFile('cypress/fixtures/GDls.json', LOCAL_STORAGE_MEMORY)
    })
  })
})

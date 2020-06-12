/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import HomePage from '../PageObjects/HomePage'
import SocialLoginPage from '../PageObjects/SocialLoginPage'
import userObject from '../fixtures/userObject.json'

describe('Test case 1: login via TorusTestUser and Create temporary user', () => {
  it('login via google', () => {
    localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
    StartPage.open()
    expect(localStorage.getItem('TorusTestUser')).to.not.be.null
    SocialLoginPage.googleLink.should('be.visible')
    cy.wait(1000)
    SocialLoginPage.googleLink.click()
    HomePage.profileAvatar.should('be.visible')
    HomePage.sendButton.should('be.visible')
    HomePage.optionsButton.click()
    HomePage.logoutButton.click()
  })

  it('login via facebook', () => {
    localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
    StartPage.open()
    expect(localStorage.getItem('TorusTestUser')).to.not.be.null
    SocialLoginPage.facebookLink.should('be.visible')
    cy.wait(1000)
    SocialLoginPage.facebookLink.click()
    HomePage.profileAvatar.should('be.visible')
    HomePage.sendButton.should('be.visible')
    HomePage.optionsButton.click()
    HomePage.logoutButton.click()
  })

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
      SignUpPage.codeInputs.eq(i).type(i, { delay: 500 }) //.should('be.visible')
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

      // get mnemonic from clipboard
      // HomePage.clipboardButton.click()
      // cy.task('getClipboard').then(mnemonic => {
      //   cy.log(mnemonic)
      //   cy.writeFile('cypress/fixtures/userMnemonicSave.txt', mnemonic, { timeout: 10000 })
      // })

      //get mnemonic from localStorage
      expect(localStorage.getItem('GD_mnemonic')).to.not.be.null
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

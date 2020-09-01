/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import HomePage from '../PageObjects/HomePage'
import SocialLoginPage from '../PageObjects/SocialLoginPage'
import userObject from '../fixtures/userObject.json'

function inputPhoneNumber(isVisible) {
  if (isVisible) {
    cy.contains('enter your phone number')
    SignUpPage.phoneInput.type(Cypress.env('numberForTorus'), { delay: 300 })
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    SignUpPage.waitForSignUpPageDisplayed()
    for (let i = 0; i < 6; i++) {
      SignUpPage.codeInputs.eq(i).type(i, { delay: 500 })
    }
    SignUpPage.letStartButton.click()
  }
}

function checkUserStorageBeforeStart() {
  expect(localStorage.getItem('GD_mnemonic')).to.be.null
  expect(localStorage.getItem('GD_privateKeys')).to.be.null
  expect(localStorage.getItem('GD_isLoggedIn')).to.be.null
  expect(localStorage.getItem('GD_GunCredentials')).to.be.null
  expect(localStorage.getItem('GD_trust')).to.be.null
  expect(localStorage.getItem('GD_creds')).to.be.null
  expect(localStorage.getItem('GD_jwt')).to.be.null
  expect(localStorage.getItem('GD_feed')).to.be.null

  expect(localStorage.getItem('mtc_id')).to.not.be.null
  expect(localStorage.getItem('mtc_sid')).to.not.be.null
  expect(localStorage.getItem('loglevel:torus.js')).to.not.be.null
  expect(localStorage.getItem('loglevel:torus-direct-web-sdk')).to.not.be.null
}

describe('Test case 1: login via TorusTestUser and Create temporary user', () => {
  it('login via google', () => {
    let phomeNumber = false
    
    localStorage.clear()
    localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
    StartPage.open()
    expect(localStorage.getItem('TorusTestUser')).to.not.be.null
    SocialLoginPage.googleLink.should('be.visible')
    SocialLoginPage.googleLink.get('[role="button"]').should('have.attr', 'data-focusable', 'true')
    // cy.wait(1000) //wait for button to be enabled torus sdk ready
    SocialLoginPage.googleLink.click()

    cy.contains('Welcome').should('not.be.visible')
    cy.get('#root')
      .find('[data-focusable="true"]')
      .its('length')
      .then(res => {
        cy.log(res)
        if (res == 2) {
          phomeNumber = true
          inputPhoneNumber(phomeNumber)
        }
      })

    HomePage.sendButton.should('be.visible')
    HomePage.optionsButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    HomePage.logoutButton.click()
  })

  it('login via facebook', () => {
    localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
    StartPage.open()
    expect(localStorage.getItem('TorusTestUser')).to.not.be.null
    SocialLoginPage.facebookLink.should('be.visible')
    SocialLoginPage.facebookLink.get('[role="button"]').should('have.attr', 'data-focusable', 'true')
    // cy.wait(1000) //wait for button to be enabled torus sdk ready
    SocialLoginPage.facebookLink.click()
    HomePage.sendButton.should('be.visible')
    HomePage.optionsButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    HomePage.logoutButton.click()
  })

  it.skip('Check that wallet and userstorage not loaded on startup', () => {
    StartPage.open()
    StartPage.headerPage.contains('Welcome').should('be.visible').then(() =>{
      checkUserStorageBeforeStart()
    })

    StartPage.createWalletButton.click()
    SignUpPage.nameInput.should('be.visible')
    SignUpPage.nameInput.type('Testing UserStorage')
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    cy.wait(2000) //wait for the userstorage data to load
    SignUpPage.phoneInput.should('be.visible').then(() =>{
      expect(localStorage.getItem('GD_mnemonic')).to.not.be.null
      expect(localStorage.getItem('GD_privateKeys')).to.not.be.null
      expect(localStorage.getItem('GD_creds')).to.not.be.null
      expect(localStorage.getItem('GD_jwt')).to.not.be.null
    })
  })

  it('User to sign up the wallet with correct values', () => {
    StartPage.open()
    StartPage.headerPage.contains('Welcome').should('be.visible')
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

    //get mnemonic from localStorage
    HomePage.sendButton.should(() => {
      expect(localStorage.getItem('GD_mnemonic')).to.not.be.null
      cy.writeFile('cypress/fixtures/userMnemonicSave.txt', localStorage.getItem('GD_mnemonic'))
      let LOCAL_STORAGE_MEMORY = {}
      Object.keys(localStorage).forEach(key => {
        LOCAL_STORAGE_MEMORY[key] = localStorage[key]
      })
      cy.log('ALL: ', LOCAL_STORAGE_MEMORY)
      cy.writeFile('cypress/fixtures/GDls.json', LOCAL_STORAGE_MEMORY)
    })

    // check start feed
    const todaysDate = Cypress.moment().format('DD.MM.YY')

    HomePage.welcomeFeed.should('be.visible')
    cy.log(todaysDate)
    cy.contains('Welcome to GoodDollar!').should('be.visible')
    cy.contains('Welcome to GoodDollar!').click()
    cy.get('img[src="/static/media/invite.bbc5ae11.png"]').should('be.visible')
    cy.contains('Welcome to GoodDollar!').should('be.visible')
    cy.contains('GoodDollar coins every day').should('be.visible')
    cy.get('[role="button"]').contains(/LET`S DO IT/i).click()
  })
})

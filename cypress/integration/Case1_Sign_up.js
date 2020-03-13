/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import HomePage from '../PageObjects/HomePage'

// import RewardsPage from '../PageObjects/RewardsPage'

describe('Test case 1: Ability to Sign Up', () => {
  it('User is not able to sign up the wallet with wrong values', () => {
    cy.visit(Cypress.env('baseUrl') + '?paymentCode=1234567asQ3')
    StartPage.continueOnWebButton.click()
    StartPage.createWalletButton.click()
    SignUpPage.pageHeader.should('contain', 'Sign Up')
    SignUpPage.nameInput.should('be.visible')
    SignUpPage.nextButton.should('be.visible')

    SignUpPage.nameInput.type('Name')
    SignUpPage.invalidValueErrorMessage1.should('exist')
    SignUpPage.nameInput.clear()
    SignUpPage.nameInput.type('Name1 Name')
    SignUpPage.invalidValueErrorMessage2.should('exist')
    SignUpPage.nameInput.clear()
    SignUpPage.nameInput.type(Cypress.env('usernameForRegistration'))
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    SignUpPage.phoneInput.type('+11111')
    SignUpPage.invalidValueErrorMessage3.should('exist')
    SignUpPage.phoneInput.clear()
    SignUpPage.phoneInput.type('+9999999999999')
    SignUpPage.invalidValueErrorMessage3.should('exist')
  })

  it('User is able to sign up the wallet with correct values', () => {
    cy.visit(Cypress.env('baseUrl') + '?paymentCode=123', {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker
      },
    })
    StartPage.continueOnWebButton.click()
    StartPage.createWalletButton.click()
    SignUpPage.nameInput.should('be.visible')
    SignUpPage.nameInput.type(Cypress.env('usernameForRegistration'))
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    SignUpPage.phoneInput.type(Cypress.env('numberForCheckingRegistration'), { delay: 300 })
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    for (let i = 0; i < 6; i++) {
      SignUpPage.waitForSignUpPageDisplayed()
      SignUpPage.codeInputs
        .eq(i)
        .type(i, { force: true }, { delay: 300 })
        .should('be.visible')
    }
    SignUpPage.emailInput.should('be.visible')
    SignUpPage.emailInput.type(Cypress.env('emailForCheckingRegistration'))
    SignUpPage.nextButton.should('have.attr', 'data-focusable')
    SignUpPage.nextButton.click()
    SignUpPage.letStartButton.click()
    SignUpPage.gotItButton.click()
    HomePage.welcomeFeed.should('be.visible')

    // ** Check wallet gas ** //
    // ** Part for checking Rewards window **//
    // HomePage.rewardsButton.click()
    // RewardsPage.pageHeader.should('contain', 'Rewards')
    // RewardsPage.iframe.should('be.visible')
    // RewardsPage.iframe
    //   .then(iframe => new Promise(resolve => setTimeout(() => resolve(iframe), 7500)))
    //   .then(iframe => {
    //     const body = iframe.contents().find('body')

    //     cy.wrap(body.find(RewardsPage.createWalletButton)).should('be.visible')

    //     // cy.wrap(body.find(RewardsPage.contentWrapper)).should('contain', 'Redeem your rewards & collected daily income')
    //   })
    // RewardsPage.backButton.click()
    // cy.wait(7000)
    // cy.window().then(win => {
    //   const identifierValue = win.wallet.getAccountForType('login').toLowerCase()
    //   cy.request(
    //     'POST',
    //     'https://explorer.fusenet.io/api/?module=account&action=balance&address=' + identifierValue
    //   ).then(res => {
    //     cy.log(res)
    //   })
    // })
    HomePage.optionsButton.click()
    cy.contains('Ok').click()
    HomePage.deleteAccountButton.click()
    HomePage.confirmDeletionButton.click()
    StartPage.continueOnWebButton.should('be.visible')
  })
})

/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import HomePage from '../PageObjects/HomePage'

// import RewardsPage from '../PageObjects/RewardsPage'

describe('Test case 1: Ability to Sign Up', () => {
  it('User is not able to sign up the wallet with wrong values', () => {
    StartPage.open()
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
    SignUpPage.nameInput.type(Cypress.env("usernameForRegistration"))
    cy.wait(5000)
    SignUpPage.nextButton.click()
    SignUpPage.phoneInput.type('+11111')
    SignUpPage.invalidValueErrorMessage3.should('exist')
    SignUpPage.phoneInput.clear()
    SignUpPage.phoneInput.type('+9999999999999')
    SignUpPage.invalidValueErrorMessage3.should('exist')
  })

  it('User is able to sign up the wallet with correct values', () => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.createWalletButton.click()
    cy.wait(3000)
    SignUpPage.nameInput.type(Cypress.env("usernameForRegistration"))
    cy.wait(3000)
    SignUpPage.nextButton.click()
    SignUpPage.phoneInput.type(Cypress.env("numberForCheckingRegistration"))
    SignUpPage.nextButton.click()

    // SignUpPage.errorOkayButton.click();
    // SignUpPage.nextButton.click();
    cy.wait(5000)

    // ** it works more reliably then cycle ** //
    SignUpPage.codeInputs.eq(0).type(0, { force: true });
    SignUpPage.codeInputs.eq(1).type(1, { force: true });
    SignUpPage.codeInputs.eq(2).type(2, { force: true });
    SignUpPage.codeInputs.eq(3).type(3, { force: true });
    SignUpPage.codeInputs.eq(4).type(4, { force: true });
    SignUpPage.codeInputs.eq(5).type(5, { force: true });

    cy.wait(5000)
    SignUpPage.emailInput.type(Cypress.env("emailForCheckingRegistration"))
    cy.wait(5000)
    SignUpPage.nextButton.click()
    SignUpPage.gotItButton.click()
    SignUpPage.letStartButton.click()
    cy.wait(10000)

    // ** Check wallet gas ** //

    HomePage.welcomeFeed.should('be.visible')

    // // ** Part for checking Rewards window **//
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

    // ** test ** //
    HomePage.optionsButton.click()
    cy.wait(5000)
    HomePage.deleteAccountButton.click()
    cy.wait(8000)
    HomePage.confirmDeletionButton.click()
    cy.wait(15000)
    cy.log('Done!')
  })
})

/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SocialLoginPage from '../PageObjects/SocialLoginPage'
import HomePage from '../PageObjects/HomePage'
import userObject from '../fixtures/userObject.json'
//import SignUpPage from '../PageObjects/SignUpPage'

describe('Login Torus', () => {
  beforeEach(() => {
    localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
  })

  it('login via TorusTestUser', () => {
    StartPage.open()
    expect(localStorage.getItem('TorusTestUser')).to.not.be.null
    SocialLoginPage.googleLink.should('be.visible')
    SocialLoginPage.googleLink.click()
    cy.contains('Good Dollar')
    HomePage.sendButton.should('be.visible')

    /*
    if (cy.contains('enter your phone number')) {
      SignUpPage.phoneInput.type(Cypress.env('numberForTorus'), { delay: 300 })
      SignUpPage.nextButton.should('have.attr', 'data-focusable')
      SignUpPage.nextButton.click()
      for (let i = 0; i < 6; i++) {
        SignUpPage.waitForSignUpPageDisplayed()
        SignUpPage.codeInputs
          .eq(i)
          .type(i, { force: true }, { delay: 500 })
          .should('be.visible')
        SignUpPage.letStartButton.click()
      }*/
  })
})

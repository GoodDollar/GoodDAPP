/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SocialLoginPage from '../PageObjects/SocialLoginPage'
import HomePage from '../PageObjects/HomePage'
import userObject from '../fixtures/userObject.json'
//import SignUpPage from '../PageObjects/SignUpPage'

describe('Test 2.1: login via TorusTestUser', () => {
  // beforeEach(() => {
  //   localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
  // })

  it('login via google', () => {
    localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
    StartPage.open()
    expect(localStorage.getItem('TorusTestUser')).to.not.be.null
    SocialLoginPage.googleLink.should('be.visible')
    cy.wait(15000)
    SocialLoginPage.googleLink.click()
    HomePage.profileAvatar.should('be.visible')
    HomePage.sendButton.should('be.visible')
    HomePage.optionsButton.click()
    HomePage.logoutButton.click()

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

  it('login via facebook', () => {
    localStorage.setItem('TorusTestUser', JSON.stringify(userObject))
    StartPage.open()
    expect(localStorage.getItem('TorusTestUser')).to.not.be.null
    SocialLoginPage.facebookLink.should('be.visible')
    cy.wait(15000)
    SocialLoginPage.facebookLink.click()
    HomePage.profileAvatar.should('be.visible')
    HomePage.sendButton.should('be.visible')
  })
})

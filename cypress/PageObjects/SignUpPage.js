/* eslint-disable no-undef */
class SignUpPage {
  get pageHeader() {
    return cy.get('h1[role=heading]')
  }

  get nameInput() {
    return cy.get('#Name_input')
  }

  get phoneInput() {
    return cy.get('#Phone_input')
  }

  get nextButton() {
    return cy.get('div[role=button]').eq(1)
  }

  get emailInput() {
    return cy.get('#Email_input')
  }

  get invalidValueErrorMessage1() {
    return cy.contains('Please add first and last name')
  }

  get invalidValueErrorMessage2() {
    return cy.contains('A-Z letter only, no numbers, no symbols')
  }

  get invalidValueErrorMessage3() {
    return cy.contains('Please enter a valid phone format')
  }

  get codeInputs() {
    return cy.get('input[type=tel]')
  }

  get letStartButton() {
    return cy.contains("Let's start!")
  }

  waitForSignUpPageDisplayed() {
    cy.contains('Enter the verification code').should('be.visible')
  }
}

export default new SignUpPage()

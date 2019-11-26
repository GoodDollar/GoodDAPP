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
    return cy.get('div[role=button]').eq(2)
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

  // get errorOkayButton() {
  //     return cy.xpath('//*[@id="root"]/div[3]/div/div/div/div/div[2]/div[2]/div/div[3]/div/div');
  // }

  get codeInputs() {
    return cy.get('input[type=tel]')
  }

  get gotItButton() {
    return cy.contains('Cool, got it!')
  }

  get letStartButton() {
    return cy.contains("Let's start!")
  }

  waitForSignUpPageDisplayed() {
    cy.waitForResourceToLoad('main.f5bfd779.chunk.css')
    cy.get('.r-1r5su4o > .css-901oao').should('be.visible')
  }
}

export default new SignUpPage()

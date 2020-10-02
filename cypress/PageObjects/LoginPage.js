/* eslint-disable no-undef */
class LoginPage {
  get mnemonicsInput() {
    return cy.get('input')
  }

  get recoverWalletButton() {
    return cy.contains('Recover my wallet')
  }

  get errorWindow() {
    return cy.contains('Please check it and try again.')
  }

  get pageHeader() {
    return cy.get('h1[role=heading]')
  }

  get recoverFromPassPhraseLink() {
    return cy.contains('Or, recover from pass phrase')
  }

  get yayButton() {
    return cy.contains(/Yay!/i)
  }
}

export default new LoginPage()

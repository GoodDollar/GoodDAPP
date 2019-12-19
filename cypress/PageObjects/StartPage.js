/* eslint-disable no-undef */
class StartPage {
  get continueOnWebButton() {
    return cy.contains('Continue on Web')
  }

  get createWalletButton() {
    return cy.get('div[role=button]').contains('Create a wallet')
  }

  get signInButton() {
    return cy.contains('SIGN IN')
  }

  open() {
    cy.visit(Cypress.env('baseUrl'), {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker
      },
    })
  }
}

export default new StartPage()

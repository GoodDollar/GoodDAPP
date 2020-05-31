/* eslint-disable no-undef */
class StartPage {
  get createWalletButton() {
    return cy.contains('Agree & Continue with self custody wallet')
  }

  get signInButton() {
    return cy.contains(/Sign in/i, { timeout: 20000 })
    //return cy.contains('SIGN IN')
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

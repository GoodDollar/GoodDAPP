/* eslint-disable no-undef */
class StartPage {
  get createWalletButton() {
    return cy.contains('Agree & Continue with self custody wallet')
  }

  get signInButton() {
    return cy.contains(/Sign in/i, { timeout: 20000 })
  }

  open() {
    cy.visit(Cypress.env('baseUrl'), {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker
      },
    })
  }

  get headerPage() {
    return cy.get('[role="heading"]')
  }

  get backArrow() {
    return cy.get('div[style*="gooddollar"]')
  }

  get termsOfUseLink() {
    return cy.contains('Terms of Use')
  }

  get privacyPolicyLink() {
    return cy.contains('Privacy Policy')
  }

  get iframePPT() {
    return cy.getIframeBody('iframe[title="Privacy Policy & Terms"]')
  }

  get iframePP() {
    return cy.getIframeBody('iframe[title="Privacy Policy"]')
  }

  get main() {
    return '#main'
  }

  get splashScreen() {
    return cy.get('g[clip-path="url(#__lottie_element_2)"]')
  }
}

export default new StartPage()

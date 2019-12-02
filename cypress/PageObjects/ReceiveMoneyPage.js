/* eslint-disable no-undef */
class ReceiveMoneyPage {
  get pageHeader() {
    return cy.get('h1[role=heading]', { timeout: 10000 })
  }

  get requestSpecificAmountButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(2)
  }

  get shareYourWalletLinkButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(3)
  }

  get nameInput() {
    return cy.get('input[placeholder="Enter the recipient name"]', { timeout: 10000 })
  }

  get nextButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(3)
  }

  get moneyInput() {
    return cy.get('input[placeholder="0 G$"]', { timeout: 10000 })
  }

  get messageInput() {
    return cy.get('input[placeholder="Add a message"]', { timeout: 10000 })
  }

  get shareLinkButton() {
    return cy.get('[data-gdtype]', { timeout: 10000 })
  }

  get confirmWindowButton() {
    return cy.contains('Confirm')
  }

  get doneButton() {
    return cy.get('[data-gdtype="copybutton-done"]', { timeout: 10000 })
  }
}

export default new ReceiveMoneyPage()

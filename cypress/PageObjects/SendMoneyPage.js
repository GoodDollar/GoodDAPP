/* eslint-disable no-undef */
class SendMoneyPage {
  get nameInput() {
    return cy.get('input[placeholder="Enter the recipient name"]', { timeout: 10000 })
  }

  get messageInput() {
    return cy.get('input[placeholder="Add a message"]', { timeout: 10000 })
  }

  get nextButton() {
    return cy.get('div[role=button]', { timeout: 10000 }).contains('Next')
  }

  get moneyInput() {
    return cy.get('input[placeholder="0 G$"]', { timeout: 10000 })
  }

  get confirmButton() {
    return cy.contains('Confirm', { timeout: 10000 })
  }

  get copyLinkButton() {
    return cy.get('div[role=button]', { timeout: 10000 }).contains('Copy link to clipboard')
  }

  get doneButton() {
    return cy.get('div[data-gdtype="copybutton-done"]')
  }
}

export default new SendMoneyPage()

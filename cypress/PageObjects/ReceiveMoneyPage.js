/* eslint-disable no-undef */
class ReceiveMoneyPage {
  get pageHeader() {
    return cy.get('h1[role=heading]', { timeout: 10000 })
  }

  get requestSpecificAmountButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(1)
  }

  get shareYourWalletLinkButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(2)
  }

  get nameInput() {
    return cy.get('input[placeholder="Enter the recipient name"]', { timeout: 10000 })
  }

  get nextButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(2)
  }

  get moneyInput() {
    return cy.get('input[placeholder="0 G$"]', { timeout: 10000 })
  }

  get messageInput() {
    return cy.get('input[placeholder="Add a message"]', { timeout: 10000 })
  }

  get shareLinkButton() {
    return cy.contains('COPY LINK TO CLIPBOARD')
  }

  get confirmWindowButton() {
    return cy.contains('Confirm')
  }

  get doneButton() {
    return cy.contains('Done')
  }

  get qrImage() {
    return cy.get('[theme="[object Object]"]')
  }
}

export default new ReceiveMoneyPage()
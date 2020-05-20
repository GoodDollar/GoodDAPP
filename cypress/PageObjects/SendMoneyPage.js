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
    return cy.contains(/copy link to clipboard/i)
  }

  get doneButton() {
    return cy.contains('Done')
  }

  get dailyClaimText() {
    return cy.contains('Daily Share')
  }

  get claimButton() {
    return cy.get('[role="button"]').eq(1)
  }

  get verifyButton() {
    return cy.contains('OK, Verify me')
  }

  get readyButton() {
    return cy.contains('I\'M READY')
  }
}

export default new SendMoneyPage()

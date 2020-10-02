/* eslint-disable no-undef */
class HomePage {

  get inviteTab() {
    return cy.get('[data-testid="invite_tab"]')
  }

  get optionsButton() {
    return cy.get('[data-testid="burger_button"]')
  }

  get magicLink() {
    return cy.get('span').contains('EMAIL ME THE MAGIC LINK')
  }

  get sendButton() {
    return cy.contains('Send')
  }

  get claimButton() {
    return cy.get('[data-testid="claim_button"]')
  }

  get receiveButton() {
    return cy.contains('Receive')
  }

  get options() {
    return cy.get('[data-testid="close_burger_button"] + div > div', { timeout: 10000 })
  }

  get profileAvatar() {
    return cy.get('img[alt]', { timeout: 10000 }).eq(0)
  }

  get closeOptionsButton() {
    return cy.get('[dir=auto]', { timeout: 10000 }).eq(0)
  }

  get moneyAmountDiv() {
    return cy.get('[data-testid="amount_value"] div:nth-child(1)', { timeout: 10000 })
  }

  get welcomeFeed() {
    return cy.contains('Claim free G$ coins daily')
  }

  get deleteAccountButton() {
    return cy.contains('Delete Account')
  }

  get confirmDeletionButton() {
    return cy.get('span').contains('Delete')
  }

  get backupButton() {
    return cy.contains('Export Wallet')
  }

  get exportWalletButton() {
    return cy.contains('Export Wallet')
  }

  get clipboardButton() {
    return cy.contains('Copy all to clipboard')
  }

  get logoutButton() {
    return cy.contains('Logout')
  }

  get backArrow() {
    return cy.get('div[style*="gooddollar"]')
  }

  waitForHomePageDisplayed() {
    cy.contains('Claim').should('be.visible')
  }

  isInQueue() {
    return this.claimButton
      .invoke('text')
      .then(text => text == 'Queue')
  }
}

export default new HomePage()

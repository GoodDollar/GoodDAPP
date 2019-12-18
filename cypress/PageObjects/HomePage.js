/* eslint-disable no-undef */
class HomePage {
  get rewardsButton() {
    return cy.get('[dir="auto"]').eq(0)
  }

  get optionsButton() {
    return cy.get('div[data-focusable="true"]:nth-child(5)')
  }

  get sendButton() {
    return cy.contains('Send')
  }

  get claimButton() {
    return cy.contains('Claim')
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

  // get moneyAmountDiv() {
  //   return cy.get('[data-testid=amount_value]', { timeout: 10000 })
  // }

  get welcomeFeed() {
    return cy.contains('Start claiming free G$')
  }

  get deleteAccountButton() {
    return cy.contains('Delete wallet')
  }

  get confirmDeletionButton() {
    return cy.get('.r-16y2uox.r-nsbfu8.r-bnwqim.r-184en5c').contains('Delete')
  }

  waitForHomePageDisplayed() {
    cy.contains('Claim').should('be.visible')
  }
}

export default new HomePage()

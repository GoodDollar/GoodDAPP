/* eslint-disable no-undef */
class HomePage {
  get rewardsButton() {
    return cy.get('[dir="auto"]').eq(0)
  }

  get optionsButton() {
    return cy.get(':nth-child(4) > .css-901oao')
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
    return cy.get('.r-1efd50x.r-5kkj8d.r-1ydw1k6 [data-focusable="true"]', { timeout: 10000 })
  }

  get profileAvatar() {
    return cy.get('img[alt]', { timeout: 10000 }).eq(0)
  }

  get closeOptionsButton() {
    return cy.get('[dir=auto]', { timeout: 10000 }).eq(0)
  }

  get moneyAmountDiv() {
    return cy.get('[dir="auto"]', { timeout: 10000 }).eq(5)
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

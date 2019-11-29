/* eslint-disable no-undef */
class RewardsPage {
  get pageHeader() {
    return cy.get('[dir="auto"]').eq(1)
  }

  get iframe() {
    return cy.get('iframe[title="Rewards"]')
  }

  get createWalletButton() {
    return 'a[href*="https://goodqa.netlify.com/?web3"]'
  }

  get contentWrapper() {
    return '[class=bg-wrapper]'
  }

  get backButton() {
    return cy.get('[aria-label="Back"]')
  }
}

export default new RewardsPage()

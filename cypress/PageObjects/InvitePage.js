/* eslint-disable no-undef */
class InvitePage {
  get pageHeader() {
    return cy.get('[data-testid="rewards_header"]')
  }

  get iframe() {
    return cy.get('iframe[title="Rewards"]')
  }

  get centerTextDiv() {
    return '.Dashboard-hero-text h2'
  }

  get inviteFriendsDiv() {
    return '.Dashboard-card h4'
  }
}

export default new InvitePage()

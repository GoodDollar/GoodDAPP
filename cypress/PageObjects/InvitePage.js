/* eslint-disable no-undef */
class InvitePage {
  get pageHeader() {
    return cy.get('h1[role="heading"]')
    //return cy.get('[data-testid="rewards_header"]')
  }

  get iframe() {
    return cy.get('iframe[title="Rewards"]')
  }

  get centerTextDiv() {
    //return cy.get('.Dashboard-hero-text h2')
    return 'h2'
  }

  get inviteFriendsDiv() {
    //return cy.get('.Dashboard-card h4')
    return 'h4'
  }
}

export default new InvitePage()

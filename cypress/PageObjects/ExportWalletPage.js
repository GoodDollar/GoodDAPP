/* eslint-disable no-undef */
class ExportWalletPage {
  get titleText() {
    return cy.get('h1').contains('EXPORT MY WALLET')
  }

  get copyKeyButton() {
    return cy.get('[dir="auto"]').contains('Copy Key')
  }

  get copyAddressButton() {
    return cy.get('[dir="auto"]').contains('Copy Address')
  }
}

export default new ExportWalletPage()

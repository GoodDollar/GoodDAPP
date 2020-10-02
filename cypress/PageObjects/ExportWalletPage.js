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

  get walletKeyTitle() {
    return cy.contains('My Wallet Private Key')
  }

  get networkAddressTitle() {
    return cy.contains('Fuse Network RPC Address')
  }

  get networkAddressLink() {
    return cy.contains('https://rpc.fuse.io/')
  }

  get imgAvatar() {
    return cy.get('img[src*="data:image/png;base64"]')
  }
}

export default new ExportWalletPage()

/* eslint-disable no-undef */
class RecoverWalletPage {
  get mnemonicInputs() {
    return cy.get('input', { timeout: 10000 })
  }

  get resendEmailButton() {
    return cy.get('[role="button"]', { timeout: 10000 }).contains('Send me a backup email')
  }

  get successMessageTitle() {
    return cy.contains('Backup Your Wallet')
  }

  get successMessageText() {
    return cy.contains('We sent an email with recovery instructions for your wallet')
  }
}

export default new RecoverWalletPage()

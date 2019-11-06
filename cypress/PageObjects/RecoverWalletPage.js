/* eslint-disable no-undef */
class RecoverWalletPage {
  get mnemonicInputs() {
    return cy.get('input', { timeout: 10000 })
  }

  get resendEmailButton() {
    return cy.get('[role="button"]', { timeout: 10000 }).eq(3)
  }

  get successMessageDiv() {
    return cy.xpath('//*[@id="root"]/div[3]/div/div/div/div/div/div[2]/div[2]/div[2]/div[2]', { timeout: 10000 })
  }
}

export default new RecoverWalletPage()

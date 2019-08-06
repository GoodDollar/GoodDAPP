class LoginPage {

    get mnemonicInputs() {
        return cy.get('input[spellcheck="true"]', { timeout: 10000 } )
    }

    get recoverWalletButton() {
        return cy.get('[dir=auto]', { timeout: 10000 } ).eq(28)
    }

    get errorWindow() {
        return cy.get('[dir=auto]', { timeout: 10000 } ).eq(31)
    }

    get pageHeader() {
        return cy.get('h1[role=heading]', { timeout: 10000 })
    }




}

export default new LoginPage;
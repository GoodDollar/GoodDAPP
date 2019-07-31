class LoginPage {

    get mnemonicInputs() {
        return cy.get('input[spellcheck="true"]', { timeout: 10000 } )
    }

    get recoverWalletButton() {
        return cy.get('.r-qvk6io.r-njp1lv.r-tsynxw', { timeout: 10000 } )
    }

    get errorWindow() {
        return cy.get('.r-nsbfu8.r-bnwqim.r-184en5c', { timeout: 10000 } )
    }




}

export default new LoginPage;
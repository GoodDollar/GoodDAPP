class LoginPage {

    get mnemonicInputs() {
        return cy.get('input[spellcheck="true"]', { timeout: 10000 } )
    }

    get recoverWalletButton() {
        return cy.xpath('/html/body/div/div[1]/div/div[2]/div[2]/div/div/div[3]/div', { timeout: 10000 } )
    }

    get errorWindow() {
        return cy.get('.r-nsbfu8.r-bnwqim.r-184en5c', { timeout: 10000 } )
    }




}

export default new LoginPage;
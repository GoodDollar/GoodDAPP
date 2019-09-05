class StartPage {

    get continueOnWebButton() {
        return cy.contains('Continue on Web')
    }

    get createWalletButton() { 
        return cy.get('div[role=button]').contains('Create a wallet');
    }

    get loginLink() {
        return cy.xpath('/html/body/div/div[1]/div/div[2]/div/div/div/div[2]/div[3]', { timeout: 10000 } );
    }

    open() {
        cy.visit(Cypress.env('baseUrl'));
    }

}

export default new StartPage;
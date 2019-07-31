class StartPage {

    get createWalletButton() { 
        return cy.get('div[role="button"]', { timeout: 10000} );
    }

    get loginLink() {
        return cy.get('.r-rjixqe.r-q4m81j.r-13wfysu.r-3twk1y', { timeout: 10000 } );
    }

    open() {
        cy.visit('/');
    }

}

export default new StartPage;
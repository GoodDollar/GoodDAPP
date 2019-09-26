class w3Page {

    openPage() {
        cy.visit('https://w3.gooddollar.org/');
    }

    get loginTab() {
        return cy.get('div[class=NavBar] a[href="/login"]');
    }

    get emailInput() {
        return cy.get('input[type="email"]');
    }

    get passwordInput() {
        return cy.get('input[type="password"]');
    }

    get loginButton() {
        return cy.get('button[type="submit"]');
    }

    get createWalletButton() {
        return cy.get('a[href*="https://goodqa.netlify.com/?web3"]');
    }

}

export default new w3Page;
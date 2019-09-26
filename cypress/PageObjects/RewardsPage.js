class RewardsPage {

    get pageHeader() {
        return cy.get('h1[role=heading]', { timeout: 10000 })
    }

    get iframe() {
        return cy.get('iframe[title="Rewards"]');
    }

    get createWalletButton() {
        return 'a[href*="https://goodqa.netlify.com/?web3"]'
    }

    get contentWrapper() {
        return '.bg-wrapper'
    }

    get backButton() {
        return cy.get('[aria-label="Back"]')
    }

 
}

export default new RewardsPage;
class RewardsPage {

    get pageHeader() {
        return cy.get('h1[role=heading]', { timeout: 10000 })
    }

    get iframe() {
        return cy.get('iframe[title="Rewards"]');
    }

    get createWalletButton() {
        return 'a[href*="https://dapp.gooddollar.org/?web3"]'
    }

    get contentWrapper() {
        return '.bg-wrapper'
    }

 
}

export default new RewardsPage;
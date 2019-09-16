class HomePage {

    get optionsButton() {
        return cy.get('div[role=button]').eq(0)
    }

    get sendButton() {
        return cy.contains('Send');
    }

    get claimButton() {
        return cy.contains('Claim');
    }

    get receiveButton() {
        return cy.contains('Receive');
    }

    get options() {
        return cy.get('.r-1efd50x.r-5kkj8d.r-1ydw1k6 [data-focusable="true"]', { timeout: 10000 });
    }

    get profileAvatar() {
        return cy.get('img[alt]', { timeout: 10000 }).eq(0);
    }

    get closeOptionsButton() {
        return cy.get('[dir=auto]', { timeout: 10000 }).eq(0);
    }

    get moneyAmountDiv() {
        return cy.get('[dir="auto"]', { timeout: 10000 }).eq(3);
    }

    get welcomeFeed() {
        return cy.get('[data-focusable="true"]').eq(7);
    }

    get deleteAccountButton() {
        return cy.contains('Delete Account');
    }

    get confirmDeletionButton() {
        return cy.contains('Delete');
    }

}

export default new HomePage;
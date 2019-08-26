class HomePage {

    get optionsButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(1)
    }

    get sendButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(2)
    }

    get claimButton() {
        return cy.contains('Claim', { timeout: 10000 });
    }

    get receiveButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(4);
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
        return cy.xpath('/html/body/div/div[1]/div/div[1]/div/div/div[2]/div/div/div[2]/div[9]/div');
    }

    get confirmDeletionButton() {
        return cy.xpath('/html/body/div/div[3]/div/div/div/div/div[2]/div[2]/div/div[3]/div[2]/div');
    }

}

export default new HomePage;
class HomePage {

    get optionsButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(1)
    }

    get sendButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(2)
    }

    get claimButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(3)
    }

    get receiveButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(4)
    }

    get options() {
        return cy.get('.r-1efd50x.r-5kkj8d.r-1ydw1k6 [data-focusable="true"]', { timeout: 10000 })
    }

    get profileAvatar() {
        return cy.get('img[alt]', { timeout: 10000 }).eq(0);
    }

    get closeOptionsButton() {
        return cy.get('[dir=auto]', { timeout: 10000 }).eq(0)
    }

}

export default new HomePage;
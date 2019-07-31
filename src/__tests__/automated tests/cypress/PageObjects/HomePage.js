class HomePage {

    get homePageIdentificator() {
        return cy.get('.r-146eth8.r-u8s1d.r-1v2oles.r-desppf.r-dvx3qi', { timeout: 10000 })
    }

    get interactableElements() {
        return cy.get('div[data-focusable="true"]', { timeout: 10000})
    }

    get optionsButton() {
        return cy.get('.r-bnwqim.r-1otgn73.r-1iww7jx', { timeout: 10000 })
    }

    get options() {
        return cy.get('.r-1efd50x.r-5kkj8d.r-1ydw1k6 [data-focusable="true"]', { timeout: 10000 })
    }

    get profileAvatar() {
        return cy.get('.r-ipm5af.r-13qz1uu.r-1wyyakw', { timeout: 10000 })
    }





}

export default new HomePage;
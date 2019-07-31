class HomePage {

    get sendButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div[1]/div[2]/div[1]/div', { timeout: 10000 })
    }

    get claimButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div[1]/div[2]/div[2]/div/div', { timeout: 10000 })
    }

    get receiveButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div[1]/div[2]/div[3]/div', { timeout: 10000 })
    }

    get optionsButton() {
        return cy.get('.r-bnwqim.r-1otgn73.r-1iww7jx', { timeout: 10000 })
    }

    get options() {
        return cy.get('.r-1efd50x.r-5kkj8d.r-1ydw1k6 [data-focusable="true"]', { timeout: 10000 })
    }

    get profileAvatar() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div[1]/div[1]/div[1]/div/div/div/div', { timeout: 10000 })
    }

    get closeOptionsButton() {
        return cy.get('.css-901oao.r-1niwhzg.r-adyw6z.r-1it3c9n', { timeout: 10000 })
    }

    

   

   





}

export default new HomePage;
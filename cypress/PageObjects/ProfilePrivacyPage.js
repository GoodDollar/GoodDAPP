class ProfilePrivacyPage {

    get pageHeader() {
        return cy.get('h1[role=heading]', { timeout: 10000 })
    }

    get publicNumberButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div[1]/div[2]/div[2]/div[4]/div/div', { timeout: 10000 })
    }

    get publicEmailButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div[1]/div[2]/div[3]/div[4]/div/div', { timeout: 10000 })
    }

    get muskedNumberButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div[1]/div[2]/div[2]/div[3]/div/div', { timeout: 10000 })
    }

    get muskedEmailButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div[1]/div[2]/div[3]/div[3]/div/div', { timeout: 10000 })
    }

    get privateNumberButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div[1]/div[2]/div[2]/div[2]/div/div', { timeout: 10000 })
    }

    get privateEmailButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div[1]/div[2]/div[3]/div[2]/div/div', { timeout: 10000 })
    }

    get saveButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div', { timeout: 10000 })
    }

    get backButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[1]/div/div[1]/div/div/div[2]', { timeout: 10000 })
    }

}

export default new ProfilePrivacyPage;





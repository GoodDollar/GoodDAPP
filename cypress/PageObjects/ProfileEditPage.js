class ProfileEditPage {

    get nameInput() {
        return cy.get('input[placeholder="Choose a Username"]', { timeout: 10000 })
    }

    get phoneInput() {
        return cy.get('#signup_phone', { timeout: 10000 })
    }

    get emailInput() {
        return cy.get('input[placeholder="Add your Email"]', { timeout: 10000 })
    }

    get profileSettingsButton() {
        return cy.get('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div[1]/div[3]/div/div/div', { timeout: 10000 })
    }

    get header() {
        return cy.get('h1[role=heading]', { timeout: 10000 })
    }


    

}

export default new ProfileEditPage;
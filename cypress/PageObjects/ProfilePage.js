class ProfilePage {

    get nameInput() {
        return cy.get('input[placeholder="Choose a Username"]', { timeout: 10000 })
    }

    get phoneInput() {
        return cy.get('input[placeholder="Add your Mobile"]', { timeout: 10000 })
    }

    get emailInput() {
        return cy.get('input[placeholder="Add your Email"]', { timeout: 10000 })
    }

    get profilePrivacyButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div[1]/div[1]/div/div/div', { timeout: 10000 })
    }

    get avatarDiv() {
        return cy.get('.r-ipm5af.r-13qz1uu.r-1wyyakw', { timeout: 10000 })
    }

    get EditProfileButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div[1]/div[3]/div/div', { timeout: 14000 })
    }
    
}

export default new ProfilePage;
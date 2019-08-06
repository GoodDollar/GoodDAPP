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
        return cy.xpath('//*[@id="root"]/div[1]/div/div[2]/div[2]/div/div/div/div[1]/div[1]/div', { timeout: 10000 });
    }

    get avatarDiv() {
        return cy.get('img[alt]', { timeout: 10000 })
    }

    get EditProfileButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div[2]/div[2]/div/div/div/div[1]/div[3]', { timeout: 10000 });
    }
    
}

export default new ProfilePage;
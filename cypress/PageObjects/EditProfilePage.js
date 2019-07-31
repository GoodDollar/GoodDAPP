class EditProfilePage {

    get nameInput() {
        return cy.get('input[placeholder="Choose a Username"]', { timeout: 10000 })
    }

    get phoneInput() {
        return cy.get('#signup_phone', { timeout: 10000 })
    }

    get emailInput() {
        return cy.get('input[placeholder="Add your Email"]', { timeout: 10000 })
    }

    get avatarDiv() {
        return cy.get('.r-ipm5af.r-13qz1uu.r-1wyyakw', { timeout: 10000 })
    }

    get saveButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div[1]/div[2]/div/div/div/span', { timeout: 10000 })
    }

    get pageHeader() {
        return cy.get('h1[role=heading]', { timeout: 10000 })
    }

    get saveAvatarButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div[2]/div/div/div/div/div/span', { timeout: 10000 })
    }

    get selectAvatarButton() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div/div/div[1]/div[3]/div/div', { timeout: 10000 })
    }
    
    get clearAvatarButton() {
        return cy.get('svg[viewBox]', { timeout: 10000 })
    }

    get uploadedAvatar() {
        return cy.get('img[src*=data]', { timeout: 10000 })
    }



}

export default new EditProfilePage;
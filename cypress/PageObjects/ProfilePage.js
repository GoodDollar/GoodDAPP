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
        return cy.get('[data-focusable]', { timeout: 10000 }).eq(2);
    }

    get avatarDiv() {
        return cy.get('img[alt]', { timeout: 10000 })
    }

    get editProfileButton() {
        return cy.get('body').find('[style="font-family: gooddollar; font-size: 25px; font-style: normal;"]', { timeout: 10000 });
    }
 
}

export default new ProfilePage;